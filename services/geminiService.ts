import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTransactionData, CATEGORIES } from "../types";

// 使用 Google GenAI SDK
export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key 未配置。请在环境变量中添加 API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  const now = new Date();
  const systemInstruction = `
    你是一个专业的记账助手。
    当前时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。
    
    请分析用户的自然语言输入（通常是中文）并提取以下信息：
    1. 金额 (amount): 纯数字。
    2. 分类 (category): 必须从以下列表中选择一个最匹配的: ${CATEGORIES.join(', ')}。
    3. 描述 (description): 简短的中文描述。
    4. 日期 (date): ISO 8601 格式字符串。如果用户说“刚刚”、“刚才”或未指定，使用当前时间。处理“昨天”、“上周五”等相对于当前时间的概念。
    
    必须返回严格的 JSON 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
          },
          required: ['amount', 'category', 'description', 'date'],
        },
      }
    });

    const jsonContent = response.text;
    if (!jsonContent) throw new Error("AI 未返回内容");

    return JSON.parse(jsonContent) as ParsedTransactionData;
  } catch (e) {
    console.error("解析 AI 响应失败", e);
    throw new Error("AI 解析失败，请检查 API Key 或网络连接");
  }
};