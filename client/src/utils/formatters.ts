export const formatCurrency = (amount: number, symbol: string = 'R$'): string => {
  return `${symbol} ${amount.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
};

export const formatMonthYear = (monthYear: string): string => {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });
};

export const getCurrentMonthYear = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const parseMonthYear = (monthYear: string): { year: number; month: number } => {
  const [year, month] = monthYear.split('-');
  return {
    year: parseInt(year),
    month: parseInt(month) - 1 // JavaScript months are 0-indexed
  };
};
