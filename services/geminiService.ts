import { ParsedTransactionData, CATEGORIES } from "../types";

// 使用 DeepSeek API
export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key 未配置");
  }

  const now = new Date();
  const systemInstruction = `
    你是一个专业的记账助手。
    当前时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。
    
    请分析用户的自然语言输入（通常是中文）并提取以下信息：
    1. 金额 (amount): 纯数字。
    2. 分类 (category): 必须从以下列表中选择一个最匹配的: ${CATEGORIES.join(', ')}。
    3. 描述 (description): 简短的中文描述。
    4. 日期 (date): ISO 8601 格式字符串。如果用户说“刚刚”、“刚才”或未指定，使用当前时间。处理“昨天”、“上周五”等相对于当前时间的概念。
    
    必须返回严格的 JSON 格式，不要使用 Markdown 代码块。
    JSON 示例: {"amount": 10, "category": "餐饮", "description": "午饭", "date": "2023-10-01T12:00:00.000Z"}
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
      const errorText = await response.text();
      throw new Error(`DeepSeek API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0]?.message?.content;

    if (!jsonContent) throw new Error("AI 未返回内容");

    return JSON.parse(jsonContent) as ParsedTransactionData;
  } catch (e) {
    console.error("解析 AI 响应失败", e);
    throw new Error("AI 解析失败，请检查 API Key 或网络连接");
  }
};
