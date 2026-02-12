import React, { useState, useEffect } from 'react';
import { parseTransactionWithAI } from '../services/geminiService';
import { ParsedTransactionData, CATEGORIES } from '../types';
import { Button } from './Button';
import { Sparkles, X, Check, ClipboardPaste, ArrowDownCircle, ArrowUpCircle, ScanText } from 'lucide-react';

interface Props {
  onAdd: (data: ParsedTransactionData) => void;
  onClose: () => void;
  initialText?: string;
  autoPaste?: boolean;
}

export const SmartEntry: React.FC<Props> = ({ onAdd, onClose, initialText = '', autoPaste = false }) => {
  const [input, setInput] = useState(initialText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedTransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAutoPasteOverlay, setShowAutoPasteOverlay] = useState(false);

  useEffect(() => {
    if (initialText) {
      handleParse(initialText);
      return;
    }

    if (autoPaste) {
      attemptAutoPaste();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText, autoPaste]);

  const attemptAutoPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        handleParse(text);
      } else {
        setShowAutoPasteOverlay(true);
      }
    } catch (err) {
      console.log("需要用户交互才能读取剪贴板");
      setShowAutoPasteOverlay(true);
    }
  };

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || input;
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setShowAutoPasteOverlay(false);

    try {
      const result = await parseTransactionWithAI(text);
      setParsedData(result);
    } catch (err: any) {
      setError(err.message || "无法识别内容。");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      setError(null);
      if (text.trim()) {
        handleParse(text);
      }
    } catch (err) {
      setError("无法访问剪贴板，请手动粘贴或在设置中允许。");
      setShowAutoPasteOverlay(false);
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      onAdd(parsedData);
      onClose();
    }
  };

  const toLocalISOString = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar relative">
        
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

        {!parsedData ? (
          <>
            <div className="relative mb-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此粘贴识别出的文字..."
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-sm resize-none h-40 font-mono text-gray-600"
                autoFocus={!showAutoPasteOverlay}
              />
              
              <div className="absolute bottom-3 right-3 flex gap-2">
                 <button 
                   onClick={handlePaste}
                   className="bg-white shadow-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-50 active:scale-95 transition-all"
                   title="从剪贴板粘贴"
                 >
                   <ClipboardPaste className="w-4 h-4" /> 粘贴
                 </button>
              </div>

              {showAutoPasteOverlay && (
                <div 
                  onClick={handlePaste}
                  className="absolute inset-0 bg-blue-50/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-blue-200 border-dashed animate-pulse z-10"
                >
                  <div className="bg-blue-100 p-4 rounded-full mb-3 text-blue-600">
                    <ScanText className="w-10 h-10" />
                  </div>
                  <p className="text-blue-700 font-bold text-xl">点击屏幕开始分析</p>
                  <p className="text-blue-400 text-sm mt-2">已从快捷指令跳转</p>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 mb-4 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <Button 
              onClick={() => handleParse()} 
              isLoading={isProcessing} 
              className="w-full"
              disabled={!input.trim()}
            >
              {initialText ? '正在分析...' : '开始分析'}
            </Button>
          </>
        ) : (
          <div className="space-y-5">
             {/* 核心金额卡片 - 支出Green / 收入Red */}
             <div className={`p-5 rounded-2xl border transition-colors ${
               parsedData.type === 'income' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
             }`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex bg-white/60 p-1 rounded-lg">
                     <button
                       onClick={() => setParsedData({...parsedData, type: 'expense'})}
                       className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                         parsedData.type === 'expense' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'
                       }`}
                     >
                       <ArrowUpCircle className="w-3 h-3" /> 支出
                     </button>
                     <button
                       onClick={() => setParsedData({...parsedData, type: 'income'})}
                       className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                         parsedData.type === 'income' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'
                       }`}
                     >
                       <ArrowDownCircle className="w-3 h-3" /> 收入
                     </button>
                  </div>
                  
                  <input 
                    type="datetime-local" 
                    value={toLocalISOString(parsedData.date)}
                    onChange={(e) => {
                      const localVal = e.target.value;
                      if (localVal) {
                        setParsedData({...parsedData, date: new Date(localVal).toISOString()});
                      }
                    }}
                    className="bg-transparent text-xs font-medium text-gray-500 text-right focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <span className={`absolute top-0 left-0 text-xl font-bold ${parsedData.type === 'income' ? 'text-red-600' : 'text-green-600'}`}>¥</span>
                  <input 
                    type="number" 
                    value={parsedData.amount}
                    onChange={(e) => setParsedData({...parsedData, amount: parseFloat(e.target.value)})}
                    className={`block w-full bg-transparent text-4xl font-extrabold pl-6 focus:outline-none focus:ring-0 border-b border-transparent hover:border-black/10 transition-colors ${
                      parsedData.type === 'income' ? 'text-red-700' : 'text-green-700'
                    }`}
                  />
                </div>
             </div>

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