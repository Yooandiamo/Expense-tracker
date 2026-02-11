import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
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
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { 
              type: Type.NUMBER, 
              description: "The transaction amount." 
            },
            category: { 
              type: Type.STRING, 
              description: `The category of the transaction. Must be one of: ${CATEGORIES.join(', ')}` 
            },
            description: { 
              type: Type.STRING, 
              description: "A short description of the transaction." 
            },
            date: { 
              type: Type.STRING, 
              description: "The date of the transaction in ISO 8601 format." 
            },
          },
          required: ["amount", "category", "description", "date"],
        },
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("AI did not return any text.");
    }

    return JSON.parse(jsonText) as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI Parsing Error", e);
    throw new Error(e.message || "AI parsing failed");
  }
};