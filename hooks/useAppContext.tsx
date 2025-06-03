
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppContextType, MonthData, Transaction, PeriodType, TransactionType, AppSettings, BENEFIT_CATEGORIES, UserSpecificData } from '../types';
import { getCurrentMonthYear, generateId } from '../utils/formatters';

// URL for the Google Apps Script Web App
const GOOGLE_SHEET_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbXzBf_MPmQ1p98GpSCe61-Iboqp_Rh3k3jEP085XVTg1Ir2sJrQbhx6KLEmGEuwEdlw/exec';

// localStorage keys
const LOCAL_STORAGE_CURRENT_USER = 'financeAppCurrentUser';
const LOCAL_STORAGE_SESSION_EXPIRY = 'financeAppSessionExpiry';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

const createEmptyMonthData = (monthYear: string): MonthData => ({
  monthYear,
  midMonth: { transactions: [] },
  endOfMonth: { transactions: [] },
  openingBalance: 0,
  creditCardLimit: undefined,
});

const defaultUserSpecificData = (monthYear: string = getCurrentMonthYear(), username?: string): UserSpecificData => ({
  activeMonthYear: monthYear,
  data: {
    [monthYear]: createEmptyMonthData(monthYear),
  },
  settings: {
    currencySymbol: 'R$',
    userName: username,
    theme: 'dark',
  },
});

