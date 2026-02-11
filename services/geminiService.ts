import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // 使用 process.env.API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key。请确保 process.env.API_KEY 可用。");
  }

  const ai = new GoogleGenAI({ apiKey });
  const now = new Date();

  const prompt = `
    你是一个专业的记账助手。
    当前时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。
    
    请分析用户的自然语言输入（通常是中文）并提取以下信息：
    1. 金额 (amount): 纯数字。
    2. 分类 (category): 必须从列表 [${CATEGORIES.join(', ')}] 中选择一个最匹配的。
    3. 描述 (description): 简短的中文描述。
    4. 日期 (date): ISO 8601 格式字符串。如果用户说“刚刚”、“刚才”或未指定，使用当前时间。处理“昨天”、“上周五”等相对于当前时间的概念。
    
    用户输入: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "金额" },
            category: { type: Type.STRING, enum: CATEGORIES, description: "分类" },
            description: { type: Type.STRING, description: "描述" },
            date: { type: Type.STRING, description: "ISO 8601 日期" }
          },
          required: ["amount", "category", "description", "date"]
        }
      }
    });

    const content = response.text;
    if (!content) {
      throw new Error("AI 未返回有效内容");
    }

    return JSON.parse(content) as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI 解析错误", e);
    throw new Error(e.message || "解析失败，请检查网络或 API Key");
  }
};