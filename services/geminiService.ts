import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // 适配 Google GenAI SDK，使用 process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const now = new Date();
  const systemInstruction = `
    你是一个专业的记账助手。
    当前时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。
    
    请分析用户的自然语言输入（通常是中文）并提取以下信息：
    1. 金额 (amount): 纯数字。
    2. 分类 (category): 必须从以下列表中选择一个最匹配的: ${CATEGORIES.join(', ')}。
    3. 描述 (description): 简短的中文描述。
    4. 日期 (date): ISO 8601 格式字符串。如果用户说“刚刚”、“刚才”或未指定，使用当前时间。处理“昨天”、“上周五”等相对于当前时间的概念。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
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
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("AI 未返回有效内容");

    return JSON.parse(jsonStr) as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI 解析错误", e);
    throw new Error(e.message || "AI 解析失败，请检查网络或 API Key");
  }
};