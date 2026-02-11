import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("未配置 API Key。请确保 process.env.API_KEY 已设置。");
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
    - 如果完全找不到时间，使用当前时间。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: text,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { 
            type: Type.NUMBER, 
            description: "交易金额。永远返回正数。" 
          },
          type: { 
            type: Type.STRING, 
            enum: ["income", "expense"],
            description: "income: 如果包含 '收款', '收到', '转入' 等; expense: 如果包含 '付款', '支付', '消费' 等。" 
          },
          description: { 
            type: Type.STRING, 
            description: "交易对象或商品名称 (如 '星巴克', '滴滴')" 
          },
          category: { 
            type: Type.STRING, 
            enum: CATEGORIES,
            description: "从列表中选择最匹配的一个" 
          },
          date: { 
            type: Type.STRING, 
            description: "交易时间 (ISO 8601 格式)" 
          }
        },
        required: ["amount", "type", "description", "category", "date"]
      }
    }
  });

  const jsonStr = response.text;

  if (!jsonStr) throw new Error("AI 未返回内容");

  try {
    return JSON.parse(jsonStr) as ParsedTransactionData;
  } catch (e) {
    console.error("JSON Parse Error", e);
    throw new Error("无法解析 AI 返回的数据");
  }
};
