import React, { useState, useEffect } from 'react';
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
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [initialSmartText, setInitialSmartText] = useState('');

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('gemini-expenses', JSON.stringify(transactions));
  }, [transactions]);

  // Handle URL Params for iOS Shortcuts
  useEffect(() => {
    // Check for query params
    const params = new URLSearchParams(window.location.search);
    const text = params.get('text') || params.get('input') || params.get('q');
    const action = params.get('action'); // Support ?action=create
    
    if (text) {
      setInitialSmartText(text);
      setShowSmartEntry(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (action === 'create' || action === 'add') {
      // Auto open for clipboard paste flow
      setShowSmartEntry(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleAddTransaction = (data: ParsedTransactionData) => {
    const newTransaction: Transaction = {
      id: uuidv4(),
      ...data,
      createdAt: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowSmartEntry(false);
    setInitialSmartText('');
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Calculate Totals based on Type
  const totalBalance = transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-900 max-w-lg mx-auto bg-gray-50 shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <header className="bg-white pt-12 pb-6 px-6 rounded-b-3xl shadow-sm z-10 relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">总资产</p>
            <h1 className={`text-4xl font-extrabold ${totalBalance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
              ¥{Math.abs(totalBalance).toFixed(2)}
            </h1>
          </div>
          <button 
            onClick={() => setShowShortcutGuide(true)}
            className="bg-blue-50 p-3 rounded-full hover:bg-blue-100 transition-colors active:scale-90"
            aria-label="Setup iOS Shortcut"
          >
            <Zap className="text-blue-600 w-6 h-6 fill-current" />
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-red-50 px-4 py-3 rounded-2xl flex-1">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-xs font-bold text-red-400 uppercase">本月支出</span>
             </div>
             <p className="font-bold text-lg text-red-600">¥{totalExpense.toFixed(2)}</p>
          </div>
           <div className="bg-green-50 px-4 py-3 rounded-2xl flex-1">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
               <span className="text-xs font-bold text-green-400 uppercase">本月收入</span>
             </div>
             <p className="font-bold text-lg text-green-600">¥{totalIncome.toFixed(2)}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {view === ViewState.DASHBOARD && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl text-gray-800">最近账单</h2>
              <button onClick={() => setView(ViewState.STATS)} className="text-blue-600 text-sm font-medium">查看分析</button>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 mb-4">暂无账单</p>
                <div className="flex flex-col gap-3 items-center">
                  <button 
                    onClick={() => setShowSmartEntry(true)}
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
              <div className="space-y-1">
                {transactions.slice(0, 10).map(t => (
                  <TransactionCard key={t.id} transaction={t} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}

        {view === ViewState.STATS && (
          <div className="animate-fade-in">
             <div className="flex items-center mb-4 cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
               <span className="text-blue-600 text-sm font-medium">← 返回账单列表</span>
             </div>
             <Stats transactions={transactions} />
          </div>
        )}
      </main>

      {/* FAB - Magic Add */}
      <div className="fixed bottom-24 right-6 z-20">
         <button 
           onClick={() => {
             setInitialSmartText('');
             setShowSmartEntry(true);
           }}
           className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl shadow-blue-300 flex items-center justify-center transition-transform active:scale-90"
         >
           <Plus className="w-8 h-8" />
         </button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 flex justify-around items-center h-20 z-30 max-w-lg mx-auto right-0">
        <button 
          onClick={() => setView(ViewState.DASHBOARD)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === ViewState.DASHBOARD ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <ListIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">首页</span>
        </button>
        <div className="w-12"></div> {/* Spacer for FAB */}
        <button 
          onClick={() => setView(ViewState.STATS)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${view === ViewState.STATS ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <ChartIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">统计</span>
        </button>
      </nav>

      {/* Smart Entry Modal */}
      {showSmartEntry && (
        <SmartEntry 
          onAdd={handleAddTransaction} 
          onClose={() => setShowSmartEntry(false)} 
          initialText={initialSmartText}
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