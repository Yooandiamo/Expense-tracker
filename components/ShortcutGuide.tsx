import React, { useState } from 'react';
import { X, Copy, Zap, Settings, Smartphone, CheckCircle, Link as LinkIcon, Edit3, Camera, FileText, Clipboard } from 'lucide-react';

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
            <h2 className="font-bold text-lg text-gray-900">如何设置“敲一敲”记账</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
            <div className="space-y-8">
              
              {/* Step 1: Copy URL */}
              <div className="relative border border-blue-100 bg-blue-50/50 rounded-2xl p-4">
                <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                  第一步
                </div>
                <p className="text-sm font-bold text-gray-700 mb-2 mt-1">复制您的专属记账链接</p>
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

              {/* Step 2: Create Shortcut */}
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                  <Edit3 className="w-5 h-5 text-gray-400" />
                  第二步：创建快捷指令
                </h3>
                
                <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-4 ring-white text-xs font-bold text-gray-500">1</span>
                    <p className="text-sm text-gray-700">打开 iPhone <b>「快捷指令」</b> App，点击右上角 <b>+</b> 号。</p>
                  </li>
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-4 ring-white text-xs font-bold text-gray-500">2</span>
                    <p className="text-sm text-gray-700 mb-2">按顺序添加以下 4 个动作：</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100 shadow-sm">
                        {/* Action 1 */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-md border border-gray-200 shadow-sm text-gray-500">
                                <Camera className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">截取屏幕</span>
                        </div>
                        <div className="w-px h-3 bg-gray-300 ml-4"></div>
                        
                        {/* Action 2 */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-md border border-gray-200 shadow-sm text-gray-500">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="text-xs text-gray-600">
                                从 <span className="text-blue-600 font-bold bg-blue-50 px-1 rounded">屏幕截图</span> 中提取文本
                            </div>
                        </div>
                        <div className="w-px h-3 bg-gray-300 ml-4"></div>

                        {/* Action 3 */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-md border border-gray-200 shadow-sm text-gray-500">
                                <Clipboard className="w-4 h-4" />
                            </div>
                            <div className="text-xs text-gray-600">
                                将 <span className="text-blue-600 font-bold bg-blue-50 px-1 rounded">文本</span> 拷贝至剪贴板
                            </div>
                        </div>
                        <div className="w-px h-3 bg-gray-300 ml-4"></div>

                        {/* Action 4 */}
                        <div className="flex items-start gap-3">
                            <div className="bg-white p-1.5 rounded-md border border-gray-200 shadow-sm text-gray-500 mt-0.5">
                                <LinkIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-600 mb-1">
                                    打开 URL
                                </div>
                                <div className="bg-white border border-dashed border-gray-300 rounded p-2 text-[10px] text-gray-400 break-all">
                                    在此处粘贴第一步复制的链接
                                </div>
                            </div>
                        </div>
                    </div>
                  </li>
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-4 ring-white text-xs font-bold text-gray-500">3</span>
                    <p className="text-sm text-gray-700">点击完成，给它起个名字，例如“<b>记一笔</b>”。</p>
                  </li>
                </ol>
              </div>

              {/* Step 3: Back Tap */}
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  第三步：开启“敲一敲”
                </h3>
                <div className="bg-gray-900 text-white p-4 rounded-xl text-xs space-y-3 leading-relaxed shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-700 px-1.5 rounded text-[10px]">设置</span>
                        <span>打开 iPhone <b>设置</b></span>
                    </div>
                    <div className="w-px h-2 bg-gray-700 ml-4"></div>
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-700 px-1.5 rounded text-[10px]">辅助功能</span>
                        <span>找到 <b>辅助功能</b> (Accessibility)</span>
                    </div>
                    <div className="w-px h-2 bg-gray-700 ml-4"></div>
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-700 px-1.5 rounded text-[10px]">触控</span>
                        <span>点击 <b>触控</b> (Touch)</span>
                    </div>
                    <div className="w-px h-2 bg-gray-700 ml-4"></div>
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-700 px-1.5 rounded text-[10px]">轻点背面</span>
                        <span>滑到底部，点击 <b>轻点背面</b> (Back Tap)</span>
                    </div>
                    <div className="w-px h-2 bg-gray-700 ml-4"></div>
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 px-1.5 rounded text-[10px] font-bold">绑定</span>
                        <span>选择 <b>轻点两下</b>，在列表中找到并选中刚刚创建的快捷指令（如“记一笔”）。</span>
                    </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                      <h4 className="text-sm font-bold text-green-800">大功告成！</h4>
                      <p className="text-xs text-green-700 mt-1">
                          现在，在任意界面（比如支付宝账单详情页），敲击手机背面两下，即可自动识别并记账。
                      </p>
                  </div>
              </div>

            </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors">
            我明白了
          </button>
        </div>
      </div>
    </div>
  );
};