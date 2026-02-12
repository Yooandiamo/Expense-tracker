import React, { useState } from 'react';
import { X, Copy, Zap, CheckCircle, Globe, FileText, ClipboardCopy, Scan, ChevronRight } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ShortcutGuide: React.FC<Props> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const baseUrl = window.location.origin + window.location.pathname;
  // 核心：这个 URL 包含了 ?action=clipboard 参数，是快捷指令唯一需要知道的信息
  const shortcutActionUrl = `${baseUrl}?action=clipboard`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortcutActionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full">
               <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-bold text-lg text-gray-900">设置 iOS 快捷指令</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
            <div className="space-y-8">
              
              {/* Step 1: Copy URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                   <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                   <h3 className="font-bold text-gray-800">复制专属链接</h3>
                </div>
                <div className="relative border border-blue-100 bg-blue-50/50 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono truncate select-all">
                      {shortcutActionUrl}
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex-shrink-0 flex items-center gap-1 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Create Shortcut (Visual Match) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                   <h3 className="font-bold text-gray-800">添加 4 个动作 (参照下图)</h3>
                </div>
                
                {/* Simulated iOS Shortcut UI (Dark Mode to match screenshot) */}
                <div className="bg-[#1C1C1E] rounded-xl p-4 space-y-3 shadow-lg border border-gray-800 font-sans mx-1">
                    
                    {/* Action 1: Screenshot */}
                    <div className="flex items-center gap-3 border-b border-gray-700/50 pb-3">
                        <div className="bg-[#3A3A3C] p-2 rounded-lg">
                            <Scan className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-medium text-sm">截屏</span>
                        <div className="ml-auto">
                            <div className="w-4 h-4 bg-[#3A3A3C] rounded-full flex items-center justify-center">
                                <X className="w-2 h-2 text-gray-500" />
                            </div>
                        </div>
                    </div>

                    {/* Action 2: Extract Text */}
                    <div className="flex items-center gap-3 border-b border-gray-700/50 pb-3">
                        <div className="bg-[#007AFF] p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="text-white text-sm font-medium leading-relaxed flex flex-wrap items-center">
                                <span>从</span> 
                                <span className="text-[#007AFF] bg-[#323232] px-1.5 py-0.5 rounded-[6px] mx-1 flex items-center gap-1">
                                   <Scan className="w-3 h-3 opacity-50" /> 截屏
                                </span> 
                                <span>中提取文本</span>
                            </div>
                        </div>
                         <div className="ml-auto self-start">
                            <div className="w-4 h-4 bg-[#3A3A3C] rounded-full flex items-center justify-center">
                                <X className="w-2 h-2 text-gray-500" />
                            </div>
                        </div>
                    </div>

                    {/* Action 3: Copy to Clipboard */}
                    <div className="flex items-center gap-3 border-b border-gray-700/50 pb-3">
                        <div className="bg-[#007AFF] p-2 rounded-lg">
                            <ClipboardCopy className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="text-white text-sm font-medium leading-relaxed">
                                <div className="flex flex-wrap items-center gap-1 mb-1">
                                    <span>将</span>
                                    <span className="text-[#007AFF] bg-[#323232] px-1.5 py-0.5 rounded-[6px] flex items-center gap-1">
                                       <FileText className="w-3 h-3 opacity-50" /> 图像中的文本
                                    </span>
                                    <span>拷贝至</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-[#007AFF]">
                                    <span className="opacity-50">剪贴板</span>
                                    <ChevronRight className="w-3 h-3 opacity-50" />
                                </div>
                            </div>
                        </div>
                         <div className="ml-auto self-start">
                            <div className="w-4 h-4 bg-[#3A3A3C] rounded-full flex items-center justify-center">
                                <X className="w-2 h-2 text-gray-500" />
                            </div>
                        </div>
                    </div>

                    {/* Action 4: Open URL */}
                    <div className="flex items-center gap-3">
                        <div className="bg-[#007AFF] p-2 rounded-lg">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-white text-sm font-medium mb-1 flex items-center gap-2">
                                <span>打开</span>
                                <span className="text-[#007AFF]">https://</span>
                            </div>
                            <div className="text-[#007AFF] text-[10px] bg-[#323232] p-2 rounded-[6px] truncate border border-[#007AFF]/30">
                                {shortcutActionUrl}
                            </div>
                        </div>
                         <div className="ml-auto self-start">
                            <div className="w-4 h-4 bg-[#3A3A3C] rounded-full flex items-center justify-center">
                                <X className="w-2 h-2 text-gray-500" />
                            </div>
                        </div>
                    </div>

                </div>
                <p className="text-xs text-gray-500 px-1 leading-relaxed">
                    * <b>关键点</b>：在第 3 步中，必须点击变量，选择“<b>魔法变量</b>”，然后点击第 2 步生成的“<b>图像中的文本</b>”，否则无法获取文字。
                </p>
              </div>

              {/* Step 3: Back Tap */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                   <h3 className="font-bold text-gray-800">绑定“轻点背面”</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 space-y-1 leading-6 border border-gray-100">
                    <p>1. 打开 iPhone <b>设置</b> → <b>辅助功能</b>。</p>
                    <p>2. 点击 <b>触控</b> → 底部 <b>轻点背面</b>。</p>
                    <p>3. 选择 <b>轻点两下</b> → 选中刚才创建的快捷指令。</p>
                </div>
              </div>

            </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors">
            我设置好了
          </button>
        </div>
      </div>
    </div>
  );
};