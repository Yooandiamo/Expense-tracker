import React from 'react';
import { X, Copy, Smartphone, Zap, ArrowRight } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ShortcutGuide: React.FC<Props> = ({ onClose }) => {
  const currentUrl = window.location.href.split('?')[0];
  const urlParams = `${currentUrl}?text=`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
             <Zap className="w-6 h-6 text-blue-600 fill-current" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">敲一敲记账</h2>
            <p className="text-xs text-gray-500">iOS 快捷指令设置教程</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="relative pl-6 border-l-2 border-blue-100 pb-2">
            <div className="absolute -left-[9px] top-0 bg-blue-600 w-4 h-4 rounded-full border-4 border-white"></div>
            <h3 className="font-bold text-gray-800 mb-1">创建快捷指令</h3>
            <p className="text-sm text-gray-600">
              打开 iPhone 上的 <strong>快捷指令 (Shortcuts)</strong> 应用，点击右上角的 + 号创建新指令。
            </p>
          </section>

          <section className="relative pl-6 border-l-2 border-blue-100 pb-2">
            <div className="absolute -left-[9px] top-0 bg-blue-600 w-4 h-4 rounded-full border-4 border-white"></div>
            <h3 className="font-bold text-gray-800 mb-1">添加操作</h3>
            <div className="space-y-3 mt-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                <span className="font-bold text-gray-700 block mb-1">操作 1：听写文本</span>
                <span className="text-gray-500 text-xs">搜索 "听写文本 (Dictate Text)" 并添加。</span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                <span className="font-bold text-gray-700 block mb-1">操作 2：URL</span>
                <div className="flex items-center gap-2 mt-2 bg-white p-2 rounded border border-gray-200">
                  <code className="text-xs text-blue-600 break-all flex-1 line-clamp-2">{urlParams}</code>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(urlParams);
                        alert('链接已复制！');
                    }}
                    className="text-gray-400 hover:text-blue-600 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  重要：请将 <span className="font-mono bg-gray-200 px-1 rounded">听写文本</span> 变量添加到此 URL 的末尾。
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                 <span className="font-bold text-gray-700 block mb-1">操作 3：打开 URL</span>
                 <span className="text-gray-500 text-xs">搜索 "打开 URL (Open URL)"，将上一步的 URL 传入。</span>
              </div>
            </div>
          </section>

          <section className="relative pl-6 border-l-2 border-transparent">
            <div className="absolute -left-[9px] top-0 bg-blue-600 w-4 h-4 rounded-full border-4 border-white"></div>
            <h3 className="font-bold text-gray-800 mb-1">开启轻点背面</h3>
            <p className="text-sm text-gray-600 mb-3">
              前往 <strong>设置</strong> &rarr; <strong>辅助功能</strong> &rarr; <strong>触控</strong> &rarr; <strong>轻点背面</strong>。
            </p>
            <div className="bg-blue-50 p-4 rounded-xl flex gap-4 items-center">
              <Smartphone className="w-8 h-8 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-800">
                选择 "轻点两下" 并选中你刚才创建的快捷指令。设置完成！现在敲两下手机背面并说话即可记账。
              </p>
            </div>
          </section>
        </div>

        <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl mt-8 hover:bg-black transition-transform active:scale-95 shadow-xl shadow-gray-200 flex items-center justify-center gap-2">
          我准备好了 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
