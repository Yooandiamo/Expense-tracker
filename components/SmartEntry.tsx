import React, { useState, useEffect } from 'react';
import { parseTransactionWithAI } from '../services/geminiService';
import { ParsedTransactionData, CATEGORIES } from '../types';
import { Button } from './Button';
import { Sparkles, X, Check, Mic, ScanText, ArrowDownCircle, ArrowUpCircle, Key } from 'lucide-react';

interface Props {
  onAdd: (data: ParsedTransactionData) => void;
  onClose: () => void;
  initialText?: string;
}

export const SmartEntry: React.FC<Props> = ({ onAdd, onClose, initialText = '' }) => {
  const [input, setInput] = useState(initialText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedTransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API Key 逻辑
  const envApiKey = import.meta.env.VITE_API_KEY;
  const [manualApiKey, setManualApiKey] = useState(() => {
    return localStorage.getItem('deepseek_api_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(!envApiKey && !manualApiKey);

  useEffect(() => {
    // 如果有初始文本且已有 Key (无论是环境变量还是手填的)，自动开始
    if (initialText && (envApiKey || manualApiKey)) {
      handleParse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveKey = (key: string) => {
    setManualApiKey(key);
    localStorage.setItem('deepseek_api_key', key);
  };

  const handleParse = async () => {
    if (!input.trim()) return;
    
    // 检查 Key
    const effectiveKey = envApiKey || manualApiKey;
    if (!effectiveKey) {
      setError("请先配置 API Key");
      setShowKeyInput(true);
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      // 传入 effectiveKey
      const result = await parseTransactionWithAI(input, effectiveKey);
      setParsedData(result);
    } catch (err: any) {
      setError(err.message || "无法识别内容。请确保截图包含清晰的金额和商户信息。");
      console.error(err);
      
      // 如果是 Key 错误，显示输入框让用户重新输入
      if (err.message && (err.message.includes("API Key") || err.message.includes("401"))) {
        setShowKeyInput(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      onAdd(parsedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold text-lg">
              {parsedData ? '识别结果' : 'AI 智能记账'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* API Key 设置区域 (如果未配置或出错时显示) */}
        {!envApiKey && (showKeyInput || error?.includes("API Key")) && !parsedData && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
            <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold text-sm">
              <Key className="w-4 h-4" />
              配置 DeepSeek API Key
            </div>
            <input
              type="password"
              value={manualApiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-2 border border-yellow-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2"
            />
            <p className="text-[10px] text-yellow-600">
              Key 将安全存储在您的本地浏览器中。
            </p>
          </div>
        )}

        {!parsedData ? (
          <>
            <div className="relative mb-6">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="正在等待快捷指令输入，或在此粘贴文字..."
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-lg resize-none h-32"
                autoFocus
              />
              <div className="absolute bottom-3 right-3 text-gray-400">
                {initialText ? <ScanText className="w-5 h-5 animate-pulse text-blue-500" /> : <Mic className="w-5 h-5" />}
              </div>
            </div>

            {error && <p className="text-red-500 mb-4 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <Button 
              onClick={handleParse} 
              isLoading={isProcessing} 
              className="w-full"
              disabled={!input.trim()}
            >
              {initialText ? '正在分析屏幕...' : '开始分析'}
            </Button>
            
            {!envApiKey && !showKeyInput && (
              <button 
                onClick={() => setShowKeyInput(true)}
                className="w-full mt-4 text-xs text-gray-400 underline"
              >
                更新 API Key
              </button>
            )}
          </>
        ) : (
          <div className="space-y-5">
             {/* 核心金额卡片 */}
             <div className={`p-5 rounded-2xl border transition-colors ${
               parsedData.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
             }`}>
                <div className="flex justify-between items-center mb-4">
                  {/* 类型切换开关 */}
                  <div className="flex bg-white/60 p-1 rounded-lg">
                     <button
                       onClick={() => setParsedData({...parsedData, type: 'expense'})}
                       className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                         parsedData.type === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'
                       }`}
                     >
                       <ArrowUpCircle className="w-3 h-3" /> 支出
                     </button>
                     <button
                       onClick={() => setParsedData({...parsedData, type: 'income'})}
                       className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                         parsedData.type === 'income' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'
                       }`}
                     >
                       <ArrowDownCircle className="w-3 h-3" /> 收入
                     </button>
                  </div>
                  
                  {/* 日期选择 */}
                  <input 
                    type="datetime-local" 
                    value={parsedData.date.substring(0, 16)}
                    onChange={(e) => setParsedData({...parsedData, date: new Date(e.target.value).toISOString()})}
                    className="bg-transparent text-xs font-medium text-gray-500 text-right focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <span className={`absolute top-0 left-0 text-xl font-bold ${parsedData.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>¥</span>
                  <input 
                    type="number" 
                    value={parsedData.amount}
                    onChange={(e) => setParsedData({...parsedData, amount: parseFloat(e.target.value)})}
                    className={`block w-full bg-transparent text-4xl font-extrabold pl-6 focus:outline-none focus:ring-0 border-b border-transparent hover:border-black/10 transition-colors ${
                      parsedData.type === 'income' ? 'text-green-700' : 'text-red-700'
                    }`}
                  />
                </div>
             </div>

             {/* 详细信息表单 */}
             <div className="space-y-4">
               <div>
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 block">商户 / 描述</label>
                  <input 
                    type="text" 
                    value={parsedData.description}
                    onChange={(e) => setParsedData({...parsedData, description: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800"
                  />
               </div>

               <div>
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">分类</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setParsedData({...parsedData, category: cat})}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          parsedData.category === cat 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
             </div>

             <div className="flex gap-3 pt-2">
               <Button variant="secondary" onClick={() => setParsedData(null)} className="flex-1">重试</Button>
               <Button onClick={handleConfirm} className="flex-1 py-4 text-lg">
                 <Check className="w-5 h-5 mr-2" /> 确认记账
               </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};