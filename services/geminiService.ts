import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // 通过 vite.config.ts define 注入的 API_KEY
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key");
  }

  // 【步骤1】正则表达式暴力提取日期 (作为 AI 的强力辅助/修正)
  // 解决 AI 偶尔犯傻或忽略 OCR 中日期的 bug
  // 匹配格式: 2026-02-11 20:34:31, 2026/02/11 20:34, 2026年2月11日...
  const dateRegex = /(\d{4})[-年/.](\d{1,2})[-月/.](\d{1,2})[\sT]+(\d{1,2})[:：](\d{1,2})(:(\d{1,2}))?/;
  const dateMatch = text.match(dateRegex);
  let regexDate: string | null = null;
  
  if (dateMatch) {
      try {
          const [_, y, m, d, h, min, __, s] = dateMatch;
          const date = new Date(
            parseInt(y), 
            parseInt(m) - 1, 
            parseInt(d), 
            parseInt(h), 
            parseInt(min), 
            s ? parseInt(s) : 0
          );
          if (!isNaN(date.getTime())) {
              regexDate = date.toISOString();
              console.log("Regex extracted date:", regexDate);
          }
      } catch (e) {
          console.warn("Regex date parse failed", e);
      }
  }

  const now = new Date();
  
  // 【步骤2】构建 DeepSeek 提示词
  const systemInstruction = `
    你是一个财务助理。请从 OCR 文本中提取交易。
    
    规则：
    1. **金额**: 找最大的数字。优先找带"-"号的数字(如 -9.70)，取绝对值。不要取"订单金额"的原价。
    2. **类型**: 支出(expense)或收入(income)。
    3. **分类**: 选一个: [${CATEGORIES.join(', ')}].
    4. **商户**: 第一行通常是商户名。
    5. **时间**: 必须提取。如果找不到，才用当前时间。

    返回 JSON: {"amount": number, "type": "expense"|"income", "category": "string", "description": "string", "date": "ISO string"}
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
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content;

    if (!content) throw new Error("AI 未返回内容");

    // 【步骤3】鲁棒的 JSON 提取 (防止 Markdown 污染)
    // 找到第一个 { 和最后一个 }
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        content = content.substring(firstBrace, lastBrace + 1);
    }
    
    const parsed = JSON.parse(content);

    // 【步骤4】日期修正策略
    // 如果正则提取到了有效日期，且 AI 提取的日期是当前时间(或者 AI 没提取到)，强制使用正则的日期。
    // 这解决了 OCR 文本太长被截断导致 AI 看不到底部日期的问题(如果正则能扫到的话)，或者 AI 偷懒的问题。
    if (regexDate) {
        // 如果 AI 返回的日期是今天(意味着它可能用了 fallback)，或者 AI 根本没返回日期
        // 直接信任正则，因为 OCR 里的日期通常是真理
        parsed.date = regexDate;
    } else {
        // 如果正则也没提取到，确保 AI 返回了有效日期
        if (!parsed.date || isNaN(new Date(parsed.date).getTime())) {
            parsed.date = new Date().toISOString();
        } else {
            // 规范化 AI 返回的日期
            parsed.date = new Date(parsed.date).toISOString();
        }
    }

    return parsed as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI Parsing Error:", e);
    throw new Error(e.message || "无法识别账单，请检查截图清晰度。");
  }
};