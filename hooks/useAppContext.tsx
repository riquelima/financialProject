
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AppContextType, MonthData, Transaction, PeriodType, TransactionType, AppSettings, User, UserCategory, BENEFIT_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, CategorySpendingDetail } from '../types.js';
import { getCurrentMonthYear, addMonths as addMonthsUtil } from '../utils/formatters.js'; 

// Supabase Client Initialization
const YOUR_SUPABASE_URL_HERE: string = 'https://kwvqumyzkezzatuhqoda.supabase.co'; 
const YOUR_SUPABASE_ANON_KEY_HERE: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3dnF1bXl6a2V6emF0dWhxb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzYxMDQsImV4cCI6MjA2NTM1MjEwNH0.wGSc9wjK1CjwWRg2O8JnYOygkFjESryvQzV90YTRXPY'; 

let supabase: SupabaseClient | null = null;
let isSupabaseConfigured = false;

const URL_PLACEHOLDER = 'YOUR_SUPABASE_URL_PLACEHOLDER'; 
const KEY_PLACEHOLDER_LITERAL = 'YOUR_SUPABASE_ANON_KEY_PLACEHOLDER';


if (YOUR_SUPABASE_URL_HERE === URL_PLACEHOLDER || YOUR_SUPABASE_URL_HERE.trim() === '' ||
    YOUR_SUPABASE_ANON_KEY_HERE === KEY_PLACEHOLDER_LITERAL || YOUR_SUPABASE_ANON_KEY_HERE.trim() === '') { 
  console.error(
    "Supabase URL or Anon Key is not configured. " +
    "Please update YOUR_SUPABASE_URL_PLACEHOLDER and YOUR_SUPABASE_ANON_KEY_PLACEHOLDER " + 
    "in hooks/useAppContext.tsx with your actual Supabase credentials."
  );
  isSupabaseConfigured = false;
} else {
  try {
    supabase = createClient(YOUR_SUPABASE_URL_HERE, YOUR_SUPABASE_ANON_KEY_HERE);
    isSupabaseConfigured = true;
    console.log("Supabase client initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize Supabase client. Check URL and Key format.", e);
    isSupabaseConfigured = false;
  }
}


// localStorage keys
const LOCAL_STORAGE_USER_ID = 'financeAppUserId';
const LOCAL_STORAGE_USERNAME = 'financeAppUsername'; 
const LOCAL_STORAGE_SESSION_EXPIRY = 'financeAppSessionExpiry';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

const createEmptyMonthDataStructure = (monthYear: string, userId?: string, id?: string): MonthData => ({
  id, 
  monthYear,
  transactions: [],
  openingBalance: 0,
  creditCardLimit: undefined,
  user_id: userId,
  midMonthSpendingGoal: 0,
  midMonthSavingsGoal: 0,
  endOfMonthSpendingGoal: 0,
  endOfMonthSavingsGoal: 0,
  monthlyOverallSpendingGoal: 0,
  categorySpendingGoals: {},
});

const defaultAppSettings: AppSettings = {
  currencySymbol: 'R$',
  userNameDisplay: '',
  theme: 'dark', 
};

