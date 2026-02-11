import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // 通过 vite.config.ts define 注入的 API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key。请检查 Vercel 环境变量 API_KEY。");
  }

  const now = new Date();
  
  // DeepSeek 提示词
  const systemInstruction = `
    你是一个专业的账单识别助手。用户会传入一段来自手机屏幕截图的 OCR 文本。
    请分析文本，提取一笔交易的关键信息。

    当前参考时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。

    请提取以下字段 (JSON格式):
    1. **amount (数字)**: 交易金额。永远返回正数。
    2. **type (字符串)**: 
       - "income": 如果包含 "收款", "收到", "转入", "退款", "工资", "+"号等关键词。
       - "expense": 如果包含 "付款", "支付", "消费", "支出", "扣款", "-"号，或者是普通的购买页面。
    3. **description (字符串)**: 交易对象或商品名称 (如 "星巴克", "滴滴", "李四的转账")。
    4. **category (字符串)**: 从以下列表中选择最匹配的一个: [${CATEGORIES.join(', ')}]. 
    5. **date (ISO字符串)**: 提取交易发生的具体日期和时间。格式要求: YYYY-MM-DDTHH:mm:ss.sssZ

    示例输出 JSON:
    {"amount": 58.0, "type": "expense", "category": "餐饮", "description": "肯德基", "date": "2023-..."}
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
        temperature: 0.1
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