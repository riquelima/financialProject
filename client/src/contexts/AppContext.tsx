import { createContext, ReactNode } from 'react';
import { User, MonthData, Transaction, Settings, ActiveMonth } from '../types';

export interface AppContextType {
  user: User | null;
  currentMonth: string;
  monthData: MonthData | null;
  transactions: Transaction[];
  settings: Settings | null;
  isLoading: boolean;

  // Auth methods
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Month methods
  setCurrentMonth: (monthYear: string) => Promise<void>;
  updateMonthData: (updates: Partial<MonthData>) => Promise<void>;

  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id' | 'monthDataId' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Settings methods
  updateSettings: (updates: Partial<Settings>) => Promise<void>;

  // Financial calculations
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetSavings: () => number;
  getAccountBalance: () => number;
  getCategoryTotals: () => Record<string, number>;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // This will be implemented in useAppContext hook
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Assuming setUser is defined elsewhere and accessible in this scope
      // setUser(data.user); // This line was commented out because setUser is not defined in original code
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  return (
    <AppContext.Provider value={null}>
      {children}
    </AppContext.Provider>
  );
}