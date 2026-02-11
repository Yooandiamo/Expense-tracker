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
  // 优化：允许日期和时间中间有多个空格 ([\sT]+)
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
              console.log("Regex extracted date (UTC):", regexDate);
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
       - 遇到 "蚂蚁财富"、"基金"、"证券"、"股票" -> 归类为 "理财"。
       - 遇到 "魏家凉皮"、"麦当劳" -> 归类为 "餐饮"。
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
    if (regexDate) {
        // 如果正则提取到了日期，优先使用正则的结果（因为正则解析的是本地时间转ISO，准确度高）
        parsed.date = regexDate;
    } else {
        if (!parsed.date || isNaN(new Date(parsed.date).getTime())) {
            parsed.date = new Date().toISOString();
        } else {
            parsed.date = new Date(parsed.date).toISOString();
        }
    }

    return parsed as ParsedTransactionData;
  } catch (e: any) {
    console.error("AI Parsing Error:", e);
    throw new Error(e.message || "无法识别账单，请检查截图清晰度。");
  }
};