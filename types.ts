export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum PeriodType {
  MID_MONTH = 'midMonth',
  END_OF_MONTH = 'endOfMonth',
}

export interface Transaction {
  id: string; // UUID
  month_data_id: string; // UUID, Foreign key to MonthData's Supabase record
  user_id: string; // UUID, Foreign key to User
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  period_type: PeriodType; // Added to transaction to know if it's midMonth or endOfMonth
  created_at?: string;
  updated_at?: string;
}

export interface FinancialPeriodData {
  transactions: Transaction[];
}

export interface MonthData {
  id?: string; // UUID from Supabase months_data table
  monthYear: string; // "YYYY-MM"
  midMonth: FinancialPeriodData;
  endOfMonth: FinancialPeriodData;
  openingBalance: number;
  creditCardLimit?: number;
  user_id?: string; // UUID
}

export interface AppSettings {
  user_id?: string; // UUID from Supabase users table, primary key for settings
  currencySymbol: string;
  userNameDisplay?: string; // Renamed from userName to avoid confusion with login username
  theme: 'dark' | 'light';
}

// Represents a user record from your custom 'users' table in Supabase
export interface User {
  id: string; // UUID
  username: string;
  // password_hash is not stored in client-side state
  created_at?: string;
  updated_at?: string;
}

export interface AppState {
  activeMonthYear: string;
  data: Record<string, MonthData>; // Key is "YYYY-MM"
  settings: AppSettings | null; // Settings can be null until loaded
  isAuthenticated: boolean;
  currentUser: string | null; // Stores the user's UUID (id from 'users' table)
  currentUsername: string | null; // Stores the user's login username for display or other purposes
}

export interface AppContextType extends AppState {
  isLoading: boolean;
  isSaving: boolean;
  error?: string;
  addTransaction: (monthYear: string, periodType: PeriodType, transaction: Omit<Transaction, 'id' | 'month_data_id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  deleteTransaction: (transactionId: string) => void; // Simplified: needs only transactionId
  updateTransaction: (transaction: Transaction) => void; // Pass the full transaction object
  updateSettings: (newSettings: Partial<Omit<AppSettings, 'user_id'>>) => void;
  updateMonthData: (monthYear: string, data: Partial<Pick<MonthData, 'openingBalance' | 'creditCardLimit'>>) => void;
  setActiveMonthYear: (monthYear: string) => void;
  getCurrentMonthData: () => MonthData | null; // Can be null if no data for active month
  getTransactionsForPeriod: (monthYear: string, periodType: PeriodType, transactionType?: TransactionType) => Transaction[];
  getAllTransactionsForMonth: (monthYear: string, transactionType?: TransactionType) => Transaction[];
  getMonthlySummary: (monthYear: string) => {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    accountBalance: number;
    creditCardSpent: number;
    creditCardRemainingLimit?: number;
    totalBenefits: number;
  };
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const INCOME_CATEGORIES = [
  "Salário",
  "FGTS",
  "Férias",
  "Auxílio Alimentação",
  "Auxílio Home Office",
  "Auxílio Academia",
  "Restituição",
  "Investimentos",
  "Benefícios Diversos",
  "Outros Proventos"
];

export const EXPENSE_CATEGORIES = [
  "Cartão de Crédito",
  "Aluguel",
  "Internet",
  "Luz",
  "Água",
  "Gás",
  "Empréstimo",
  "Eletrodomésticos",
  "Saúde",
  "Educação",
  "Transporte",
  "Alimentação (Supermercado/Outros)",
  "Lazer",
  "Vestuário",
  "Cabelo/Beleza",
  "Assinaturas/Serviços",
  "Outras Despesas"
];

export const BENEFIT_CATEGORIES = [
  "Auxílio Alimentação",
  "Auxílio Home Office",
  "Auxílio Academia",
  "Benefícios Diversos"
];
