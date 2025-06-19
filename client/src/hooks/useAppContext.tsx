import { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppContext, AppContextType } from '../contexts/AppContext';
import { apiRequest } from '../lib/queryClient';
import { User, MonthData, Transaction, Settings, ActiveMonth } from '../types';
import { useToast } from './use-toast';

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(null);
  const [currentMonth, setCurrentMonthState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Auth queries
  const { data: authData } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !user,
    retry: false,
  });

  // Active month query
  const { data: activeMonthData } = useQuery<ActiveMonth>({
    queryKey: ['/api/active-month'],
    enabled: !!user,
  });

  // Month data query
  const { data: monthData } = useQuery<MonthData>({
    queryKey: ['/api/months', currentMonth],
    enabled: !!user && !!currentMonth,
  });

  // Transactions query
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', currentMonth],
    enabled: !!user && !!currentMonth,
  });

  // Settings query
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    enabled: !!user,
  });

  // Auth mutations
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries();
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${data.user.username}!`,
      });
    },
    onError: () => {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', { username, password });
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries();
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${data.user.username}!`,
      });
    },
    onError: () => {
      toast({
        title: "Erro no registro",
        description: "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      setCurrentMonthState('');
      queryClient.clear();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    },
  });

  // Transaction mutations
  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'monthDataId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/transactions', {
        ...transaction,
        monthYear: currentMonth,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', currentMonth] });
      queryClient.invalidateQueries({ queryKey: ['/api/months', currentMonth] });
      toast({
        title: "Transação adicionada",
        description: "A transação foi salva com sucesso.",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const response = await apiRequest('POST', '/api/settings', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas.",
      });
    },
  });

  const setActiveMonthMutation = useMutation({
    mutationFn: async (monthYear: string) => {
      const response = await apiRequest('POST', '/api/active-month', {
        active_month_year: monthYear,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/active-month'] });
    },
  });

  // Effects
  useEffect(() => {
    if (authData?.user) {
      setUser(authData.user);
    }
    setIsLoading(false);
  }, [authData]);

  useEffect(() => {
    if (activeMonthData?.activeMonthYear) {
      setCurrentMonthState(activeMonthData.activeMonthYear);
    } else if (!currentMonth) {
      // Set current month as default
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setCurrentMonthState(monthYear);
    }
  }, [activeMonthData, currentMonth]);

  // Financial calculations
  const getTotalIncome = (): number => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = (): number => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  };

  const getNetSavings = (): number => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getAccountBalance = (): number => {
    const openingBalance = monthData?.openingBalance || 0;
    return openingBalance + getNetSavings();
  };

  const getCategoryTotals = (): Record<string, number> => {
    const totals: Record<string, number> = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      }
    });
    return totals;
  };

  // Methods
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const register = async (username: string, password: string) => {
    await registerMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const setCurrentMonth = async (monthYear: string) => {
    setCurrentMonthState(monthYear);
    await setActiveMonthMutation.mutateAsync(monthYear);
  };

  const updateMonthData = async (updates: Partial<MonthData>) => {
    // Implementation would go here
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'monthDataId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    await addTransactionMutation.mutateAsync(transaction);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    // Implementation would go here
  };

  const deleteTransaction = async (id: string) => {
    // Implementation would go here
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    await updateSettingsMutation.mutateAsync(updates);
  };

  return {
    user,
    currentMonth,
    monthData: monthData || null,
    transactions,
    settings: settings || null,
    isLoading,

    login,
    register,
    logout,

    setCurrentMonth,
    updateMonthData,

    addTransaction,
    updateTransaction,
    deleteTransaction,

    updateSettings,

    getTotalIncome,
    getTotalExpenses,
    getNetSavings,
    getAccountBalance,
    getCategoryTotals,
  };
}