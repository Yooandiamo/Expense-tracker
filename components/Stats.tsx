import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export const Stats: React.FC<Props> = ({ transactions }) => {
  // 当前查看的日期（默认为当前月）
  const [currentDate, setCurrentDate] = useState(new Date());

  // 切换月份
  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  // 格式化年月显示
  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };

  // 筛选当前月份的数据
  const monthlyData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === month;
    });
  }, [transactions, currentDate]);

  // 计算该月总收支
  const { totalExpense, totalIncome, expenseData } = useMemo(() => {
    let expense = 0;
    let income = 0;
    const categoryMap = new Map<string, number>();

    monthlyData.forEach(t => {
      if (t.type === 'expense') {
        expense += t.amount;
        // 聚合分类数据
        const currentVal = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, currentVal + t.amount);
      } else {
        income += t.amount;
      }
    });

    // 转换为图表数据格式
    const chartData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { totalExpense: expense, totalIncome: income, expenseData: chartData };
  }, [monthlyData]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#9CA3AF'];

  return (
    <div className="pb-20">
      {/* 月份切换器 */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">{formatMonth(currentDate)}</span>
        </div>
        <button 
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          disabled={new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()}
        >
          <ChevronRight className={`w-5 h-5 ${new Date() < currentDate ? 'text-gray-300' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* 月度概览卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
           <p className="text-xs text-red-400 font-bold uppercase mb-1">月支出</p>
           <p className="text-xl font-extrabold text-red-600">¥{totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
           <p className="text-xs text-green-400 font-bold uppercase mb-1">月收入</p>
           <p className="text-xl font-extrabold text-green-600">¥{totalIncome.toFixed(2)}</p>
        </div>
      </div>

      {/* 饼图区域 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
          支出构成
        </h3>
        
        {expenseData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl">
            <p>本月暂无支出</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `¥${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 排行榜 */}
      {expenseData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 px-2">分类排行</h3>
          {expenseData.map((item, index) => (
            <div key={item.name} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-xs text-gray-400">
                  {((item.value / totalExpense) * 100).toFixed(1)}%
                </span>
              </div>
              <span className="font-bold text-gray-900">¥{item.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};