const defaultInitialAppState: AppState = {
  activeMonthYear: getCurrentMonthYear(),
  data: {},
  settings: null, 
  isAuthenticated: false,
  currentUser: null, 
  currentUsername: null, 
  userCategories: [], // Initialize userCategories
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const SUPABASE_CONFIG_ERROR_MESSAGE = "Supabase não está configurado. Por favor, verifique se as credenciais (URL e Chave Anon) estão corretas no arquivo 'hooks/useAppContext.tsx'.";

// Helper function to calculate date for recurring transaction in a new month
const getRecurringDateForNewMonth = (originalDateString: string, newMonthYear: string): string => {
    const [_originalYear, _originalMonth, originalDayOfMonthStr] = originalDateString.split('-');
    const originalDayOfMonth = parseInt(originalDayOfMonthStr, 10);
    const [newYearStr, newMonthStr] = newMonthYear.split('-');
    const newYear = parseInt(newYearStr, 10);
    const newMonthJs = parseInt(newMonthStr, 10) - 1; // JavaScript months are 0-indexed

    let targetDate = new Date(Date.UTC(newYear, newMonthJs, originalDayOfMonth));
    if (targetDate.getUTCMonth() !== newMonthJs) {
        targetDate = new Date(Date.UTC(newYear, newMonthJs + 1, 0)); 
    }
    return targetDate.toISOString().split('T')[0];
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(defaultInitialAppState);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isPropagatingRecurring, setIsPropagatingRecurring] = useState(false);

  const clearError = () => setError('');

  useEffect(() => {
    if (appState.settings?.theme) {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(`theme-${appState.settings.theme}`);
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }, [appState.settings?.theme]);


  const getOrCreateSupabaseMonthRecord = useCallback(async (userId: string, monthYear: string): Promise<string> => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error(SUPABASE_CONFIG_ERROR_MESSAGE);
    }
    let { data: existingMonth, error: fetchError } = await supabase
      .from('financas_months_data')
      .select('id')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle(); 

    if (fetchError) { 
      throw new Error(`Falha ao verificar mês no Supabase: ${fetchError.message}`);
    }

    if (existingMonth) {
      return existingMonth.id;
    }

    const { data: newMonth, error: insertError } = await supabase
      .from('financas_months_data')
      .insert({ 
        user_id: userId, 
        month_year: monthYear, 
        opening_balance: 0,
        mid_month_spending_goal: 0,
        mid_month_savings_goal: 0,
        end_of_month_spending_goal: 0,
        end_of_month_savings_goal: 0,
        monthly_overall_spending_goal: 0, 
        category_spending_goals: {},      
       })
      .select('id')
      .single(); 

    if (insertError || !newMonth) {
      throw new Error(`Falha ao criar registro do mês ${monthYear} no Supabase: ${insertError?.message || 'No data returned'}`);
    }
    return newMonth.id;
  }, [isSupabaseConfigured]); 

  const mapRawSettingsToAppSettings = (rawSettings: any): AppSettings | null => {
    if (!rawSettings) return null;
    return {
      user_id: rawSettings.user_id,
      currencySymbol: rawSettings.currencysymbol, 
      userNameDisplay: rawSettings.usernamedisplay, 
      theme: rawSettings.theme,
    } as AppSettings;
  };

  const loadAllUserDataForUser = useCallback(async (userId: string, username: string) => {
    if (!supabase || !isSupabaseConfigured) {
      setError(SUPABASE_CONFIG_ERROR_MESSAGE);
      setIsLoading(false);
      setAppState(prev => ({...prev, isAuthenticated: false, currentUser: null, currentUsername: null}));
      return;
    }
    clearError();
    setIsLoading(true); 
    
    let settingsData: AppSettings | null = null;
    let activeMonthYearToSet = getCurrentMonthYear();
    let fetchedUserCategories: UserCategory[] = [];

    try {
      // 1. Fetch/Create Settings
       let { data: fetchedRawSettings, error: settingsQueryError } = await supabase
        .from('financas_settings')
        .select('user_id, currencysymbol, usernamedisplay, theme') 
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsQueryError) throw settingsQueryError;

      if (fetchedRawSettings) {
        settingsData = mapRawSettingsToAppSettings(fetchedRawSettings);
      } else {
         try {
          const defaultSettingsPayload = { 
            user_id: userId, 
            currencysymbol: 'R$', 
            usernamedisplay: username, 
            theme: 'dark',
          };
          const { data: newRawSettings, error: insertSettingsError } = await supabase
            .from('financas_settings').insert(defaultSettingsPayload)
            .select('user_id, currencysymbol, usernamedisplay, theme').single();
          if (insertSettingsError) throw insertSettingsError;
          settingsData = mapRawSettingsToAppSettings(newRawSettings);
        } catch (insertError: any) {
          if (insertError.code === '23505') { 
            console.warn("Supabase insert default settings error (23505): Tentando re-buscar os dados.");
            const { data: refetchedRawSettings, error: refetchError } = await supabase
              .from('financas_settings').select('user_id, currencysymbol, usernamedisplay, theme')
              .eq('user_id', userId).single(); 
            if (refetchError || !refetchedRawSettings) throw refetchError || new Error('Falha ao re-buscar configurações após erro 23505.');
            settingsData = mapRawSettingsToAppSettings(refetchedRawSettings);
          } else { 
            console.error("Supabase insert default settings error (non-23505):", insertError);
            throw insertError; 
          }
        }
      }
      if (settingsData && !settingsData.theme) settingsData.theme = 'dark';


      // 2. Fetch/Create Active Month Year
      let { data: activeMonthRecord, error: activeMonthQueryError } = await supabase
        .from('financas_active_months').select('active_month_year').eq('user_id', userId).maybeSingle();
      
      if (activeMonthQueryError) throw activeMonthQueryError;

      if (activeMonthRecord) {
        activeMonthYearToSet = activeMonthRecord.active_month_year;
      } else { 
         try {
           const { error: insertActiveMonthError } = await supabase
             .from('financas_active_months').insert({ user_id: userId, active_month_year: activeMonthYearToSet });
           if (insertActiveMonthError) throw insertActiveMonthError;
         } catch (insertError: any) {
           if (insertError.code === '23505') {
             const { data: refetchedActiveMonth, error: refetchError } = await supabase
               .from('financas_active_months').select('active_month_year').eq('user_id', userId).single(); 
             if (refetchError || !refetchedActiveMonth) throw refetchError || new Error('Active month re-fetch failed');
             activeMonthYearToSet = refetchedActiveMonth.active_month_year;
           } else { throw insertError; }
         }
      }

      // 3. Fetch User Categories & Seed if necessary
      let { data: userCategoriesData, error: categoriesError } = await supabase
        .from('financas_user_categories')
        .select('*')
        .eq('user_id', userId);
      if (categoriesError) throw categoriesError;
      
      fetchedUserCategories = userCategoriesData || [];

      if (fetchedUserCategories.length === 0) {
        // Seed default categories for the user
        const initialCategoriesToSeed: Omit<UserCategory, 'id' | 'created_at'>[] = [];
        DEFAULT_INCOME_CATEGORIES.forEach(name => initialCategoriesToSeed.push({ user_id: userId, name, type: TransactionType.INCOME }));
        DEFAULT_EXPENSE_CATEGORIES.forEach(name => initialCategoriesToSeed.push({ user_id: userId, name, type: TransactionType.EXPENSE }));

        if (initialCategoriesToSeed.length > 0) {
          const { data: seededCategories, error: seedError } = await supabase
            .from('financas_user_categories')
            .insert(initialCategoriesToSeed)
            .select();
          
          if (seedError) {
            console.error("Falha ao semear categorias padrão:", seedError);
            // Decide if this is a critical error or if the app can proceed without seeded categories
          } else if (seededCategories) {
            fetchedUserCategories = seededCategories;
          }
        }
      }


      // 4. Fetch all MonthData entries for the user
      const { data: userMonthsData, error: monthsError } = await supabase
        .from('financas_months_data').select('*').eq('user_id', userId);
      if (monthsError) throw monthsError;

      // 5. Fetch all Transactions for the user
      const { data: userTransactions, error: transactionsError } = await supabase
        .from('financas_transactions').select('*, is_recurring').eq('user_id', userId).order('date', { ascending: false }); 
      if (transactionsError) throw transactionsError;

      // 6. Reconstruct AppState.data
      const reconstructedData: Record<string, MonthData> = {};
      if (userMonthsData) {
        for (const mData of userMonthsData) {
          const monthTransactions = userTransactions?.filter(t => t.month_data_id === mData.id).map(t => ({
            ...t,
            isRecurring: t.is_recurring 
          })) || [];
          reconstructedData[mData.month_year] = {
            id: mData.id,
            monthYear: mData.month_year,
            openingBalance: mData.opening_balance,
            creditCardLimit: mData.credit_card_limit,
            user_id: mData.user_id,
            transactions: monthTransactions,
            midMonthSpendingGoal: mData.mid_month_spending_goal,
            midMonthSavingsGoal: mData.mid_month_savings_goal,
            endOfMonthSpendingGoal: mData.end_of_month_spending_goal,
            endOfMonthSavingsGoal: mData.end_of_month_savings_goal,
            monthlyOverallSpendingGoal: mData.monthly_overall_spending_goal, 
            categorySpendingGoals: mData.category_spending_goals || {},      
          };
        }
      }
      
      if (!reconstructedData[activeMonthYearToSet]) {
        const monthId = await getOrCreateSupabaseMonthRecord(userId, activeMonthYearToSet);
        reconstructedData[activeMonthYearToSet] = createEmptyMonthDataStructure(activeMonthYearToSet, userId, monthId);
      }
      
      setAppState({
        isAuthenticated: true,
        currentUser: userId,
        currentUsername: username,
        settings: settingsData || defaultAppSettings, 
        activeMonthYear: activeMonthYearToSet,
        data: reconstructedData,
        userCategories: fetchedUserCategories,
      });

    } catch (err: any) {
      const baseUiMessage = "Falha crítica ao carregar os dados do usuário";
      let finalUiMessage = baseUiMessage;
      console.error(`${baseUiMessage}. Erro completo:`, JSON.stringify(err, Object.getOwnPropertyNames(err).concat(['message', 'code', 'details', 'hint'].filter(p => err[p] !== undefined)), 2));
      let parts = [baseUiMessage];
      if (err.message) parts.push(`Detalhe: ${err.message}`);
      if (err.code) parts.push(`Código: ${err.code}`);
      if (err.details) parts.push(`Info: ${err.details}`);
      if (err.hint) parts.push(`Dica: ${err.hint}`);
      finalUiMessage = parts.join('. ') + ". Tente recarregar a página ou contate o suporte.";
      setError(finalUiMessage);
      setAppState(prevState => ({ 
        ...defaultInitialAppState, isAuthenticated: true, currentUser: userId, currentUsername: username,
        settings: defaultAppSettings, data: { [getCurrentMonthYear()]: createEmptyMonthDataStructure(getCurrentMonthYear(),userId) },
        userCategories: [], 
      }));
    } finally {
      setIsLoading(false); 
    }
  }, [getOrCreateSupabaseMonthRecord, isSupabaseConfigured]);

  useEffect(() => {
    // Initial auth check from localStorage
    if (!isSupabaseConfigured) {
      setError(SUPABASE_CONFIG_ERROR_MESSAGE);
      setAppState(prev => ({...prev, isAuthenticated: false}));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const storedUserId = localStorage.getItem(LOCAL_STORAGE_USER_ID);
      const storedUsername = localStorage.getItem(LOCAL_STORAGE_USERNAME);
      const storedExpiry = localStorage.getItem(LOCAL_STORAGE_SESSION_EXPIRY);
      if (storedUserId && storedUsername && storedExpiry && Date.now() < parseInt(storedExpiry, 10)) {
         setAppState(prevState => ({ ...prevState, isAuthenticated: true, currentUser: storedUserId, currentUsername: storedUsername }));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_ID);
        localStorage.removeItem(LOCAL_STORAGE_USERNAME);
        localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRY);
        setAppState(defaultInitialAppState);
        setIsLoading(false); 
      }
    } catch (error) {
      console.error("Erro ao ler sessão do localStorage:", error);
      setAppState(defaultInitialAppState);
      setIsLoading(false);
    }
  }, []); 

   useEffect(() => {
    // Load user data if authenticated but data is missing
    if (!isSupabaseConfigured) { setIsLoading(false); return; }
    if (appState.isAuthenticated && appState.currentUser && appState.currentUsername) {
       // Check if essential parts of data are missing, implying a need to load.
       // User categories are now critical as they are seeded.
      if (!appState.data || Object.keys(appState.data).length === 0 || !appState.settings || appState.userCategories.length === 0 ) {
        loadAllUserDataForUser(appState.currentUser, appState.currentUsername);
      } else { setIsLoading(false); }
    } else if (!appState.isAuthenticated) { setIsLoading(false); }
  }, [appState.isAuthenticated, appState.currentUser, appState.currentUsername, appState.data, appState.settings, appState.userCategories, loadAllUserDataForUser, isSupabaseConfigured]);


  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsLoading(false); return false; }
    setIsLoading(true); clearError();
    const username = usernameInput.trim().toLowerCase(); const password = passwordInput.trim();
    try {
      const { data: userData, error: fetchUserError } = await supabase
        .from('financas_users').select('id, username, password_hash').eq('username', username).maybeSingle(); 
      if (fetchUserError) {
        setError(`Erro ao conectar: ${fetchUserError.message} (Código: ${fetchUserError.code || 'N/A'})`);
        setIsLoading(false); return false;
      }
      if (!userData) { setError('Usuário não encontrado ou senha inválida.'); setIsLoading(false); return false; }
      if (userData.password_hash === password) { // IMPORTANT: In a real app, use hashed passwords & secure comparison
        const expiryTime = Date.now() + SESSION_DURATION;
        localStorage.setItem(LOCAL_STORAGE_USER_ID, userData.id);
        localStorage.setItem(LOCAL_STORAGE_USERNAME, userData.username); 
        localStorage.setItem(LOCAL_STORAGE_SESSION_EXPIRY, expiryTime.toString());
        setAppState(prevState => ({ ...defaultInitialAppState, isAuthenticated: true, currentUser: userData.id, currentUsername: userData.username }));
        // loadAllUserDataForUser will be triggered by useEffect
        return true;
      } else { setError('Usuário não encontrado ou senha inválida.'); setIsLoading(false); return false; }
    } catch (err: any) {
      setError(`Erro inesperado no login: ${err.message || 'Verifique o console.'}`);
      setIsLoading(false); return false;
    }
  }, [isSupabaseConfigured]); 

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_USER_ID); localStorage.removeItem(LOCAL_STORAGE_USERNAME); localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRY);
    setAppState(defaultInitialAppState); setIsLoading(false); setError(''); 
  }, []);
  
  const getOrCreateLocalMonthData = useCallback((monthYear: string, currentData: Record<string, MonthData>, userId: string): MonthData => {
    if (currentData[monthYear]) return currentData[monthYear];
    return createEmptyMonthDataStructure(monthYear, userId);
  }, []);

  const addTransaction = useCallback(async (
    monthYear: string, 
    periodTypeForTagging: PeriodType,
    transactionData: Omit<Transaction, 'id' | 'month_data_id' | 'user_id' | 'created_at' | 'updated_at' | 'period_type'> & { period_type?: PeriodType, isRecurring?: boolean }
  ) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      const monthDataId = await getOrCreateSupabaseMonthRecord(appState.currentUser, monthYear);
      
      const transactionToInsert = {
        description: transactionData.description,
        amount: transactionData.amount,
        category: transactionData.category,
        date: transactionData.date,
        type: transactionData.type,
        month_data_id: monthDataId,
        user_id: appState.currentUser,
        period_type: transactionData.period_type || periodTypeForTagging, 
        is_recurring: transactionData.isRecurring || false, 
      };

      const { data: newTransactionFromDb, error } = await supabase
        .from('financas_transactions').insert(transactionToInsert).select('*, is_recurring').single();

      if (error || !newTransactionFromDb) throw error || new Error("Falha ao adicionar transação no Supabase.");
      
      const newTransactionForState: Transaction = {
          ...newTransactionFromDb,
          isRecurring: newTransactionFromDb.is_recurring 
      };


      setAppState(prevState => {
        const MData = getOrCreateLocalMonthData(monthYear, prevState.data, appState.currentUser!);
        const updatedTransactions = [...MData.transactions, newTransactionForState]
            .sort((a,b) => new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime());
        
        const updatedMonthObject: MonthData = {
          ...MData,
          id: MData.id || monthDataId, 
          transactions: updatedTransactions
        };
        return { ...prevState, data: { ...prevState.data, [monthYear]: updatedMonthObject } };
      });
    } catch (err: any) {
      setError(`Falha ao adicionar transação: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, getOrCreateSupabaseMonthRecord, getOrCreateLocalMonthData, isSupabaseConfigured]); 

  const deleteTransaction = useCallback(async (transactionId: string) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      const { error } = await supabase
        .from('financas_transactions').delete().eq('id', transactionId).eq('user_id', appState.currentUser); 
      if (error) throw error;

      setAppState(prevState => {
        const newData = { ...prevState.data };
        for (const monthYearKey in newData) {
          const monthData = newData[monthYearKey];
          const initialLength = monthData.transactions.length;
          monthData.transactions = monthData.transactions.filter(t => t.id !== transactionId);
          if (monthData.transactions.length < initialLength) break; 
        }
        return { ...prevState, data: newData };
      });
    } catch (err: any) {
      setError(`Falha ao excluir transação: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, isSupabaseConfigured]);

  const updateTransaction = useCallback(async (transaction: Transaction) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    setIsSaving(true); clearError();

    const { 
      id, // Keep id separate
      month_data_id, // Exclude
      user_id,       // Exclude
      created_at,    // Exclude
      updated_at,    // Exclude
      ...dataToUpdate // Rest of the properties
    } = transaction;

    const updatePayload = {
      description: dataToUpdate.description,
      amount: dataToUpdate.amount,
      category: dataToUpdate.category,
      date: dataToUpdate.date,
      type: dataToUpdate.type,
      period_type: dataToUpdate.period_type,
      is_recurring: dataToUpdate.isRecurring || false,
    };
    
    try {
      const { data: updatedTransactionFromDb, error } = await supabase
        .from('financas_transactions').update(updatePayload).eq('id', id)
        .eq('user_id', appState.currentUser).select('*, is_recurring').single();
      if (error || !updatedTransactionFromDb) throw error || new Error("Falha ao atualizar transação no Supabase.");

      const updatedTransactionForState: Transaction = {
          ...updatedTransactionFromDb,
          isRecurring: updatedTransactionFromDb.is_recurring 
      };
      
      setAppState(prevState => {
        const newData = { ...prevState.data };
        for (const monthYearKey in newData) {
          const currentMonthEntry = newData[monthYearKey];
          const index = currentMonthEntry.transactions.findIndex(t => t.id === updatedTransactionForState.id);
          if (index !== -1) {
            currentMonthEntry.transactions[index] = updatedTransactionForState;
            currentMonthEntry.transactions.sort((a,b) => new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime());
            break; 
          }
        }
        return { ...prevState, data: newData };
      });
    } catch (err: any) {
      setError(`Falha ao atualizar transação: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, isSupabaseConfigured]); 

  const updateSettings = useCallback(async (newSettings: Partial<Omit<AppSettings, 'user_id'>>) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser || !appState.settings) { setError("Usuário ou config não carregados."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      const payload = { 
        currencysymbol: newSettings.currencySymbol ?? appState.settings.currencySymbol, 
        usernamedisplay: newSettings.userNameDisplay ?? appState.settings.userNameDisplay, 
        theme: newSettings.theme ?? appState.settings.theme,
      };
      const { data: updatedRawSettings, error } = await supabase
        .from('financas_settings').update(payload).eq('user_id', appState.currentUser)
        .select('user_id, currencysymbol, usernamedisplay, theme').single();
      if (error || !updatedRawSettings) throw error || new Error("Falha ao atualizar config no Supabase.");
      const updatedAppSettings = mapRawSettingsToAppSettings(updatedRawSettings);
      if (updatedAppSettings) setAppState(prevState => ({ ...prevState, settings: updatedAppSettings }));
      else throw new Error("Falha ao mapear config atualizada.");
    } catch (err: any) {
      setError(`Erro ao atualizar config: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, appState.settings, isSupabaseConfigured]); 

  const updateMonthData = useCallback(async (monthYear: string, dataToUpdate: Partial<Pick<MonthData, 'openingBalance' | 'creditCardLimit' | 'midMonthSpendingGoal' | 'midMonthSavingsGoal' | 'endOfMonthSpendingGoal' | 'endOfMonthSavingsGoal' | 'monthlyOverallSpendingGoal' | 'categorySpendingGoals'>>) => {
     if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      const monthRecordId = await getOrCreateSupabaseMonthRecord(appState.currentUser, monthYear);
      const dbPayload: any = {};
      if (dataToUpdate.openingBalance !== undefined) dbPayload.opening_balance = dataToUpdate.openingBalance;
      if (dataToUpdate.creditCardLimit !== undefined) dbPayload.credit_card_limit = dataToUpdate.creditCardLimit;
      if (dataToUpdate.midMonthSpendingGoal !== undefined) dbPayload.mid_month_spending_goal = dataToUpdate.midMonthSpendingGoal;
      if (dataToUpdate.midMonthSavingsGoal !== undefined) dbPayload.mid_month_savings_goal = dataToUpdate.midMonthSavingsGoal;
      if (dataToUpdate.endOfMonthSpendingGoal !== undefined) dbPayload.end_of_month_spending_goal = dataToUpdate.endOfMonthSpendingGoal;
      if (dataToUpdate.endOfMonthSavingsGoal !== undefined) dbPayload.end_of_month_savings_goal = dataToUpdate.endOfMonthSavingsGoal;
      if (dataToUpdate.monthlyOverallSpendingGoal !== undefined) dbPayload.monthly_overall_spending_goal = dataToUpdate.monthlyOverallSpendingGoal;
      if (dataToUpdate.categorySpendingGoals !== undefined) dbPayload.category_spending_goals = dataToUpdate.categorySpendingGoals;

      if (Object.keys(dbPayload).length === 0) { setIsSaving(false); return; }
      
      const { error } = await supabase
        .from('financas_months_data').update(dbPayload).eq('id', monthRecordId).eq('user_id', appState.currentUser);
      if (error) throw error;

      setAppState(prevState => {
        const MData = getOrCreateLocalMonthData(monthYear, prevState.data, appState.currentUser!);
        const updatedMonthObject = { ...MData, id: MData.id || monthRecordId, ...dataToUpdate };
        return { ...prevState, data: { ...prevState.data, [monthYear]: updatedMonthObject } };
      });
    } catch (err: any) {
      setError(`Erro ao atualizar dados do mês: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, getOrCreateSupabaseMonthRecord, getOrCreateLocalMonthData, isSupabaseConfigured]); 
  
  const setActiveMonthYear = useCallback(async (monthYear: string) => {
    if (!supabase || !isSupabaseConfigured || !appState.currentUser) {
        setError(SUPABASE_CONFIG_ERROR_MESSAGE);
        setIsSaving(false);
        return;
    }

    setIsSaving(true); 
    clearError();

    setAppState(prevState => {
        let updatedData = { ...prevState.data };
        if (!updatedData[monthYear] && prevState.currentUser) {
            updatedData[monthYear] = createEmptyMonthDataStructure(monthYear, prevState.currentUser);
        }
        return { ...prevState, activeMonthYear: monthYear, data: updatedData };
    });
    
    try {
        const { data: existingActiveMonth } = await supabase
            .from('financas_active_months').select('user_id').eq('user_id', appState.currentUser).maybeSingle();
        if (existingActiveMonth) {
            const { error: updateError } = await supabase
                .from('financas_active_months').update({ active_month_year: monthYear }).eq('user_id', appState.currentUser);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase
                .from('financas_active_months').insert({ user_id: appState.currentUser, active_month_year: monthYear });
            if (insertError) throw insertError;
        }

        const targetMonthId = await getOrCreateSupabaseMonthRecord(appState.currentUser, monthYear);
        
        setIsPropagatingRecurring(true);
        const previousMonthYear = addMonthsUtil(monthYear, -1);
        const previousMonthData = appState.data[previousMonthYear];

        let newPropagatedTransactions: Transaction[] = [];

        if (previousMonthData && previousMonthData.transactions && previousMonthData.transactions.length > 0) {
            const recurringSourceTransactions = previousMonthData.transactions.filter(t => t.isRecurring);
            const targetMonthCurrentTransactions = appState.data[monthYear]?.transactions || [];

            for (const sourceTx of recurringSourceTransactions) {
                const newDate = getRecurringDateForNewMonth(sourceTx.date, monthYear);
                const originalDayOfSource = parseInt(sourceTx.date.split('-')[2], 10);

                const isDuplicate = targetMonthCurrentTransactions.some(existingTx => 
                    existingTx.isRecurring &&
                    parseInt(existingTx.date.split('-')[2],10) === parseInt(newDate.split('-')[2],10) && 
                    (parseInt(getRecurringDateForNewMonth(existingTx.date, previousMonthYear).split('-')[2],10) === originalDayOfSource ||
                     (existingTx.description === sourceTx.description && 
                      existingTx.amount === sourceTx.amount &&
                      existingTx.type === sourceTx.type &&
                      existingTx.category === sourceTx.category
                     )
                    ) &&
                    existingTx.description === sourceTx.description &&
                    existingTx.amount === sourceTx.amount &&
                    existingTx.type === sourceTx.type &&
                    existingTx.category === sourceTx.category
                );


                if (!isDuplicate) {
                    const dayOfNewDate = parseInt(newDate.split('-')[2], 10);
                    const newPeriodType = dayOfNewDate <= 15 ? PeriodType.MID_MONTH : PeriodType.END_OF_MONTH;
                    
                    const transactionToInsertForRecurring = {
                        description: sourceTx.description,
                        amount: sourceTx.amount,
                        category: sourceTx.category,
                        date: newDate,
                        type: sourceTx.type,
                        month_data_id: targetMonthId,
                        user_id: appState.currentUser,
                        period_type: newPeriodType,
                        is_recurring: true,
                    };
                    const { data: dbNewRecurringTx, error: recurringInsertError } = await supabase
                        .from('financas_transactions').insert(transactionToInsertForRecurring)
                        .select('*, is_recurring').single();
                    
                    if (recurringInsertError) {
                        console.warn(`Falha ao propagar transação recorrente "${sourceTx.description}": ${recurringInsertError.message}`);
                        continue; 
                    }
                    if (dbNewRecurringTx) {
                        newPropagatedTransactions.push({ ...dbNewRecurringTx, isRecurring: dbNewRecurringTx.is_recurring });
                    }
                }
            }
        }
        
        if (newPropagatedTransactions.length > 0 || !appState.data[monthYear]?.id) {
             setAppState(prevState => {
                const MData = getOrCreateLocalMonthData(monthYear, prevState.data, appState.currentUser!);
                const existingTransactions = MData.transactions.filter(
                    et => !newPropagatedTransactions.some(npt => npt.description === et.description && npt.amount === et.amount && npt.type === et.type)
                );

                const finalTransactions = [...existingTransactions, ...newPropagatedTransactions]
                    .sort((a,b) => new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime());
                
                const updatedMonthObject: MonthData = {
                  ...MData,
                  id: MData.id || targetMonthId, 
                  transactions: finalTransactions
                };
                return { ...prevState, data: { ...prevState.data, [monthYear]: updatedMonthObject } };
            });
        }
    } catch (err: any) {
        setError(`Falha ao definir mês ativo ou propagar recorrentes: ${err.message}`);
    } finally {
        setIsSaving(false);
        setIsPropagatingRecurring(false);
    }
  }, [appState.currentUser, appState.data, getOrCreateSupabaseMonthRecord, getOrCreateLocalMonthData, isSupabaseConfigured]);

  const getCurrentMonthData = useCallback((): MonthData | null => {
     if (!appState.activeMonthYear || !appState.data[appState.activeMonthYear]) {
       if (appState.currentUser && appState.activeMonthYear) {
        return createEmptyMonthDataStructure(appState.activeMonthYear, appState.currentUser);
      }
      return null;
    }
    return appState.data[appState.activeMonthYear];
  }, [appState.activeMonthYear, appState.data, appState.currentUser]);

  const getTransactionsForPeriod = useCallback((monthYear: string, periodType: PeriodType, transactionTypeParam?: TransactionType): Transaction[] => {
    const monthData = appState.data[monthYear];
    if (!monthData || !monthData.transactions) return [];
    
    let filteredTransactions = monthData.transactions.filter(t => {
      if (!t.date || t.date.split('-').length !== 3) {
        console.warn('Invalid date format for transaction:', t);
        return false; 
      }
      const dayOfMonth = parseInt(t.date.substring(t.date.lastIndexOf('-') + 1), 10);

      if (periodType === PeriodType.MID_MONTH) {
        return dayOfMonth <= 15;
      } else { // END_OF_MONTH
        return dayOfMonth > 15;
      }
    });

    if (transactionTypeParam) {
      filteredTransactions = filteredTransactions.filter(t => t.type === transactionTypeParam);
    }
    return [...filteredTransactions].sort((a,b) => new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime());
  }, [appState.data]);

  const getAllTransactionsForMonth = useCallback((monthYear: string, transactionTypeParam?: TransactionType): Transaction[] => {
    const monthData = appState.data[monthYear];
    if (!monthData || !monthData.transactions) return [];
    
    let transactions = monthData.transactions;
    
    if (transactionTypeParam) {
      transactions = transactions.filter(t => t.type === transactionTypeParam);
    }
    return [...transactions].sort((a,b) => new Date(b.date + "T00:00:00").getTime() - new Date(a.date + "T00:00:00").getTime()); 
  }, [appState.data]);

  const getMonthlySummary = useCallback((monthYear: string) => {
     const monthDataToUse = appState.data[monthYear] || createEmptyMonthDataStructure(monthYear, appState.currentUser || undefined);
    
    const allMonthIncome = getAllTransactionsForMonth(monthYear, TransactionType.INCOME);
    const allMonthExpenses = getAllTransactionsForMonth(monthYear, TransactionType.EXPENSE);

    const totalIncome = allMonthIncome.reduce((sum, t: Transaction) => sum + t.amount, 0);
    const totalExpenses = allMonthExpenses.reduce((sum, t: Transaction) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    let dynamicAccountBalance = monthDataToUse.openingBalance || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    allMonthIncome.forEach((incomeTx: Transaction) => {
      const txDateParts = incomeTx.date.split('-').map(Number);
      const transactionDate = new Date(Date.UTC(txDateParts[0], txDateParts[1] - 1, txDateParts[2]));
      
      if (transactionDate.getTime() <= today.getTime()) {
        dynamicAccountBalance += incomeTx.amount;
      }
    });

    allMonthExpenses.forEach((expenseTx: Transaction) => {
      const txDateParts = expenseTx.date.split('-').map(Number);
      const transactionDate = new Date(Date.UTC(txDateParts[0], txDateParts[1] - 1, txDateParts[2]));
      
      if (transactionDate.getTime() <= today.getTime()) {
        dynamicAccountBalance -= expenseTx.amount;
      }
    });

    const creditCardSpent = allMonthExpenses.filter((t: Transaction) => t.category === "Cartão de Crédito").reduce((sum, t: Transaction) => sum + t.amount, 0);
    const creditCardRemainingLimit = monthDataToUse.creditCardLimit !== undefined && monthDataToUse.creditCardLimit !== null ? monthDataToUse.creditCardLimit - creditCardSpent : undefined;
    const totalBenefits = allMonthIncome.filter((t: Transaction) => BENEFIT_CATEGORIES.includes(t.category)).reduce((sum, t: Transaction) => sum + t.amount, 0);
    
    return { 
      totalIncome, 
      totalExpenses, 
      netSavings, 
      accountBalance: dynamicAccountBalance, 
      creditCardSpent, 
      creditCardRemainingLimit, 
      totalBenefits 
    };
  }, [appState.data, appState.currentUser, getAllTransactionsForMonth]);

  const getPeriodSummary = useCallback((monthYear: string, periodType: PeriodType) => {
    const periodTransactions = getTransactionsForPeriod(monthYear, periodType);
    const periodIncome = periodTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const periodExpenses = periodTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    const periodSavings = periodIncome - periodExpenses;
    return { periodIncome, periodExpenses, periodSavings };
  }, [getTransactionsForPeriod]);

  // User Category Management Functions
  const addUserCategory = useCallback(async (name: string, type: TransactionType) => {
    if (!supabase || !isSupabaseConfigured || !appState.currentUser) {
      setError(SUPABASE_CONFIG_ERROR_MESSAGE);
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    clearError();
    try {
      // Check for duplicates (case-insensitive) locally first
      const existingCategory = appState.userCategories.find(
        (cat) => cat.name.toLowerCase() === name.toLowerCase() && cat.type === type && cat.user_id === appState.currentUser
      );
      if (existingCategory) {
        throw new Error(`Categoria "${name}" já existe para este tipo.`);
      }

      const { data: newCategory, error } = await supabase
        .from('financas_user_categories')
        .insert({ user_id: appState.currentUser, name, type })
        .select()
        .single();

      if (error) throw error;
      if (!newCategory) throw new Error("Falha ao criar categoria no banco de dados.");
      
      setAppState(prevState => ({
        ...prevState,
        userCategories: [...prevState.userCategories, newCategory as UserCategory],
      }));
    } catch (err: any) {
      setError(`Erro ao adicionar categoria: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, appState.userCategories, isSupabaseConfigured]);

  const deleteUserCategory = useCallback(async (categoryId: string) => {
    if (!supabase || !isSupabaseConfigured || !appState.currentUser) {
      setError(SUPABASE_CONFIG_ERROR_MESSAGE);
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    clearError();
    try {
      const { error } = await supabase
        .from('financas_user_categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', appState.currentUser);

      if (error) throw error;

      setAppState(prevState => ({
        ...prevState,
        userCategories: prevState.userCategories.filter(cat => cat.id !== categoryId),
      }));
    } catch (err: any) {
      setError(`Erro ao excluir categoria: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, isSupabaseConfigured]);

  const updateUserCategory = useCallback(async (categoryId: string, newName: string, newType: TransactionType) => {
    if (!supabase || !isSupabaseConfigured || !appState.currentUser) {
      setError(SUPABASE_CONFIG_ERROR_MESSAGE);
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    clearError();
    try {
      const existingCategory = appState.userCategories.find(
        (cat) => cat.id !== categoryId && cat.name.toLowerCase() === newName.toLowerCase() && cat.type === newType && cat.user_id === appState.currentUser
      );
      if (existingCategory) {
        throw new Error(`Já existe uma categoria "${newName}" para este tipo.`);
      }

      const { data: updatedCategory, error } = await supabase
        .from('financas_user_categories')
        .update({ name: newName, type: newType })
        .eq('id', categoryId)
        .eq('user_id', appState.currentUser)
        .select()
        .single();
      
      if (error) throw error;
      if (!updatedCategory) throw new Error("Falha ao atualizar categoria no banco de dados.");

      setAppState(prevState => ({
        ...prevState,
        userCategories: prevState.userCategories.map(cat => 
          cat.id === categoryId ? (updatedCategory as UserCategory) : cat
        ),
      }));
    } catch (err: any) {
      setError(`Erro ao atualizar categoria: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, appState.userCategories, isSupabaseConfigured]);

  const getCombinedIncomeCategories = useCallback((): string[] => {
    // Now that categories are seeded, all categories for the user are in userCategories.
    // Default categories are just a starting point.
    return appState.userCategories
      .filter(cat => cat.type === TransactionType.INCOME)
      .map(cat => cat.name)
      .sort((a, b) => a.localeCompare(b));
  }, [appState.userCategories]);

  const getCombinedExpenseCategories = useCallback((): string[] => {
    return appState.userCategories
      .filter(cat => cat.type === TransactionType.EXPENSE)
      .map(cat => cat.name)
      .sort((a, b) => a.localeCompare(b));
  }, [appState.userCategories]);


  const getCategorySpendingDetails = useCallback((monthYear: string): CategorySpendingDetail[] => {
    const monthData = appState.data[monthYear];
    if (!monthData) return [];

    const categoryTotals: Record<string, number> = {};
    monthData.transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const details: CategorySpendingDetail[] = [];
    const categoryGoals = monthData.categorySpendingGoals || {};
    
    // Now, all categories available to the user are in appState.userCategories
    const allUserExpenseCategories = appState.userCategories
                                        .filter(cat => cat.type === TransactionType.EXPENSE)
                                        .map(cat => cat.name);

    allUserExpenseCategories.forEach(categoryName => {
      const totalSpent = categoryTotals[categoryName] || 0;
      const goal = categoryGoals[categoryName] || 0;
      // Only include if there's spending or a goal > 0
      if (totalSpent > 0 || goal > 0) { 
        const percentage = goal > 0 ? Math.min((totalSpent / goal) * 100, 200) : (totalSpent > 0 ? 100 : 0); 
        details.push({ category: categoryName, totalSpent, goal, percentage });
      }
    });

    // Handle categories that might have goals but are not in the current user's list (e.g. from old data before seeding/management)
    Object.keys(categoryGoals).forEach(categoryName => {
      if (!allUserExpenseCategories.includes(categoryName) && (categoryGoals[categoryName] || 0) > 0) {
        if (!details.find(d => d.category === categoryName)) { // Avoid duplicates if somehow already added
          const totalSpent = categoryTotals[categoryName] || 0;
          const goal = categoryGoals[categoryName] || 0;
          const percentage = goal > 0 ? Math.min((totalSpent / goal) * 100, 200) : (totalSpent > 0 ? 100 : 0);
          details.push({ category: categoryName, totalSpent, goal, percentage });
        }
      }
    });

     // Handle categories from transactions that are not in the current user's list (e.g. from old data)
     Object.keys(categoryTotals).forEach(categoryName => {
      if (!allUserExpenseCategories.includes(categoryName) && !details.find(d => d.category === categoryName) && categoryTotals[categoryName] > 0) {
           details.push({ category: categoryName, totalSpent: categoryTotals[categoryName], goal: 0, percentage: 100 });
      }
    });


    return details.sort((a,b) => (b.goal > 0 ? b.totalSpent/b.goal : b.totalSpent) - (a.goal > 0 ? a.totalSpent/a.goal : a.totalSpent)); 
  }, [appState.data, appState.userCategories]); // Depend on userCategories as well

  return (
    <AppContext.Provider value={{ 
      ...appState, isLoading: isLoading || isPropagatingRecurring, isSaving, error, 
      addTransaction, deleteTransaction, updateTransaction, 
      updateSettings, updateMonthData, setActiveMonthYear,
      getCurrentMonthData, getTransactionsForPeriod, getAllTransactionsForMonth,
      getMonthlySummary, getPeriodSummary, getCategorySpendingDetails,
      login, logout,
      // User Category Management
      userCategories: appState.userCategories,
      addUserCategory,
      deleteUserCategory,
      updateUserCategory, 
      getCombinedIncomeCategories,
      getCombinedExpenseCategories,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
