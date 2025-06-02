export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum PeriodType {
  MID_MONTH = 'midMonth',
  END_OF_MONTH = 'endOfMonth',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
}

export interface FinancialPeriodData {
  transactions: Transaction[];
}

export interface MonthData {
  monthYear: string; // "YYYY-MM"
  midMonth: FinancialPeriodData;
  endOfMonth: FinancialPeriodData;
  openingBalance: number; // Saldo inicial do mês
  creditCardLimit?: number;
}

export interface AppSettings {
  currencySymbol: string;
  userName?: string;
  theme: 'dark' | 'light';
}

export interface AppState {
  activeMonthYear: string;
  data: Record<string, MonthData>; // Key is "YYYY-MM"
  settings: AppSettings;
  isAuthenticated: boolean; // Added for authentication
}

// This represents the structure of the data stored in Firestore for the user
export interface FirestoreUserData {
  activeMonthYear: string;
  data: Record<string, MonthData>;
  settings: AppSettings;
}


export interface AppContextType extends AppState {
  isLoading: boolean; // For initial data load status
  isSaving: boolean; // For indicating when data is being saved to Firestore
  error?: string; // For sharing error messages, e.g. from login or Firestore operations
  addTransaction: (monthYear: string, periodType: PeriodType, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (monthYear: string, periodType: PeriodType, transactionId: string) => void;
  updateTransaction: (monthYear: string, periodType: PeriodType, transaction: Transaction) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateMonthData: (monthYear: string, data: Partial<Pick<MonthData, 'openingBalance' | 'creditCardLimit'>>) => void;
  setActiveMonthYear: (monthYear: string) => void;
  getCurrentMonthData: () => MonthData;
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
  login: (username: string, password: string) => Promise<boolean>; // Added for login
  logout: () => void; // Added for logout
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