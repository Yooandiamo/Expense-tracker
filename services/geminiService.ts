import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // 通过 vite.config.ts define 注入的 API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key。请检查 Vercel 环境变量 API_KEY。");
  }

  const now = new Date();
  
  // DeepSeek 提示词 - 针对支付截图优化
  const systemInstruction = `
    你是一个专业的账单识别助手。用户会传入一段来自手机屏幕截图的 OCR 文本（通常是支付宝、微信或银行APP的账单详情页）。
    请分析文本，提取一笔交易的关键信息。

    当前参考时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。

    请严格按照以下逻辑提取字段 (JSON格式):

    1. **amount (数字)**: 交易的实际变动金额。永远返回正数。
       - **关键规则**: 详情页通常包含"订单金额"(原价)和"优惠金额"。请务必提取**实际支付**的金额。
       - 常见布局中，顶部字号最大的数字通常是实付金额。
       - 如果数字带有 "-" 号 (如 -9.70)，取绝对值 (9.70) 并标记为支出。
       - 不要混淆"订单金额" (9.90) 和 "实付金额" (9.70)，选后者。

    2. **type (字符串)**: 
       - "income": 包含 "收到", "收款", "转入", "退款", "+"号。
       - "expense": 包含 "付款", "支付", "消费", "支出", "-"号，或者是一个普通的支付完成页面。

    3. **description (字符串)**: 交易对象、商户名称或商品说明。
       - 优先提取商户名 (如 "魏家凉皮", "星巴克")。
       - 如果是转账，提取 "转给xxx" 或 "xxx的转账"。

    4. **category (字符串)**: 从以下列表中选择最匹配的一个: [${CATEGORIES.join(', ')}]. 
       - 餐饮: 饭店、外卖、食品 (如 肯德基, 麦当劳, 凉皮, 烧烤)。
       - 交通: 打车、地铁、加油 (如 滴滴, 中石化)。
       - 购物: 超市、便利店、电商 (如 7-11, 淘宝, 京东)。

    5. **date (ISO字符串)**: 提取交易发生的具体日期和时间。
       - **关键规则**: 必须精确匹配上下文中的 "支付时间", "交易时间", "创建时间" 等字段。
       - OCR 可能会把时间识别成断行，请尝试组合 (如 "2026-02-11" 和 "20:34:31")。
       - 格式要求: YYYY-MM-DDTHH:mm:ss.sssZ (例如: 2026-02-11T20:34:31.000Z)。
       - 如果文本中包含了明确的日期时间，**绝对不要**使用当前时间。

    示例输入:
    "魏家凉皮 -9.70 交易成功 订单金额 9.90 支付时间 2026-02-11 20:34:31"
    
    示例输出 JSON:
    {"amount": 9.70, "type": "expense", "category": "餐饮", "description": "魏家凉皮", "date": "2026-02-11T20:34:31.000Z"}
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
        temperature: 0.1 // 降低温度，让提取更严谨
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("API Key 无效 (401)。请检查 Vercel 环境变量 API_KEY 是否正确。");
      }
      const errText = await response.text();
      console.error("DeepSeek API Error:", errText);
      throw new Error(`API 请求失败 (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error("AI 未返回内容");

    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleanContent) as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI 解析错误", e);
    throw new Error(e.message || "无法识别截图内容，请确保截图包含金额和文字信息。");
  }
};