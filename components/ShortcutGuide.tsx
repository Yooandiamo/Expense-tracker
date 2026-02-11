import React from 'react';
import { X, Copy, Smartphone, Zap, ArrowRight, Mic, Globe, MousePointerClick } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ShortcutGuide: React.FC<Props> = ({ onClose }) => {
  // 获取当前部署的 URL 基础路径，不带参数
  const baseUrl = window.location.origin + window.location.pathname;
  // 构造基础查询参数
  const urlPrefix = `${baseUrl}?text=`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(urlPrefix);
    alert('链接前缀已复制！请粘贴到快捷指令的 URL 栏中');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-3 mb-6 sticky top-0 bg-white/95 backdrop-blur py-2 border-b border-gray-100 z-0">
          <div className="bg-blue-100 p-3 rounded-full">
             <Zap className="w-6 h-6 text-blue-600 fill-current" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">敲一敲记账设置</h2>
            <p className="text-xs text-gray-500">只需 3 步，解放双手</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <div className="relative pl-8 border-l-2 border-blue-100">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">1</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-500" />
              添加 "听写文本"
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              打开快捷指令 App，新建指令，搜索添加 <strong>"听写文本"</strong> (Dictate Text) 操作。
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8 border-l-2 border-blue-100">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">2</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              添加 "打开 URL"
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-3">
              <p className="text-gray-600">搜索添加 <strong>"打开 URL"</strong> (Open URL) 操作。</p>
              
              <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
                <p className="text-xs text-blue-500 mb-1 font-bold">先复制这个链接前缀：</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate text-gray-700 font-mono">
                    {urlPrefix}
                  </code>
                  <button onClick={copyToClipboard} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600">
                1. 将上方链接粘贴到 URL 框中。<br/>
                2. 光标放在 <code>text=</code> 后面。<br/>
                3. 在变量栏选择 <strong>"听写文本"</strong> 变量。
              </p>
              
              <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded border border-dashed border-gray-300">
                最终样子: <span className="text-gray-600">{baseUrl}?text=</span><span className="bg-blue-200 text-blue-800 px-1 rounded mx-1">听写文本</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-8 border-l-2 border-transparent">
            <div className="absolute -left-[11px] top-0 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">3</div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              设置 "轻点背面"
            </h3>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800 leading-relaxed">
                前往 <strong>设置 &gt; 辅助功能 &gt; 触控 &gt; 轻点背面</strong>。<br/>
                选择 "轻点两下"，然后勾选你刚才创建的快捷指令。
              </p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl mt-8 hover:bg-black transition-transform active:scale-95 shadow-xl shadow-gray-200 flex items-center justify-center gap-2">
          设置好了，去试试！ <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};