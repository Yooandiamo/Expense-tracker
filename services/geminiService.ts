import { ParsedTransactionData, CATEGORIES } from "../types";

export const parseTransactionWithAI = async (text: string): Promise<ParsedTransactionData> => {
  // 1. 获取环境变量 (Vite 标准方式)
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (!apiKey) {
    throw new Error("未配置 API Key。请在 .env 文件中设置 VITE_API_KEY=sk-xxxx");
  }

  const now = new Date();
  
  // 2. 构建 Prompt (针对 OCR 优化)
  const systemInstruction = `
    你是一个智能记账助手。用户会通过 iOS 快捷指令发送一段文本，这段文本通常是**手机屏幕截图的 OCR 识别结果**。
    
    内容可能包含：
    - 支付成功的提示 (如 "支付成功", "交易完成")
    - 很多无关的 UI 噪音 (如 "返回", "完成", 顶部状态栏时间, 电池电量等)
    - 关键交易信息：金额、收款方(商户名)、交易时间。

    当前系统时间: ${now.toISOString()} (${now.toLocaleString('zh-CN')})。

    请严格执行以下任务：
    1. **金额 (amount)**: 提取实际支付金额。忽略余额或积分。
    2. **描述 (description)**: 提取收款方名称或商品名称作为描述 (例如 "星巴克", "滴滴出行", "7-Eleven")。如果找不到，用简短的动作描述 (如 "扫码支付")。
    3. **分类 (category)**: 根据描述自动归类为以下之一: ${CATEGORIES.join(', ')}。
    4. **日期 (date)**: 尝试从文本中提取具体的交易时间。如果文本中包含 "刚刚", "今天" 或未包含具体日期，则使用当前系统时间。
    
    请务必返回合法的 JSON 格式对象，不要包含 Markdown 格式。
    
    OCR 文本示例输入:
    "9:41 4G 
     < 返回
     支付成功
     ¥ 35.50
     收款方
     肯德基(KFC)
     完成"
    
    期望输出:
    {"amount": 35.5, "category": "餐饮", "description": "肯德基", "date": "..."}
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
    throw new Error(e.message || "智能解析失败，无法识别屏幕内容");
  }
};