const defaultInitialAppState: AppState = {
  ...defaultUserSpecificData(),
  isAuthenticated: false,
  currentUser: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(defaultInitialAppState);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(''); 

  const loadDataFromSheet = useCallback(async (username: string | null) => {
    if (!username) {
      setIsLoading(false); // Should not happen if called correctly
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
        const response = await fetch(`${GOOGLE_SHEET_APP_SCRIPT_URL}?action=load&user=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP error! status: ${response.status} - ${response.statusText}` };
            }
            throw new Error(errorData.error || `Erro HTTP ao carregar: ${response.status}`);
        }
        
        const loadedData: UserSpecificData | { error?: string } = await response.json();

        if (loadedData && typeof loadedData === 'object') {
          if ('error' in loadedData && typeof loadedData.error === 'string') {
            throw new Error(`Erro da Planilha ao carregar: ${loadedData.error}`);
          } else if ('activeMonthYear' in loadedData && 'data' in loadedData && 'settings' in loadedData) {
            const userSpecificData = loadedData as UserSpecificData;
            const activeMonthFromSheet = userSpecificData.activeMonthYear || getCurrentMonthYear();
            let dataFromSheet = userSpecificData.data && Object.keys(userSpecificData.data).length > 0 
                                ? userSpecificData.data
                                : { [activeMonthFromSheet]: createEmptyMonthData(activeMonthFromSheet) };

            if (!dataFromSheet[activeMonthFromSheet]) {
                dataFromSheet[activeMonthFromSheet] = createEmptyMonthData(activeMonthFromSheet);
            }
            
            setAppState(prevState => ({
                ...prevState, // Keep currentUser and isAuthenticated from session restore or login
                activeMonthYear: activeMonthFromSheet,
                data: dataFromSheet,
                settings: { ...defaultUserSpecificData(activeMonthFromSheet, username).settings, ...userSpecificData.settings },
            }));
          } else {
            console.warn("Resposta da Planilha Google ao carregar não continha dados esperados (estrutura de objeto inesperada):", loadedData);
            setAppState(prevState => ({
                ...prevState,
                ...defaultUserSpecificData(getCurrentMonthYear(), username), // Use username here
            }));
          }
        } else {
          console.warn("Resposta da Planilha Google ao carregar não era um objeto válido (e.g. null):", loadedData);
          setAppState(prevState => ({
              ...prevState,
              ...defaultUserSpecificData(getCurrentMonthYear(), username), // Use username here
          }));
        }
    } catch (err: any) {
      console.error(`Falha ao carregar dados para ${username} da Planilha Google:`, err);
      setError(`Falha ao carregar dados: ${err.message}. Usando dados padrão temporariamente.`);
      setAppState(prevState => ({
          ...prevState, 
          ...defaultUserSpecificData(getCurrentMonthYear(), username), // Use username here
      }));
    } finally {
      setIsLoading(false);
    }
  }, []); 

  // Effect for initial session check - runs only once on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
      const storedExpiry = localStorage.getItem(LOCAL_STORAGE_SESSION_EXPIRY);

      if (storedUser && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        if (Date.now() < expiryTime) {
          // Session is valid
          console.log("Sessão válida encontrada para:", storedUser);
          setAppState(prevState => ({
            ...prevState,
            ...defaultUserSpecificData(getCurrentMonthYear(), storedUser), // Initialize user-specific parts
            isAuthenticated: true,
            currentUser: storedUser,
          }));
          // Data loading will be triggered by the next useEffect
          return; 
        } else {
          // Session expired
          console.log("Sessão expirada encontrada.");
          localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
          localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRY);
        }
      }
    } catch (error) {
      console.error("Erro ao ler sessão do localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
      localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRY);
    }
    // If no valid session, ensure initial state and stop loading
    setAppState(defaultInitialAppState); // Ensure clean slate
    setIsLoading(false);
  }, []); // Empty dependency array: run only once

  // This useEffect handles loading data when authentication state changes to authenticated
  // or when the current user changes.
  useEffect(() => {
    if (appState.isAuthenticated && appState.currentUser) {
      // This condition ensures loadDataFromSheet is called after session restore or login
      // and not unnecessarily if other parts of appState change.
      console.log(`Usuário autenticado: ${appState.currentUser}. Disparando carregamento de dados.`);
      loadDataFromSheet(appState.currentUser);
    } else if (!appState.isAuthenticated && !appState.currentUser && !isLoading) { 
      // If not authenticated and not already in an initial loading phase from session check
      setAppState(defaultInitialAppState); 
      // setIsLoading(false); // Already handled by session check or loadDataFromSheet finally
    }
  }, [appState.isAuthenticated, appState.currentUser, loadDataFromSheet]); // loadDataFromSheet is stable


  const saveDataToSheet = useCallback(async (stateToSave: AppState, username: string | null) => {
    if (!stateToSave.isAuthenticated || !username) {
      console.log("Usuário não autenticado ou nome de usuário ausente. Dados não serão salvos.");
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
        const payloadToSave: UserSpecificData = {
            data: stateToSave.data,
            settings: stateToSave.settings,
            activeMonthYear: stateToSave.activeMonthYear,
        };
        
        const requestBody = {
            action: 'save',
            user: username,
            payload: payloadToSave
        };
        
        const response = await fetch(GOOGLE_SHEET_APP_SCRIPT_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(requestBody), 
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch(e) {
                 errorData = { message: `Erro HTTP ao salvar: ${response.status} - ${response.statusText}`};
            }
            throw new Error(errorData.message || errorData.error || `Erro HTTP: ${response.status}`);
        }

        const resultText = await response.text();
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("Falha ao analisar resposta JSON do salvamento:", resultText);
            throw new Error("Resposta inválida do servidor ao salvar.");
        }

        if (result.status !== 'success') {
            throw new Error(result.message || "Falha desconhecida ao salvar na Planilha Google.");
        }
        console.log(`Dados para ${username} salvos na Planilha Google com sucesso.`);

    } catch (err: any) {
        console.error(`Falha ao salvar dados para ${username} na Planilha Google:`, err);
        setError(`Falha ao salvar dados: ${err.message}. Suas últimas alterações podem não ter sido persistidas.`);
    } finally {
        setIsSaving(false);
    }
  }, []); 

  
  const getOrCreateMonthData = useCallback((monthYear: string, currentData: Record<string, MonthData>): MonthData => {
    if (currentData[monthYear]) {
      return currentData[monthYear];
    }
    return createEmptyMonthData(monthYear);
  }, []);

  const updateStateAndSave = useCallback((updater: (prevState: AppState) => AppState) => {
    setAppState(prevState => {
      const newState = updater(prevState);
      if (newState.isAuthenticated && newState.currentUser) { 
          saveDataToSheet(newState, newState.currentUser); 
      }
      return newState;
    });
  }, [saveDataToSheet]);


  const addTransaction = useCallback((monthYear: string, periodType: PeriodType, transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: generateId(),
    };
    
    updateStateAndSave(prevState => {
      const monthData = getOrCreateMonthData(monthYear, prevState.data);
      const updatedPeriodData = {
        ...monthData[periodType],
        transactions: [...monthData[periodType].transactions, newTransaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
      const newData = {
        ...prevState.data,
        [monthYear]: {
          ...monthData,
          [periodType]: updatedPeriodData,
        },
      };
      return { ...prevState, data: newData };
    });
  }, [getOrCreateMonthData, updateStateAndSave]);

  const deleteTransaction = useCallback((monthYear: string, periodType: PeriodType, transactionId: string) => {
    updateStateAndSave(prevState => {
      const monthData = getOrCreateMonthData(monthYear, prevState.data);
      const updatedTransactions = monthData[periodType].transactions.filter(t => t.id !== transactionId);
      const updatedPeriodData = { ...monthData[periodType], transactions: updatedTransactions };
      const newData = {
        ...prevState.data,
        [monthYear]: { ...monthData, [periodType]: updatedPeriodData },
      };
      return { ...prevState, data: newData };
    });
  }, [getOrCreateMonthData, updateStateAndSave]);

  const updateTransaction = useCallback((monthYear: string, periodType: PeriodType, updatedTransaction: Transaction) => {
    updateStateAndSave(prevState => {
      const monthData = getOrCreateMonthData(monthYear, prevState.data);
      const updatedTransactions = monthData[periodType].transactions.map(t =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const updatedPeriodData = { ...monthData[periodType], transactions: updatedTransactions };
      const newData = {
        ...prevState.data,
        [monthYear]: { ...monthData, [periodType]: updatedPeriodData },
      };
      return { ...prevState, data: newData };
    });
  }, [getOrCreateMonthData, updateStateAndSave]);
  
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    updateStateAndSave(prevState => {
      const updatedSettings = { ...prevState.settings, ...newSettings };
      return { ...prevState, settings: updatedSettings };
    });
  }, [updateStateAndSave]);

  const updateMonthData = useCallback((monthYear: string, dataToUpdate: Partial<Pick<MonthData, 'openingBalance' | 'creditCardLimit'>>) => {
     updateStateAndSave(prevState => {
      const currentMonth = getOrCreateMonthData(monthYear, prevState.data);
      const updatedMonth = { ...currentMonth, ...dataToUpdate };
      const newData = { ...prevState.data, [monthYear]: updatedMonth };
      return { ...prevState, data: newData };
    });
  }, [getOrCreateMonthData, updateStateAndSave]);
  
  const setActiveMonthYear = useCallback((monthYear: string) => {
    updateStateAndSave(prevState => {
      let updatedData = { ...prevState.data };
      if (!updatedData[monthYear]) {
        updatedData[monthYear] = createEmptyMonthData(monthYear);
      }
      return { ...prevState, activeMonthYear: monthYear, data: updatedData };
    });
  }, [updateStateAndSave]);

 const getCurrentMonthData = useCallback((): MonthData => {
    const currentData = appState.data[appState.activeMonthYear];
    if (currentData) {
        return currentData;
    }
    return createEmptyMonthData(appState.activeMonthYear);
  }, [appState.activeMonthYear, appState.data]);


  const getTransactionsForPeriod = useCallback((monthYear: string, periodType: PeriodType, transactionTypeParam?: TransactionType): Transaction[] => {
    const monthData = appState.data[monthYear];
    if (!monthData || !monthData[periodType]) {
      return [];
    }
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
    const monthDataToUse = appState.data[monthYear] || createEmptyMonthData(monthYear);
    
    const allIncome = getAllTransactionsForMonth(monthYear, TransactionType.INCOME);
    const allExpenses = getAllTransactionsForMonth(monthYear, TransactionType.EXPENSE);

    const totalIncome = allIncome.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const accountBalance = (monthDataToUse.openingBalance || 0) + netSavings;

    const creditCardSpent = allExpenses
      .filter(t => t.category === "Cartão de Crédito")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const creditCardRemainingLimit = monthDataToUse.creditCardLimit !== undefined 
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
  }, [appState.data, getAllTransactionsForMonth]); 

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setError(''); 
    setIsLoading(true); // Start loading process for login attempt
    const username = usernameInput.trim();
    const password = passwordInput.trim();

    let loggedInUser: string | null = null;

    if (username === 'admin' && password === '2391') {
      loggedInUser = 'admin';
    } else if (username === 'gilson' && password === '1234') {
      loggedInUser = 'gilson';
    }

    if (loggedInUser) {
      const expiryTime = Date.now() + SESSION_DURATION;
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, loggedInUser);
      localStorage.setItem(LOCAL_STORAGE_SESSION_EXPIRY, expiryTime.toString());
      
      const initialDataForUser = defaultUserSpecificData(getCurrentMonthYear(), loggedInUser);
      
      setAppState({ 
        ...initialDataForUser,
        isAuthenticated: true,
        currentUser: loggedInUser,
      });
      // loadDataFromSheet will be called by the useEffect due to isAuthenticated and currentUser changing
      // setIsLoading(false) will be handled by loadDataFromSheet's finally block
      return true;
    }
    setError('Usuário ou senha inválidos.');
    setAppState(prevState => ({...prevState, isAuthenticated: false, currentUser: null}));
    setIsLoading(false); // Login failed, stop loading
    return false;
  }, []); // loadDataFromSheet is not a direct dep here, but part of the flow triggered by state change
  
  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
    localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRY);
    setAppState({ ...defaultInitialAppState }); 
    setIsLoading(false); // Ensure loading stops on logout
    console.log("Usuário deslogado, sessão limpa.");
  }, []); 


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
