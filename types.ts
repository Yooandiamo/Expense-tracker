export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
  createdAt: number;
}

export interface ParsedTransactionData {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ADD = 'ADD',
  STATS = 'STATS'
}

export const CATEGORIES = [
  '餐饮',
  '交通',
  '购物',
  '娱乐',
  '医疗',
  '生活',
  '工资',
  '其他'
];
