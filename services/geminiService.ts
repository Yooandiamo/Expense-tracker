import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // 1. 获取环境变量 (Vite 标准方式)
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key。请在 .env 文件中设置 VITE_API_KEY=sk-xxxx");
  }

  const now = new Date();
  
  // 2. 构建 Prompt
  const systemInstruction = `
    你是一个专业的记账助手。
    当前时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。
    
    请分析用户的自然语言输入（通常是中文）并提取以下信息：
    1. 金额 (amount): 纯数字。
    2. 分类 (category): 必须从以下列表中选择一个最匹配的: ${CATEGORIES.join(', ')}。
    3. 描述 (description): 简短的中文描述。
    4. 日期 (date): ISO 8601 格式字符串。如果用户说“刚刚”、“刚才”或未指定，使用当前时间。处理“昨天”、“上周五”等相对于当前时间的概念。
    
    请务必返回合法的 JSON 格式对象，不要包含 Markdown 格式（如 \`\`\`json）。
    JSON 示例: {"amount": 10, "category": "餐饮", "description": "午饭", "date": "2023-10-01T12:00:00.000Z"}
  `;

  try {
    // 3. 调用 DeepSeek API
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
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI 未返回有效内容");
    }

    // 4. 清理可能存在的 Markdown 标记并解析 JSON
    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();

    return JSON.parse(cleanContent) as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI 解析错误", e);
    throw new Error(e.message || "智能解析失败，请检查网络或 API Key 设置");
  }
};