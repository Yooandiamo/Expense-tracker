import React from 'react';
import { X, Copy, Smartphone, Zap, ArrowRight, ScanText, Globe, Image, ClipboardCopy } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ShortcutGuide: React.FC<Props> = ({ onClose }) => {
  const baseUrl = window.location.origin + window.location.pathname;
  const urlPrefix = `${baseUrl}?action=create`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(urlPrefix);
    alert('网址已复制！');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-3 mb-6 sticky top-0 bg-white/95 backdrop-blur py-2 border-b border-gray-100 z-0">
          <div className="bg-blue-100 p-3 rounded-full">
             <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">敲一敲记账 (防截断版)</h2>
            <p className="text-xs text-gray-500">更精准的文字提取流程</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="relative pl-8 border-l-2 border-blue-100">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">1</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-500" />
              第一步：截取屏幕
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              新建快捷指令，搜索并添加 <strong>"截取屏幕"</strong>。
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8 border-l-2 border-blue-100">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">2</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <ScanText className="w-4 h-4 text-blue-500" />
              第二步：提取文本
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              添加 <strong>"从图像中提取文本"</strong> (OCR)。
            </p>
          </div>

          {/* Step 3 - COPY */}
          <div className="relative pl-8 border-l-2 border-blue-100">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">3</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <ClipboardCopy className="w-4 h-4 text-blue-500" />
              第三步：拷贝至剪贴板
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-yellow-400">
              <span className="font-bold block text-yellow-600 mb-1">关键步骤！</span>
              添加 <strong>"拷贝至剪贴板"</strong>。
              <br/>
              <span className="text-xs mt-1 block opacity-75">直接把文字传给网页会被截断导致日期丢失，拷贝更稳！</span>
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative pl-8 border-l-2 border-transparent">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">4</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              第四步：打开记账页
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-3">
              <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
                <p className="text-xs text-blue-500 mb-1 font-bold">记账页网址：</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate text-gray-700 font-mono">
                    {urlPrefix}
                  </code>
                  <button onClick={copyToClipboard} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                 指令运行后，会自动打开网页。只需点击输入框下方的 <strong>"粘贴"</strong> 按钮即可！
              </p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl mt-6 hover:bg-black transition-transform active:scale-95 shadow-xl shadow-gray-200 flex items-center justify-center gap-2">
          我知道了，去修改指令 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};