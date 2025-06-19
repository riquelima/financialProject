export interface User {
  id: string;
  username: string;
}

export interface MonthData {
  id: string;
  userId: string;
  monthYear: string;
  openingBalance: number;
  creditCardLimit: number;
}

export interface Transaction {
  id: string;
  monthDataId: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  periodType: 'mid-month' | 'end-of-month';
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  userId: string;
  currencySymbol: string;
  userNameDisplay: string;
  theme: 'dark' | 'light';
}

export interface ActiveMonth {
  userId: string;
  activeMonthYear: string;
}

export const INCOME_CATEGORIES = [
  'salario',
  'freelance',
  'investimentos',
  'bonus',
  'vendas',
  'aluguel',
  'outros'
] as const;

export const EXPENSE_CATEGORIES = [
  'alimentacao',
  'transporte',
  'moradia',
  'saude',
  'educacao',
  'lazer',
  'roupas',
  'tecnologia',
  'utilidades',
  'investimentos',
  'outros'
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const CATEGORY_LABELS: Record<string, string> = {
  // Income
  salario: 'Salário',
  freelance: 'Freelance',
  investimentos: 'Investimentos',
  bonus: 'Bônus',
  vendas: 'Vendas',
  aluguel: 'Aluguel',
  
  // Expense
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  moradia: 'Moradia',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  roupas: 'Roupas',
  tecnologia: 'Tecnologia',
  utilidades: 'Utilidades',
  outros: 'Outros'
};
