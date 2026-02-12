import React from 'react';
import { X, Copy, Zap, ArrowRight, ScanText, Globe, Image, Link } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ShortcutGuide: React.FC<Props> = ({ onClose }) => {
  const baseUrl = window.location.origin + window.location.pathname;
  // 基础 URL，用户需要自己在快捷指令里拼接
  const urlPrefix = `${baseUrl}?text=`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(urlPrefix);
    alert('网址前缀已复制！请在快捷指令中使用。');
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
            <h2 className="font-bold text-xl text-gray-900">极速记账 (无需点击)</h2>
            <p className="text-xs text-gray-500">通过 URL 传参实现全自动识别</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="relative pl-8 border-l-2 border-blue-100">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">1</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-500" />
              第一步：提取文本
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              快捷指令操作：<strong>"截取屏幕"</strong> <br/>
              接操作：<strong>"从图像中提取文本"</strong>
            </p>
          </div>

          {/* Step 2 - URL Encode */}
          <div className="relative pl-8 border-l-2 border-blue-100">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">2</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Link className="w-4 h-4 text-blue-500" />
              第二步：URL 编码 (关键!)
            </h3>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-yellow-400">
              <p className="mb-2">为了防止文字中的空格和特殊符号导致网址断裂，必须编码。</p>
              <p>添加操作：<strong>"对文本进行 URL 编码"</strong></p>
              <p className="text-xs text-gray-400 mt-1">输入选择上一步的“文本”</p>
            </div>
          </div>

          {/* Step 3 - Open URL */}
          <div className="relative pl-8 border-l-2 border-transparent">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">3</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              第三步：拼接并打开
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-3">
              <p>添加操作：<strong>"打开 URL"</strong></p>
              <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
                <p className="text-xs text-blue-500 mb-1 font-bold">URL 填写格式：</p>
                <div className="flex items-center gap-2 mb-2">
                   <code className="text-xs text-gray-500 break-all">
                    {urlPrefix}<span className="bg-yellow-100 text-yellow-800 px-1 rounded">[URL编码后的文本]</span>
                   </code>
                </div>
                <button onClick={copyToClipboard} className="w-full text-center text-blue-600 bg-blue-50 py-2 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors">
                  <Copy className="w-3 h-3 inline mr-1" /> 复制网址前缀
                </button>
              </div>
              <p className="text-gray-500 text-xs">
                 在快捷指令的 URL 栏中，先粘贴上面的前缀，然后点击键盘上方的变量区，选择上一步的<strong>“URL 编码后的文本”</strong>拼在后面。
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