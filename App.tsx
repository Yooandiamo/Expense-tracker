import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, ParsedTransactionData, ViewState } from './types';
import { TransactionCard } from './components/TransactionCard';
import { SmartEntry } from './components/SmartEntry';
import { Stats } from './components/Stats';
import { ShortcutGuide } from './components/ShortcutGuide';
import { Plus, PieChart as ChartIcon, List as ListIcon, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gemini-expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [showSmartEntry, setShowSmartEntry] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [initialSmartText, setInitialSmartText] = useState('');
  const [shouldAutoPaste, setShouldAutoPaste] = useState(false);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('gemini-expenses', JSON.stringify(transactions));
  }, [transactions]);

  // Handle URL Params for iOS Shortcuts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action'); 
    
    // 如果 URL 指示是快捷指令跳转来的
    if (action === 'clipboard' || action === 'create') {
      setShowSmartEntry(true);
      setShouldAutoPaste(true); // 开启自动粘贴尝试
      
      // 清除 URL 参数，避免刷新时重复触发
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // --- Actions ---

  const handleAddTransaction = (data: ParsedTransactionData) => {
    const newTransaction: Transaction = {
      id: uuidv4(),
      ...data,
      createdAt: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowSmartEntry(false);
    setInitialSmartText('');
    setShouldAutoPaste(false);
  };

  const handleUpdateTransaction = (data: ParsedTransactionData) => {
    if (!editingTransaction) return;
    
    setTransactions(prev => prev.map(t => 
      t.id === editingTransaction.id 
        ? { ...t, ...data } // Preserve ID and createdAt, update other fields
        : t
    ));
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteFromEdit = () => {
    if (editingTransaction) {
      handleDelete(editingTransaction.id);
      setEditingTransaction(null);
    }
  };

  // --- Computed ---

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group transactions by Date
  const groupedTransactions = useMemo(() => {
    // 1. Sort by date first
    const sorted = [...transactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 2. Group by "YYYY-MM-DD"
    const groups: { [key: string]: { date: Date, items: Transaction[], totalExpense: number } } = {};
    
    sorted.forEach(t => {
      const dateObj = new Date(t.date);
      // Construct local date string key to group correctly
      const dateKey = dateObj.toLocaleDateString('zh-CN'); 
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateObj,
          items: [],
          totalExpense: 0
        };
      }
      
      groups[dateKey].items.push(t);
      if (t.type === 'expense') {
        groups[dateKey].totalExpense += t.amount;
      }
    });

    // 3. Convert back to array (keys are implicitly roughly sorted because of step 1, but let's be safe)
    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  const formatDateHeader = (date: Date) => {
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const w = weekdays[date.getDay()];
    return `${m}月${d}日 ${w}`;
  };

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-900 max-w-lg mx-auto bg-gray-50 shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <header className="bg-white pt-10 pb-6 px-6 rounded-b-3xl shadow-sm z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">我的账本</h1>
          <button 
            onClick={() => setShowShortcutGuide(true)}
            className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors active:scale-95 border border-blue-100/50"
            aria-label="Setup iOS Shortcut"
          >
            <Zap className="text-blue-600 w-4 h-4 fill-current" />
            <span className="text-blue-700 font-bold text-xs">敲一敲记账</span>
          </button>
        </div>
        
        <div className="flex gap-4">
          {/* Expense - Green */}
          <div className="bg-green-50 px-4 py-3 rounded-2xl flex-1">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <span className="text-xs font-bold text-green-600 uppercase">本月支出</span>
             </div>
             <p className="font-bold text-lg text-green-700">¥{totalExpense.toFixed(2)}</p>
          </div>
           {/* Income - Red */}
           <div className="bg-red-50 px-4 py-3 rounded-2xl flex-1">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-xs font-bold text-red-600 uppercase">本月收入</span>
             </div>
             <p className="font-bold text-lg text-red-700">¥{totalIncome.toFixed(2)}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {view === ViewState.DASHBOARD && (
          <>
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="font-bold text-xl text-gray-800">最近账单</h2>
              <button onClick={() => setView(ViewState.STATS)} className="text-blue-600 text-sm font-medium">查看分析</button>
            </div>
            
            {groupedTransactions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 mx-2">
                <p className="text-gray-400 mb-4">暂无账单</p>
                <div className="flex flex-col gap-3 items-center">
                  <button 
                    onClick={() => {
                      setShouldAutoPaste(false);
                      setShowSmartEntry(true);
                    }}
                    className="text-blue-600 font-medium bg-blue-50 px-6 py-2 rounded-full"
                  >
                    点击 + 开始记账
                  </button>
                  <button
                    onClick={() => setShowShortcutGuide(true)} 
                    className="text-gray-400 text-xs flex items-center gap-1 hover:text-gray-600"
                  >
                    <Zap className="w-3 h-3" /> 设置敲一敲记账
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedTransactions.map((group) => (
                  <div key={group.date.toISOString()}>
                    {/* Date Header */}
                    <div className="flex justify-between items-end px-2 mb-2">
                      <span className="text-xs text-gray-500 font-medium">
                        {formatDateHeader(group.date)}
                      </span>
                      {group.totalExpense > 0 && (
                        <span className="text-xs text-gray-400">
                          支出: <span className="text-green-600 font-bold">{Math.floor(group.totalExpense)}</span>
                        </span>
                      )}
                    </div>
                    
                    {/* List Items */}
                    <div className="space-y-1">
                      {group.items.map(t => (
                        <TransactionCard 
                          key={t.id} 
                          transaction={t} 
                          onClick={() => setEditingTransaction(t)} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === ViewState.STATS && (
          <div className="animate-fade-in">
             <div className="flex items-center mb-4 cursor-pointer px-2" onClick={() => setView(ViewState.DASHBOARD)}>
               <span className="text-blue-600 text-sm font-medium">← 返回账单列表</span>
             </div>
             <Stats transactions={transactions} />
          </div>
        )}
      </main>

      {/* FAB - Magic Add - Lowered slightly to match shorter nav */}
      <div className="fixed bottom-20 right-6 z-20">
         <button 
           onClick={() => {
             setInitialSmartText('');
             setShouldAutoPaste(false);
             setShowSmartEntry(true);
           }}
           className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl shadow-blue-300 flex items-center justify-center transition-transform active:scale-90"
         >
           <Plus className="w-8 h-8" />
         </button>
      </div>

      {/* Bottom Nav - Height reduced from h-20 to h-16, pt-2 removed/adjusted */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe px-6 flex justify-around items-center h-16 z-30 max-w-lg mx-auto right-0">
        <button 
          onClick={() => setView(ViewState.DASHBOARD)}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors ${view === ViewState.DASHBOARD ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <ListIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">首页</span>
        </button>
        <div className="w-12"></div> {/* Spacer for FAB */}
        <button 
          onClick={() => setView(ViewState.STATS)}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors ${view === ViewState.STATS ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <ChartIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">统计</span>
        </button>
      </nav>

      {/* Add Modal */}
      {showSmartEntry && (
        <SmartEntry 
          mode="add"
          onAdd={handleAddTransaction} 
          onClose={() => setShowSmartEntry(false)} 
          initialText={initialSmartText}
          autoPaste={shouldAutoPaste}
        />
      )}

      {/* Edit Modal */}
      {editingTransaction && (
        <SmartEntry 
          key={editingTransaction.id} // Ensure fresh state when switching transactions
          mode="edit"
          initialData={editingTransaction}
          onAdd={handleUpdateTransaction}
          onDelete={handleDeleteFromEdit}
          onClose={() => setEditingTransaction(null)} 
        />
      )}

      {/* Shortcut Guide Modal */}
      {showShortcutGuide && (
        <ShortcutGuide onClose={() => setShowShortcutGuide(false)} />
      )}
    </div>
  );
};

export default App;