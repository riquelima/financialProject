


import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, AppContextType, MonthData, Transaction, PeriodType, TransactionType, AppSettings, User, BENEFIT_CATEGORIES, FinancialPeriodData } from '../types';
import { getCurrentMonthYear, generateId as generateClientSideId } from '../utils/formatters'; // Renamed to avoid conflict if Supabase uses 'id'

// Supabase Client Initialization
const YOUR_SUPABASE_URL_HERE: string = 'https://wbxjsqixqxdcagiorccx.supabase.co'; // Updated with user's derived URL
const YOUR_SUPABASE_ANON_KEY_HERE: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieGpzcWl4cXhkY2FnaW9yY2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NDY2MTEsImV4cCI6MjA2NDUyMjYxMX0.k6XbupkpNarKbmIGKUPYnRFh9Fha5Li4gq5l5HvRe7w'; // Updated with user's Anon Key

let supabase: SupabaseClient | null = null;
let isSupabaseConfigured = false;

// Check if the placeholders have been replaced
const URL_PLACEHOLDER = 'YOUR_SUPABASE_URL_PLACEHOLDER'; // Constant for original placeholder text
const KEY_PLACEHOLDER_LITERAL = 'YOUR_SUPABASE_ANON_KEY_PLACEHOLDER';


if (YOUR_SUPABASE_URL_HERE === URL_PLACEHOLDER || YOUR_SUPABASE_URL_HERE.trim() === '' ||
    YOUR_SUPABASE_ANON_KEY_HERE === KEY_PLACEHOLDER_LITERAL || YOUR_SUPABASE_ANON_KEY_HERE.trim() === '') { // Corrected placeholder check
  console.error(
    "Supabase URL or Anon Key is not configured. " +
    "Please update YOUR_SUPABASE_URL_PLACEHOLDER and YOUR_SUPABASE_ANON_KEY_PLACEHOLDER " + // Keep placeholder names consistent in message
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
const LOCAL_STORAGE_USERNAME = 'financeAppUsername'; // Store username for convenience
const LOCAL_STORAGE_SESSION_EXPIRY = 'financeAppSessionExpiry';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

const createEmptyMonthDataStructure = (monthYear: string, userId?: string, id?: string): MonthData => ({
  id, // Supabase ID for the months_data record
  monthYear,
  midMonth: { transactions: [] },
  endOfMonth: { transactions: [] },
  openingBalance: 0,
  creditCardLimit: undefined,
  user_id: userId,
});

const defaultAppSettings: AppSettings = {
  currencySymbol: 'R$',
  userNameDisplay: '',
  theme: 'dark', // Default theme
};

const defaultInitialAppState: AppState = {
  activeMonthYear: getCurrentMonthYear(),
  data: {},
  settings: null, // Initialize as null, will be fetched
  isAuthenticated: false,
  currentUser: null, // Will store User UUID (id)
  currentUsername: null, // Will store User login username
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const SUPABASE_CONFIG_ERROR_MESSAGE = "Supabase não está configurado. Por favor, verifique se as credenciais (URL e Chave Anon) estão corretas no arquivo 'hooks/useAppContext.tsx'.";


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(defaultInitialAppState);
  const [isLoading, setIsLoading] = useState(true); // Start as true until config check
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  // Effect to apply theme class to body
  useEffect(() => {
    if (appState.settings?.theme) {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(`theme-${appState.settings.theme}`);
    } else {
      // Default to dark theme if no settings yet (or explicitly remove light if it was there)
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }, [appState.settings?.theme]);


  // Helper to get or create a MonthData record in Supabase
  const getOrCreateSupabaseMonthRecord = useCallback(async (userId: string, monthYear: string): Promise<string> => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error(SUPABASE_CONFIG_ERROR_MESSAGE);
    }
    // Check if exists
    let { data: existingMonth, error: fetchError } = await supabase
      .from('months_data')
      .select('id')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle(); // Use maybeSingle for safer check

    if (fetchError) { // Any error other than not found (which maybeSingle handles by returning null data)
      throw new Error(`Falha ao verificar mês no Supabase: ${fetchError.message}`);
    }

    if (existingMonth) {
      return existingMonth.id;
    }

    // Create if not exists
    const { data: newMonth, error: insertError } = await supabase
      .from('months_data')
      .insert({ user_id: userId, month_year: monthYear, opening_balance: 0 })
      .select('id')
      .single(); // single is okay here, we expect one row back after insert

    if (insertError || !newMonth) {
      throw new Error(`Falha ao criar registro do mês ${monthYear} no Supabase: ${insertError?.message || 'No data returned'}`);
    }
    return newMonth.id;
  }, [isSupabaseConfigured]); 


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

    try {
      // 1. Fetch/Create Settings
      let { data: fetchedSettings, error: settingsQueryError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsQueryError) {
        console.error('Supabase settings initial fetch error:', settingsQueryError);
        throw settingsQueryError;
      }

      if (fetchedSettings) {
        settingsData = fetchedSettings as AppSettings;
        console.log(`Settings found for user ${userId}. Theme: ${settingsData.theme}`);
      } else {
        console.log(`Settings not found for user ${userId}, attempting to create default settings.`);
        try {
          const defaultSettingsForNewUser: Omit<AppSettings, 'user_id'> = {
            currencySymbol: 'R$',
            userNameDisplay: username,
            theme: 'dark', // Default theme for new users
          };
          const { data: newSettings, error: insertSettingsError } = await supabase
            .from('settings')
            .insert({ ...defaultSettingsForNewUser, user_id: userId })
            .select()
            .single();
          if (insertSettingsError) throw insertSettingsError;
          settingsData = newSettings as AppSettings;
          console.log(`Default settings created for user ${userId}. Theme: ${settingsData.theme}`);
        } catch (insertError: any) {
          if (insertError.code === '23505') { 
            console.warn(`Insert default settings failed with 23505 for user ${userId}. Assuming record exists. Re-fetching.`);
            const { data: refetchedSettings, error: refetchError } = await supabase
              .from('settings')
              .select('*')
              .eq('user_id', userId)
              .single(); 
            if (refetchError) {
              console.error('Error re-fetching settings after 23505:', refetchError);
              throw new Error(`Falha ao re-buscar configurações após erro de duplicidade (23505). Detalhe: ${refetchError.message}`);
            }
            if (!refetchedSettings) {
              console.error('Settings re-fetch after 23505 returned no data, this is unexpected.');
              throw new Error('Configurações não encontradas ao tentar re-buscar após erro de duplicidade (23505).');
            }
            settingsData = refetchedSettings as AppSettings;
            console.log('Settings successfully re-fetched after 23505 error.');
          } else {
            console.error('Supabase insert default settings error (non-23505):', insertError);
            throw insertError; 
          }
        }
      }

      // Ensure settingsData has a theme, default if somehow missing
      if (settingsData && !settingsData.theme) {
        settingsData.theme = 'dark';
      }


      // 2. Fetch/Create Active Month Year (Logic remains the same)
      let { data: activeMonthRecord, error: activeMonthQueryError } = await supabase
        .from('active_months')
        .select('active_month_year')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (activeMonthQueryError) {
        console.error('Supabase active_month initial fetch error:', activeMonthQueryError);
        throw activeMonthQueryError;
      }

      if (activeMonthRecord) {
        activeMonthYearToSet = activeMonthRecord.active_month_year;
        console.log(`Active month found for user ${userId}: ${activeMonthYearToSet}`);
      } else { 
         console.log(`Active month not found for user ${userId}, attempting to create default.`);
         try {
           const { error: insertActiveMonthError } = await supabase
             .from('active_months')
             .insert({ user_id: userId, active_month_year: activeMonthYearToSet });
           if (insertActiveMonthError) throw insertActiveMonthError;
           console.log(`Default active month created for user ${userId}: ${activeMonthYearToSet}`);
         } catch (insertError: any) {
           if (insertError.code === '23505') {
             console.warn(`Insert default active_month failed with 23505 for user ${userId}. Assuming record exists. Re-fetching.`);
             const { data: refetchedActiveMonth, error: refetchError } = await supabase
               .from('active_months')
               .select('active_month_year')
               .eq('user_id', userId)
               .single(); 
             if (refetchError) {
               console.error('Error re-fetching active_month after 23505:', refetchError);
               throw new Error(`Falha ao re-buscar mês ativo após erro de duplicidade (23505). Detalhe: ${refetchError.message}`);
             }
             if (!refetchedActiveMonth) {
                console.error('Active_month re-fetch after 23505 returned no data.');
                throw new Error('Mês ativo não encontrado ao tentar re-buscar após erro de duplicidade (23505).');
             }
             activeMonthYearToSet = refetchedActiveMonth.active_month_year;
             console.log('Active_month successfully re-fetched after 23505 error.');
           } else {
             console.error('Supabase insert default active_month error (non-23505):', insertError);
             throw insertError;
           }
         }
      }

      // 3. Fetch all MonthData entries for the user
      const { data: userMonthsData, error: monthsError } = await supabase
        .from('months_data')
        .select('*')
        .eq('user_id', userId);
      if (monthsError) {
        console.error('Supabase months_data fetch error:', monthsError);
        throw monthsError;
      }

      // 4. Fetch all Transactions for the user
      const { data: userTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false }); 
      if (transactionsError) {
        console.error('Supabase transactions fetch error:', transactionsError);
        throw transactionsError;
      }

      // 5. Reconstruct AppState.data
      const reconstructedData: Record<string, MonthData> = {};
      if (userMonthsData) {
        for (const mData of userMonthsData) {
          const monthTransactions = userTransactions?.filter(t => t.month_data_id === mData.id) || [];
          reconstructedData[mData.month_year] = {
            id: mData.id,
            monthYear: mData.month_year,
            openingBalance: mData.opening_balance,
            creditCardLimit: mData.credit_card_limit,
            user_id: mData.user_id,
            midMonth: {
              transactions: monthTransactions.filter(t => t.period_type === PeriodType.MID_MONTH)
            },
            endOfMonth: {
              transactions: monthTransactions.filter(t => t.period_type === PeriodType.END_OF_MONTH)
            }
          };
        }
      }
      
      if (!reconstructedData[activeMonthYearToSet]) {
        console.log(`Data for active month ${activeMonthYearToSet} not found locally, ensuring Supabase record exists.`);
        const monthId = await getOrCreateSupabaseMonthRecord(userId, activeMonthYearToSet);
        reconstructedData[activeMonthYearToSet] = createEmptyMonthDataStructure(activeMonthYearToSet, userId, monthId);
        console.log(`Local data structure for ${activeMonthYearToSet} created/ensured.`);
      }
      
      setAppState({
        isAuthenticated: true,
        currentUser: userId,
        currentUsername: username,
        settings: settingsData || defaultAppSettings, // Fallback to defaultAppSettings if somehow still null
        activeMonthYear: activeMonthYearToSet,
        data: reconstructedData,
      });
      console.log("User data loaded and state updated for:", username);

    } catch (err: any) {
      const baseUiMessage = "Falha crítica ao carregar os dados do usuário";
      let finalUiMessage = baseUiMessage;

      const errorProperties = ['message', 'code', 'details', 'hint'];
      const allErrorKeys = Object.getOwnPropertyNames(err).concat(errorProperties.filter(p => err[p] !== undefined));
      console.error(`${baseUiMessage}. Erro completo:`, JSON.stringify(err, Array.from(new Set(allErrorKeys)), 2));
      
      let parts = [baseUiMessage];
      if (err.message && typeof err.message === 'string' && err.message.trim() !== "") parts.push(`Detalhe: ${err.message.trim()}`);
      
      if (err.code && typeof err.code === 'string' && err.code.trim() !== "") parts.push(`Código: ${err.code.trim()}`);
      else if (err.code) parts.push(`Código: ${String(err.code)}`); 

      if (err.details && typeof err.details === 'string' && err.details.trim() !== "") parts.push(`Info: ${err.details.trim()}`);
      if (err.hint && typeof err.hint === 'string' && err.hint.trim() !== "") parts.push(`Dica: ${err.hint.trim()}`);
      
      finalUiMessage = parts.join('. ') + ". Tente recarregar a página ou contate o suporte se o problema persistir.";
      
      setError(finalUiMessage);
      setAppState(prevState => ({ 
        ...defaultInitialAppState,
        isAuthenticated: true, 
        currentUser: userId,
        currentUsername: username,
        settings: defaultAppSettings, 
        data: { [getCurrentMonthYear()]: createEmptyMonthDataStructure(getCurrentMonthYear(),userId) }
      }));
    } finally {
      setIsLoading(false); 
    }
  }, [getOrCreateSupabaseMonthRecord, isSupabaseConfigured]);

  // Effect for initial config check and session check
  useEffect(() => {
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
        console.log("Sessão válida encontrada para:", storedUsername);
         setAppState(prevState => ({
          ...prevState,
          isAuthenticated: true,
          currentUser: storedUserId,
          currentUsername: storedUsername,
        }));
      } else {
        if (storedUserId) console.log("Sessão expirada ou inválida, limpando localStorage.");
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

  // Effect to load data when user is authenticated, or manage isLoading state
   useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false); 
      return;
    }

    if (appState.isAuthenticated && appState.currentUser && appState.currentUsername) {
      if (!appState.data || Object.keys(appState.data).length === 0 || !appState.settings) {
        loadAllUserDataForUser(appState.currentUser, appState.currentUsername);
      } else {
        setIsLoading(false);
      }
    } else if (!appState.isAuthenticated) {
      setIsLoading(false);
    }
  }, [
    appState.isAuthenticated, 
    appState.currentUser, 
    appState.currentUsername, 
    appState.data,
    appState.settings,
    loadAllUserDataForUser,
    isSupabaseConfigured
  ]);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    if (!supabase || !isSupabaseConfigured) {
      setError(SUPABASE_CONFIG_ERROR_MESSAGE);
      setIsLoading(false);
      return false;
    }
    setIsLoading(true);
    clearError();
    const username = usernameInput.trim().toLowerCase();
    const password = passwordInput.trim();

    try {
      console.log(`Tentando login para usuário: ${username}`);
      const { data: userData, error: fetchUserError } = await supabase
        .from('users')
        .select('id, username, password_hash')
        .eq('username', username)
        .maybeSingle(); 

      if (fetchUserError) {
        const baseUiMessage = "Erro ao conectar com o banco de dados";
        let finalUiMessage = baseUiMessage;
        console.error(
            `${baseUiMessage}. Supabase error code: ${fetchUserError.code}, message: ${fetchUserError.message}, details: ${fetchUserError.details}, hint: ${fetchUserError.hint}`
        );

        if (fetchUserError.message && typeof fetchUserError.message === 'string' && fetchUserError.message.trim() !== "") {
          finalUiMessage = `${baseUiMessage}. Detalhe: ${fetchUserError.message}. (Verifique o console para código do erro)`;
        } else {
          finalUiMessage = `${baseUiMessage}. Verifique o console para mais informações. (Código: ${fetchUserError.code || 'N/A'})`;
        }
        setError(finalUiMessage);
        setIsLoading(false);
        return false;
      }
      
      if (!userData) { 
        console.warn(`Usuário '${username}' não encontrado no banco de dados. Verifique a capitalização e a existência do nome de usuário no Supabase.`);
        setError('Usuário não encontrado ou senha inválida.'); 
        setIsLoading(false);
        return false;
      }
      
      console.log(`Usuário ${username} encontrado. Verificando senha...`);
      if (userData.password_hash === password) {
        console.log(`Senha correta para ${username}. Login bem-sucedido.`);
        const expiryTime = Date.now() + SESSION_DURATION;
        localStorage.setItem(LOCAL_STORAGE_USER_ID, userData.id);
        localStorage.setItem(LOCAL_STORAGE_USERNAME, userData.username); 
        localStorage.setItem(LOCAL_STORAGE_SESSION_EXPIRY, expiryTime.toString());

        setAppState(prevState => ({ 
          ...defaultInitialAppState, 
          isAuthenticated: true,
          currentUser: userData.id,
          currentUsername: userData.username,
        }));
        return true;
      } else {
        console.warn(
          `Senha inválida para o usuário: ${username}. ` +
          `Senha Fornecida: "${password}", Senha Esperada (Hash no DB): "${userData.password_hash}". ` +
          `Verifique o valor exato do password_hash no Supabase.`
        );
        setError('Usuário não encontrado ou senha inválida.'); 
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      const baseUiMessage = "Erro inesperado durante o login";
      let finalUiMessage = baseUiMessage;

      console.error(`${baseUiMessage} (raw object):`, err);
      if (err.code) console.error(`Supabase error code: ${err.code}`);
      if (err.details) console.error(`Supabase error details: ${err.details}`);
      if (err.hint) console.error(`Supabase error hint: ${err.hint}`);

      if (err.message && typeof err.message === 'string' && err.message.trim() !== "") {
        finalUiMessage = `${baseUiMessage}. Detalhes: ${err.message}. (Verifique o console)`;
      } else {
        finalUiMessage = `${baseUiMessage}. Verifique o console para mais informações.`;
      }
      
      setError(finalUiMessage);
      setIsLoading(false);
      return false;
    }
  }, [isSupabaseConfigured]); 

  const logout = useCallback(() => {
    console.log("Iniciando processo de logout.");
    localStorage.removeItem(LOCAL_STORAGE_USER_ID);
    localStorage.removeItem(LOCAL_STORAGE_USERNAME);
    localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRY);
    setAppState(defaultInitialAppState); 
    setIsLoading(false); 
    setError(''); 
    console.log("Usuário deslogado, sessão limpa. Estado resetado.");
  }, []);
  
  const getOrCreateLocalMonthData = useCallback((monthYear: string, currentData: Record<string, MonthData>, userId: string): MonthData => {
    if (currentData[monthYear]) {
      return currentData[monthYear];
    }
    return createEmptyMonthDataStructure(monthYear, userId);
  }, []);

  const addTransaction = useCallback(async (
    monthYear: string, 
    periodType: PeriodType, 
    transactionData: Omit<Transaction, 'id' | 'month_data_id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      const monthDataId = await getOrCreateSupabaseMonthRecord(appState.currentUser, monthYear);
      
      const transactionToInsert = {
        ...transactionData,
        month_data_id: monthDataId,
        user_id: appState.currentUser,
        period_type: periodType,
      };

      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert(transactionToInsert)
        .select()
        .single();

      if (error || !newTransaction) throw error || new Error("Falha ao adicionar transação no Supabase.");

      setAppState(prevState => {
        const MData = getOrCreateLocalMonthData(monthYear, prevState.data, appState.currentUser!);
        const updatedPeriodTransactions = [...MData[periodType].transactions, newTransaction as Transaction]
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const updatedMonthObject: MonthData = {
          ...MData,
          id: MData.id || monthDataId, 
          [periodType]: { transactions: updatedPeriodTransactions }
        };

        return {
          ...prevState,
          data: { ...prevState.data, [monthYear]: updatedMonthObject },
        };
      });
    } catch (err: any) {
      console.error("Error adding transaction:", err);
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
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', appState.currentUser); 

      if (error) throw error;

      setAppState(prevState => {
        const newData = { ...prevState.data };
        for (const monthYearKey in newData) {
          const monthData = newData[monthYearKey];
          let transactionFoundAndRemoved = false;
          
          const midMonthTransactions = monthData.midMonth.transactions.filter(t => t.id !== transactionId);
          if (midMonthTransactions.length < monthData.midMonth.transactions.length) transactionFoundAndRemoved = true;
          monthData.midMonth.transactions = midMonthTransactions;

          if(!transactionFoundAndRemoved){
            const endOfMonthTransactions = monthData.endOfMonth.transactions.filter(t => t.id !== transactionId);
            if (endOfMonthTransactions.length < monthData.endOfMonth.transactions.length) transactionFoundAndRemoved = true;
            monthData.endOfMonth.transactions = endOfMonthTransactions;
          }
          
          if (transactionFoundAndRemoved) break; 
        }
        return { ...prevState, data: newData };
      });
    } catch (err: any) {
      console.error("Error deleting transaction:", err);
      setError(`Falha ao excluir transação: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, isSupabaseConfigured]);

  const updateTransaction = useCallback(async (updatedTransactionData: Transaction) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, month_data_id, user_id, created_at, updated_at, ...updatePayload } = updatedTransactionData;
      
      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', appState.currentUser) 
        .select()
        .single();

      if (error || !newTransaction) throw error || new Error("Falha ao atualizar transação no Supabase.");
      
      setAppState(prevState => {
        const newData = { ...prevState.data };
        let found = false;
        for (const monthYearKey in newData) {
          const currentMonthEntry = newData[monthYearKey];
          
          const updatePeriod = (period: FinancialPeriodData) => {
            const index = period.transactions.findIndex(t => t.id === newTransaction.id);
            if (index !== -1) {
              period.transactions[index] = newTransaction as Transaction;
              period.transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              found = true;
            }
          };
          
          updatePeriod(currentMonthEntry.midMonth);
          if (found) break;
          updatePeriod(currentMonthEntry.endOfMonth);
          if (found) break;
        }
        return { ...prevState, data: newData };
      });

    } catch (err: any) {
      console.error("Error updating transaction:", err);
      setError(`Falha ao atualizar transação: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, isSupabaseConfigured]); 

  const updateSettings = useCallback(async (newSettings: Partial<Omit<AppSettings, 'user_id'>>) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser || !appState.settings) { setError("Usuário não autenticado ou configurações não carregadas."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      const settingsToUpdate = { 
        ...appState.settings, 
        ...newSettings,      
        user_id: appState.currentUser 
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user_id, ...payload } = settingsToUpdate; 

      const { data: updatedSettingsData, error } = await supabase
        .from('settings')
        .update(payload)
        .eq('user_id', appState.currentUser)
        .select()
        .single();

      if (error || !updatedSettingsData) throw error || new Error("Falha ao atualizar configurações no Supabase.");

      setAppState(prevState => ({
        ...prevState,
        settings: updatedSettingsData as AppSettings,
      }));
    } catch (err: any) {
        const baseUiMessage = "Erro ao atualizar configurações";
        let finalUiMessage = baseUiMessage;

        const errorProperties = ['message', 'code', 'details', 'hint'];
        const allErrorKeys = Object.getOwnPropertyNames(err).concat(errorProperties.filter(p => err[p] !== undefined));
        console.error(`${baseUiMessage}. Erro completo:`, JSON.stringify(err, Array.from(new Set(allErrorKeys)), 2));
        
        let parts = [baseUiMessage];
        if (err.message && typeof err.message === 'string' && err.message.trim() !== "") parts.push(`Detalhe: ${err.message.trim()}`);
        
        if (err.code && typeof err.code === 'string' && err.code.trim() !== "") parts.push(`Código: ${err.code.trim()}`);
        else if (err.code) parts.push(`Código: ${String(err.code)}`); 

        if (err.details && typeof err.details === 'string' && err.details.trim() !== "") parts.push(`Info: ${err.details.trim()}`);
        if (err.hint && typeof err.hint === 'string' && err.hint.trim() !== "") parts.push(`Dica: ${err.hint.trim()}`);
        
        finalUiMessage = parts.join('. ') + ". Tente novamente ou contate o suporte se o problema persistir.";
        setError(finalUiMessage);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, appState.settings, isSupabaseConfigured]); 

  const updateMonthData = useCallback(async (monthYear: string, dataToUpdate: Partial<Pick<MonthData, 'openingBalance' | 'creditCardLimit'>>) => {
     if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    setIsSaving(true); clearError();
    try {
      const monthRecordId = await getOrCreateSupabaseMonthRecord(appState.currentUser, monthYear);
      
      const { error } = await supabase
        .from('months_data')
        .update(dataToUpdate)
        .eq('id', monthRecordId)
        .eq('user_id', appState.currentUser);

      if (error) throw error;

      setAppState(prevState => {
        const MData = getOrCreateLocalMonthData(monthYear, prevState.data, appState.currentUser!);
        const updatedMonthObject = { ...MData, id: MData.id || monthRecordId, ...dataToUpdate };
        return {
          ...prevState,
          data: { ...prevState.data, [monthYear]: updatedMonthObject },
        };
      });
    } catch (err: any) {
        const baseUiMessage = "Erro ao atualizar dados do mês";
        let finalUiMessage = baseUiMessage;

        const errorProperties = ['message', 'code', 'details', 'hint'];
        const allErrorKeys = Object.getOwnPropertyNames(err).concat(errorProperties.filter(p => err[p] !== undefined));
        console.error(`${baseUiMessage}. Erro completo:`, JSON.stringify(err, Array.from(new Set(allErrorKeys)), 2));
        
        let parts = [baseUiMessage];
        if (err.message && typeof err.message === 'string' && err.message.trim() !== "") parts.push(`Detalhe: ${err.message.trim()}`);
        
        if (err.code && typeof err.code === 'string' && err.code.trim() !== "") parts.push(`Código: ${err.code.trim()}`);
        else if (err.code) parts.push(`Código: ${String(err.code)}`);

        if (err.details && typeof err.details === 'string' && err.details.trim() !== "") parts.push(`Info: ${err.details.trim()}`);
        if (err.hint && typeof err.hint === 'string' && err.hint.trim() !== "") parts.push(`Dica: ${err.hint.trim()}`);
        
        finalUiMessage = parts.join('. ') + ". Tente novamente ou contate o suporte se o problema persistir.";
        setError(finalUiMessage);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, getOrCreateSupabaseMonthRecord, getOrCreateLocalMonthData, isSupabaseConfigured]); 
  
  const setActiveMonthYear = useCallback(async (monthYear: string) => {
    if (!supabase || !isSupabaseConfigured) { setError(SUPABASE_CONFIG_ERROR_MESSAGE); setIsSaving(false); return; }
    if (!appState.currentUser) { setError("Usuário não autenticado."); setIsSaving(false); return; }
    
    setAppState(prevState => {
      let updatedData = { ...prevState.data };
      if (!updatedData[monthYear] && prevState.currentUser) { 
        updatedData[monthYear] = createEmptyMonthDataStructure(monthYear, prevState.currentUser);
      }
      return { ...prevState, activeMonthYear: monthYear, data: updatedData };
    });

    setIsSaving(true); clearError();
    try {
      let { data: existingActiveMonth, error: fetchActiveError } = await supabase
        .from('active_months')
        .select('user_id')
        .eq('user_id', appState.currentUser)
        .maybeSingle();

      if (fetchActiveError) throw fetchActiveError;

      if (existingActiveMonth) {
        const { error: updateError } = await supabase
          .from('active_months')
          .update({ active_month_year: monthYear })
          .eq('user_id', appState.currentUser);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('active_months')
          .insert({ user_id: appState.currentUser, active_month_year: monthYear });
        if (insertError) throw insertError;
      }
      
      if (!appState.data[monthYear]?.id && appState.currentUser) {
         await getOrCreateSupabaseMonthRecord(appState.currentUser, monthYear); 
      }

    } catch (err:any) {
        console.error("Error setting active month in Supabase:", err);
        setError(`Falha ao definir mês ativo no servidor: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [appState.currentUser, appState.data, getOrCreateSupabaseMonthRecord, isSupabaseConfigured]); 

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
    if (!monthData || !monthData[periodType]) return [];
    
    const transactions = monthData[periodType].transactions || [];
    if (transactionTypeParam) {
      return transactions.filter(t => t.type === transactionTypeParam);
    }
    return transactions;
  }, [appState.data]);

  const getAllTransactionsForMonth = useCallback((monthYear: string, transactionTypeParam?: TransactionType): Transaction[] => {
    const monthData = appState.data[monthYear];
    if (!monthData) return [];
    
    let transactions = [
      ...(monthData.midMonth?.transactions || []),
      ...(monthData.endOfMonth?.transactions || []),
    ];
    
    if (transactionTypeParam) {
      transactions = transactions.filter(t => t.type === transactionTypeParam);
    }
    return transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  }, [appState.data]);

  const getMonthlySummary = useCallback((monthYear: string) => {
    const monthDataToUse = appState.data[monthYear] || createEmptyMonthDataStructure(monthYear, appState.currentUser || undefined);
    
    const allIncome = getAllTransactionsForMonth(monthYear, TransactionType.INCOME);
    const allExpenses = getAllTransactionsForMonth(monthYear, TransactionType.EXPENSE);

    const totalIncome = allIncome.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const accountBalance = (monthDataToUse.openingBalance || 0) + netSavings;

    const creditCardSpent = allExpenses
      .filter(t => t.category === "Cartão de Crédito")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const creditCardRemainingLimit = monthDataToUse.creditCardLimit !== undefined && monthDataToUse.creditCardLimit !== null
      ? monthDataToUse.creditCardLimit - creditCardSpent 
      : undefined;

    const totalBenefits = allIncome
      .filter(t => BENEFIT_CATEGORIES.includes(t.category))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      accountBalance,
      creditCardSpent,
      creditCardRemainingLimit,
      totalBenefits,
    };
  }, [appState.data, appState.currentUser, getAllTransactionsForMonth]);

  return (
    <AppContext.Provider value={{ 
      ...appState,
      isLoading,
      isSaving,
      error, 
      addTransaction, 
      deleteTransaction, 
      updateTransaction, 
      updateSettings,
      updateMonthData,
      setActiveMonthYear,
      getCurrentMonthData,
      getTransactionsForPeriod,
      getAllTransactionsForMonth,
      getMonthlySummary,
      login,
      logout,
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
