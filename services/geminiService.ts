import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // Use process.env.API_KEY as per Google GenAI guidelines
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const now = new Date();
  
  const systemInstruction = `
    You are a professional accounting assistant.
    Current time: ${now.toISOString()} (${now.toLocaleString('zh-CN')}).
    
    Analyze the user's natural language input (usually Chinese) and extract the following information:
    1. amount: Pure number.
    2. category: Must be one of the following: ${CATEGORIES.join(', ')}.
    3. description: Short Chinese description.
    4. date: ISO 8601 format string. If user says "just now" or unspecified, use current time. Handle relative time like "yesterday".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-