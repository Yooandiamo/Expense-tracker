import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key。请检查 Vercel 环境变量 API_KEY。");
  }

  const now = new Date();
  
  // 核心优化：针对支付宝/微信 OCR 结果的特定提示词
  const systemInstruction = `
    你是一个专门处理“支付宝/微信/银行APP”账单截图 OCR 文本的 AI 引擎。
    用户的输入是一段混乱的 OCR 文本。你的任务是提取真实的交易详情。

    当前时间是: ${now.toISOString()}。

    请严格遵守以下【提取规则】：

    1. **金额 (amount)**:
       - **核心逻辑**: 寻找页面上字号最大的数字，或者位于“交易成功/支付成功”附近的数字。
       - **负号处理**: 如果看到类似 "-9.70" 或 "- 9.70" 的数字，这是【实付金额】。请取绝对值 (9.70)。
       - **干扰项排除**: 如果文本中同时出现 "订单金额 9.90" 和 "-9.70"，**必须**取 "-9.70" (实付)。永远不要取“订单金额/原价”，除非没有其他数字。
       - 必须返回正数数字 (Number类型)。

    2. **类型 (type)**:
       - 如果金额带有 "-" 号，或者文本包含 "付款"、"支付"、"支出"，则是 "expense"。
       - 如果金额带有 "+" 号，或者文本包含 "收款"、"收到"、"退款"、"入账"，则是 "income"。
       - 默认为 "expense"。

    3. **日期 (date)**:
       - **最高优先级**: 必须从文本中提取“支付时间”、“交易时间”、“创建时间”后的时间串。
       - 格式通常为: "YYYY-MM-DD HH:mm:ss" 或 "YYYY年MM月DD日 HH:mm"。
       - **如果OCR文本中包含了具体的日期时间（如 2026-02-11），绝对不要使用当前时间！**
       - 请将提取到的时间转换为 ISO 格式字符串 (YYYY-MM-DDTHH:mm:ss.000Z)。

    4. **描述 (description)**:
       - 提取商户名称（通常在金额上方或第一行，如 "魏家凉皮"）。
       - 或者是商品说明（如 "餐饮美食-订单"）。

    5. **分类 (category)**:
       - 从以下列表中选择: [${CATEGORIES.join(', ')}].
       - 根据商户名自动推断 (例: 魏家凉皮->餐饮, 滴滴->交通, 超市->购物)。

    【示例 1 - 支付宝支出】
    输入: "魏家凉皮(回龙观店) -9.70 交易成功 订单金额 9.90 优惠 -0.20 支付时间 2026-02-11 20:34:31"
    输出: {"amount": 9.70, "type": "expense", "description": "魏家凉皮(回龙观店)", "category": "餐饮", "date": "2026-02-11T20:34:31.000Z"}

    【示例 2 - 微信收入】
    输入: "收到转账 +200.00 交易时间 2025-01-01 10:00:00 来自李四"
    输出: {"amount": 200.00, "type": "income", "description": "李四转账", "category": "转账", "date": "2025-01-01T10:00:00.000Z"}
  `;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1 // 极低温度，防止由于OCR乱码导致的幻觉
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API Error:", errText);
      throw new Error(`识别请求失败 (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error("AI 未返回内容");

    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    // 二次校验日期格式，确保前端 <input type="datetime-local"> 能正确显示
    // 如果 AI 返回了 ISO 字符串，直接使用；如果返回了无效日期，兜底为当前时间
    if (parsed.date) {
        const dateObj = new Date(parsed.date);
        if (!isNaN(dateObj.getTime())) {
            parsed.date = dateObj.toISOString();
        } else {
             parsed.date = new Date().toISOString();
        }
    } else {
        parsed.date = new Date().toISOString();
    }

    return parsed as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI 解析错误", e);
    throw new Error("无法从截图中提取有效账单信息，请确保包含金额和商户名。");
  }
};