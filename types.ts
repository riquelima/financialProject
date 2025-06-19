
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
  period_type: PeriodType; // Indicates the context (1st or 2nd fortnight view) when transaction was added
  isRecurring?: boolean; // Added for recurring transactions
  created_at?: string;
  updated_at?: string;
}

export interface UserCategory {
  id: string; // UUID from Supabase
  user_id: string; // UUID
  name: string;
  type: TransactionType; // 'income' or 'expense'
  created_at?: string; // Supabase managed
}

export interface MonthData {
  id?: string; // UUID from Supabase months_data table
  monthYear: string; // "YYYY-MM"
  transactions: Transaction[]; // All transactions for this month
  openingBalance: number;
  creditCardLimit?: number;
  user_id?: string; // UUID

  // Goals for "Controle Quinzenal" (FinancialPeriodScreen)
  midMonthSpendingGoal?: number;
  midMonthSavingsGoal?: number;
  endOfMonthSpendingGoal?: number;
  endOfMonthSavingsGoal?: number;

  // Goals for "Fechamento Mensal" (MonthlyAnalysisScreen)
  monthlyOverallSpendingGoal?: number;
  categorySpendingGoals?: Record<string, number>; // e.g., { "Alimentação": 300, "Transporte": 150 }
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
  currentUser: string | null; // Stores the user's UUID (id)
  currentUsername: string | null; // Stores the user's login username
  userCategories: UserCategory[]; // Added for user-defined categories
}

export interface CategorySpendingDetail {
  category: string;
  totalSpent: number;
  goal: number;
  percentage: number;
}

export interface AppContextType extends AppState {
  isLoading: boolean;
  isSaving: boolean;
  error?: string;
  addTransaction: (monthYear: string, periodType: PeriodType, transaction: Omit<Transaction, 'id' | 'month_data_id' | 'user_id' | 'created_at' | 'updated_at'> & { isRecurring?: boolean }) => void; // Added isRecurring here
  deleteTransaction: (transactionId: string) => void; 
  updateTransaction: (transaction: Transaction) => void; 
  updateSettings: (newSettings: Partial<Omit<AppSettings, 'user_id'>>) => void;
  updateMonthData: (monthYear: string, data: Partial<Pick<MonthData, 'openingBalance' | 'creditCardLimit' | 'midMonthSpendingGoal' | 'midMonthSavingsGoal' | 'endOfMonthSpendingGoal' | 'endOfMonthSavingsGoal' | 'monthlyOverallSpendingGoal' | 'categorySpendingGoals'>>) => void;
  setActiveMonthYear: (monthYear: string) => void;
  getCurrentMonthData: () => MonthData | null; 
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
  getPeriodSummary: (monthYear: string, periodType: PeriodType) => {
    periodIncome: number;
    periodExpenses: number;
    periodSavings: number;
  };
  getCategorySpendingDetails: (monthYear: string) => CategorySpendingDetail[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  // User Category Management
  userCategories: UserCategory[];
  addUserCategory: (name: string, type: TransactionType) => Promise<void>;
  deleteUserCategory: (categoryId: string) => Promise<void>;
  updateUserCategory: (categoryId: string, newName: string, newType: TransactionType) => Promise<void>; // Added for editing
  getCombinedIncomeCategories: () => string[];
  getCombinedExpenseCategories: () => string[];
}

export const DEFAULT_INCOME_CATEGORIES = [
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

export const DEFAULT_EXPENSE_CATEGORIES = [
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
