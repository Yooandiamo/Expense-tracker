import React, { useState, useEffect } from 'react';
import { parseTransactionWithAI } from '../services/geminiService';
import { ParsedTransactionData, CATEGORIES } from '../types';
import { Button } from './Button';
import { Sparkles, X, Check, Mic } from 'lucide-react';

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

  // Auto-process if initialText is provided (e.g. from URL/Shortcut)
  useEffect(() => {
    if (initialText) {
      handleParse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParse = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await parseTransactionWithAI(input);
      setParsedData(result);
    } catch (err: any) {
      setError(err.message || "无法理解该内容。请尝试 '午餐 15 元' 这样的格式");
      console.error(err);
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold text-lg">AI 智能记账 (DeepSeek)</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!parsedData ? (
          <>
            <div className="relative mb-6">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例如：'刚刚打车去市区花了 25 元'"
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-lg resize-none h-32"
                autoFocus
              />
              <div className="absolute bottom-3 right-3 text-gray-400">
                <Mic className="w-5 h-5" />
              </div>
            </div>

            {error && <p className="text-red-500 mb-4 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <Button 
              onClick={handleParse} 
              isLoading={isProcessing} 
              className="w-full"
              disabled={!input.trim()}
            >
              开始分析
            </Button>
          </>
        ) : (
          <div className="space-y-4">
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-blue-400 uppercase font-bold tracking-wider">金额</label>
                    <input 
                      type="number" 
                      value={parsedData.amount}
                      onChange={(e) => setParsedData({...parsedData, amount: parseFloat(e.target.value)})}
                      className="block w-full bg-transparent text-2xl font-bold text-blue-900 border-b border-blue-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-blue-400 uppercase font-bold tracking-wider">日期</label>
                    <input 
                      type="datetime-local" 
                      value={parsedData.date.substring(0, 16)}
                      onChange={(e) => setParsedData({...parsedData, date: new Date(e.target.value).toISOString()})}
                      className="block w-full bg-transparent text-sm font-medium text-blue-900 pt-2 border-b border-blue-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
             </div>

             <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 block">描述</label>
                <input 
                  type="text" 
                  value={parsedData.description}
                  onChange={(e) => setParsedData({...parsedData, description: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>

             <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1 block">分类</label>
                <div className="flex flex-wrap gap-2">
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

             <div className="flex gap-3 mt-6">
               <Button variant="secondary" onClick={() => setParsedData(null)} className="flex-1">返回</Button>
               <Button onClick={handleConfirm} className="flex-1">
                 <Check className="w-5 h-5 mr-2" /> 保存
               </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};