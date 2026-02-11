import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key 未配置。");
  }

  const ai = new GoogleGenAI({ apiKey });

  const now = new Date();
  
  const systemInstruction = `
    你是一个专业的账单识别助手。用户会传入一段来自手机屏幕截图的 OCR 文本。
    请分析文本，提取一笔交易的关键信息。

    当前参考时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。

    OCR 文本噪音处理:
    - 忽略顶部状态栏 (如 "9:41", "5G", 电量)。
    - 忽略底部导航栏 (如 "返回", "完成").
    - 优先识别金额最大的数字作为交易金额 (忽略余额)。
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
              description: "交易金额。永远返回正数。",
            },
            type: {
              type: Type.STRING,
              description: "交易类型",
              enum: ["income", "expense"],
            },
            description: {
              type: Type.STRING,
              description: "交易对象或商品名称 (如 '星巴克', '滴滴', '李四的转账').",
            },
            category: {
              type: Type.STRING,
              description: "消费分类",
              enum: CATEGORIES,
            },
            date: {
              type: Type.STRING,
              description: "提取交易发生的具体日期和时间。格式要求: YYYY-MM-DDTHH:mm:ss.sssZ",
            }
          },
          required: ["amount", "type", "description", "category", "date"],
        }
      }
    });

    const cleanContent = response.text;
    if (!cleanContent) throw new Error("AI 未返回内容");
    
    return JSON.parse(cleanContent) as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI 解析错误", e);
    throw new Error(e.message || "无法识别截图内容，请确保截图包含金额和文字信息。");
  }
};