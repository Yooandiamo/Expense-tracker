import React from 'react';
import { Transaction } from '../types';
import { Coffee, Car, ShoppingBag, Film, Activity, Home, CreditCard, HelpCircle, ArrowRightLeft, TrendingUp } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export const TransactionCard: React.FC<Props> = ({ transaction, onDelete }) => {
  const dateObj = new Date(transaction.date);
  const isIncome = transaction.type === 'income';
  
  const getIcon = (category: string) => {
    switch(category) {
      case '餐饮': return <Coffee className="w-5 h-5 text-orange-500" />;
      case '交通': return <Car className="w-5 h-5 text-blue-500" />;
      case '购物': return <ShoppingBag className="w-5 h-5 text-pink-500" />;
      case '娱乐': return <Film className="w-5 h-5 text-purple-500" />;
      case '医疗': return <Activity className="w-5 h-5 text-green-500" />;
      case '生活': return <Home className="w-5 h-5 text-yellow-500" />;
      case '工资': return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case '理财': return <TrendingUp className="w-5 h-5 text-red-500" />;
      case '转账': return <ArrowRightLeft className="w-5 h-5 text-indigo-500" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-3 group transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-50' : 'bg-gray-50'}`}>
          {getIcon(transaction.category)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{transaction.description}</h3>
          <p className="text-xs text-gray-400">
            {dateObj.toLocaleDateString('zh-CN', {month: 'short', day: 'numeric'})} • {dateObj.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className={`font-bold block text-lg ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
          {isIncome ? '+' : '-'}¥{transaction.amount.toFixed(2)}
        </span>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
        >
          删除
        </button>
      </div>
    </div>
  );
};