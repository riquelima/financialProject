import { MONTH_NAMES } from '../constants';

export const formatCurrency = (amount: number, currencySymbol: string = 'R$'): string => {
  return `${currencySymbol} ${amount.toFixed(2).replace('.', ',')}`;
};

export const formatDate = (dateString: string): string => { // YYYY-MM-DD
  if (!dateString || !dateString.includes('-')) return 'Data inválida';
  const parts = dateString.split('-');
  if (parts.length !== 3) return 'Data inválida';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getCurrentMonthYear = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
};

export const getMonthName = (monthYear: string): string => {
  if (!monthYear || !monthYear.includes('-')) return 'Mês inválido';
  const parts = monthYear.split('-');
  if (parts.length !== 2) return 'Mês inválido';
  const [year, month] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return 'Mês inválido';
  return `${MONTH_NAMES[monthIndex]} ${year}`;
};

export const addMonths = (monthYear: string, count: number): string => {
  const [yearStr, monthStr] = monthYear.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) -1; // 0-indexed month

  const date = new Date(year, month);
  date.setMonth(date.getMonth() + count);
  
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};
