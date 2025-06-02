
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppContextType, MonthData, Transaction, PeriodType, TransactionType, AppSettings, BENEFIT_CATEGORIES } from '../types';
import { getCurrentMonthYear, generateId } from '../utils/formatters';

// URL for the Google Apps Script Web App
const GOOGLE_SHEET_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbXzBf_MPmQ1p98GpSCe61-Iboqp_Rh3k3jEP085XVTg1Ir2sJrQbhx6KLEmGEuwEdlw/exec';

const createEmptyMonthData = (monthYear: string): MonthData => ({
  monthYear,
  midMonth: { transactions: [] },
  endOfMonth: { transactions: [] },
  openingBalance: 0,
  creditCardLimit: undefined,
});

const defaultInitialAppState: AppState = {
  activeMonthYear: getCurrentMonthYear(),
  data: {
    [getCurrentMonthYear()]: createEmptyMonthData(getCurrentMonthYear()),
  },
  settings: {
    currencySymbol: 'R$',
    userName: undefined,
    theme: 'dark',
  },
  isAuthenticated: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(defaultInitialAppState);
  const [isLoading, setIsLoading] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(''); 

  const loadDataFromSheet = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
        const response = await fetch(`${GOOGLE_SHEET_APP_SCRIPT_URL}?action=load`);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // If response is not JSON, use status text or a generic message
                errorData = { error: `HTTP error! status: ${response.status} - ${response.statusText}` };
            }
            throw new Error(errorData.error || `Erro HTTP ao carregar: ${response.status}`);
        }
        
        const loadedUserData = await response.json();

        if (loadedUserData && typeof loadedUserData === 'object' && !loadedUserData.error) {
            setAppState(prevState => {
                const activeMonthFromSheet = loadedUserData.activeMonthYear || defaultInitialAppState.activeMonthYear;
                let dataFromSheet = loadedUserData.data && Object.keys(loadedUserData.data).length > 0 
                                    ? loadedUserData.data
                                    : { [activeMonthFromSheet]: createEmptyMonthData(activeMonthFromSheet) };

                // Ensure the active month (from sheet or default) has an entry in the data
                if (!dataFromSheet[activeMonthFromSheet]) {
                    dataFromSheet[activeMonthFromSheet] = createEmptyMonthData(activeMonthFromSheet);
                }
                
                return {
                    ...prevState, 
                    activeMonthYear: activeMonthFromSheet,
                    data: dataFromSheet,
                    settings: { ...defaultInitialAppState.settings, ...loadedUserData.settings },
                    // isAuthenticated should be preserved from current state before load
                };
            });
        } else if (loadedUserData.error) {
            throw new Error(`Erro da Planilha ao carregar: ${loadedUserData.error}`);
        } else {
            // This case might happen if the script returns empty or non-JSON for success.
            // For now, treat as an error or unexpected response.
            console.warn("Resposta da Planilha Google ao carregar não continha dados esperados, mas sem erro explícito:", loadedUserData);
            throw new Error("Resposta inesperada da Planilha Google ao carregar. Verifique o script.");
        }
    } catch (err: any) {
      console.error("Falha ao carregar dados da Planilha Google:", err);
      setError(`Falha ao carregar dados: ${err.message}. Verifique sua conexão ou a configuração da planilha. Usando dados padrão temporariamente.`);
      setAppState(prevState => ({
          ...defaultInitialAppState, 
          isAuthenticated: prevState.isAuthenticated, // Keep existing auth state
          activeMonthYear: prevState.isAuthenticated ? prevState.activeMonthYear : defaultInitialAppState.activeMonthYear,
      }));
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (appState.isAuthenticated) {
        if (Object.keys(appState.data).length <= 1 && appState.data[defaultInitialAppState.activeMonthYear] && appState.data[defaultInitialAppState.activeMonthYear].midMonth.transactions.length === 0 && appState.data[defaultInitialAppState.activeMonthYear].endOfMonth.transactions.length === 0) {
           // Only load if data seems to be in its initial empty state or after a logout/reload without data.
           loadDataFromSheet();
        } else {
            setIsLoading(false); // Data already seems to be populated or modified, don't overwrite with load from sheet implicitly
        }
    } else {
        setAppState(defaultInitialAppState); 
        setIsLoading(false); 
    }
  }, [appState.isAuthenticated, loadDataFromSheet]);


  const saveDataToSheet = useCallback(async (stateToSave: AppState) => {
    if (!stateToSave.isAuthenticated) {
      console.log("Usuário não autenticado. Dados não serão salvos na planilha.");
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
        const payloadToSave = {
            action: 'save',
            payload: {
                data: stateToSave.data,
                settings: stateToSave.settings,
                activeMonthYear: stateToSave.activeMonthYear,
            }
        };
        
        const response = await fetch(GOOGLE_SHEET_APP_SCRIPT_URL, {
            method: 'POST',
            headers: {
              // Change Content-Type to text/plain as a common workaround for Apps Script POST CORS issues.
              // The Apps Script (doPost) will still parse e.postData.contents as JSON.
              'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(payloadToSave), 
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

        const resultText = await response.text(); // Get text first for robust parsing
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse JSON response from save:", resultText);
            throw new Error("Resposta inválida do servidor ao salvar.");
        }

        if (result.status !== 'success') {
            throw new Error(result.message || "Falha desconhecida ao salvar na Planilha Google.");
        }
        console.log("Dados salvos na Planilha Google com sucesso.");

    } catch (err: any) {
        console.error("Falha ao salvar dados na Planilha Google:", err);
        setError(`Falha ao salvar dados: ${err.message}. Suas últimas alterações podem não ter sido persistidas.`);
        // Optionally, you might want to re-enable a "Save" button or indicate unsaved changes here
    } finally {
        setIsSaving(false);
    }
  }, []); 

  
  const getOrCreateMonthData = useCallback((monthYear: string, currentData: Record<string, MonthData>): MonthData => {
    if (currentData[monthYear]) {
      return currentData[monthYear];
    }
    console.log(`Criando estrutura para o mês ${monthYear} pois não existia.`);
    return createEmptyMonthData(monthYear);
  }, []);

  const updateStateAndSave = useCallback((updater: (prevState: AppState) => AppState) => {
    setAppState(prevState => {
      const newState = updater(prevState);
      if (newState.isAuthenticated) { 
          saveDataToSheet(newState); 
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
    console.warn(`Dados para o mês ativo ${appState.activeMonthYear} não encontrados. Retornando estrutura vazia temporária.`);
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

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setError(''); 
    if (username === 'admin' && password === '1234') {
      setAppState(prevState => ({ ...prevState, isAuthenticated: true, data: defaultInitialAppState.data, activeMonthYear: defaultInitialAppState.activeMonthYear, settings: defaultInitialAppState.settings })); // Reset data to ensure fresh load
      // loadDataFromSheet will be called by useEffect due to isAuthenticated changing
      return true;
    }
    setError('Usuário ou senha inválidos.');
    return false;
  }, []); 
  
  const logout = useCallback(() => {
    setAppState({ ...defaultInitialAppState, isAuthenticated: false }); 
    console.log("Usuário deslogado.");
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
