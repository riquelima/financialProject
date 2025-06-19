
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext.js';
import { formatCurrency, getMonthName } from '../utils/formatters.js';
import SummaryCard from '../components/SummaryCard.js';
import MonthNavigator from '../components/MonthNavigator.js';
import FloatingActionButton from '../components/FloatingActionButton.js';
import AddTransactionModal from '../components/AddTransactionModal.js';
import TransactionListModal from '../components/TransactionListModal.js';
import ExpensePieChart from '../components/ExpensePieChart.js';
import MonthlySummaryChart from '../components/MonthlySummaryChart.js';
// import AiChatFab from '../components/AiChatFab'; // Removed import
import AiChatModal from '../components/AiChatModal.js';
import { PeriodType, Transaction, TransactionType } from '../types.js';
import { DollarSignIcon, TrendingUpIcon, BarChart2Icon, PieChartIcon, COLORS } from '../constants.js';

const DashboardScreen: React.FC = () => {
  const {
    activeMonthYear,
    settings,
    getMonthlySummary,
    getCurrentMonthData,
    getAllTransactionsForMonth,
    currentUsername,
    deleteTransaction,
    addTransaction, // Need addTransaction if editing might change month/period logic fundamentally, or just updateTransaction
    updateTransaction
  } = useAppContext();

  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalPeriodType, setModalPeriodType] = useState<PeriodType>(PeriodType.MID_MONTH);

  const [isProventosModalOpen, setIsProventosModalOpen] = useState(false);
  const [isDebitosModalOpen, setIsDebitosModalOpen] = useState(false);
  const [isMonthlyChartVisible, setIsMonthlyChartVisible] = useState(false);
  const [isAiChatModalOpen, setIsAiChatModalOpen] = useState(false);

  const summary = getMonthlySummary(activeMonthYear);
  const currentMonthData = getCurrentMonthData();

  const currencySymbol = settings?.currencySymbol || 'R$';

  const incomeTransactions = useMemo(() => {
    if (!isProventosModalOpen) return [];
    return getAllTransactionsForMonth(activeMonthYear, TransactionType.INCOME);
  }, [activeMonthYear, getAllTransactionsForMonth, isProventosModalOpen]);

  const allExpenseTransactions = useMemo(() => {
    // Check if debitos modal is open to only compute then, or compute always if used by pie chart regardless
    // For now, let's assume it's always needed for pie chart if visible
    return getAllTransactionsForMonth(activeMonthYear, TransactionType.EXPENSE);
  }, [activeMonthYear, getAllTransactionsForMonth]);

  const handleOpenAddTransactionModal = () => {
    setEditingTransaction(null);
    // Determine period type based on current date or a default
    const dayOfMonth = new Date().getDate();
    const defaultPeriodType = dayOfMonth <= 15 ? PeriodType.MID_MONTH : PeriodType.END_OF_MONTH;
    setModalPeriodType(defaultPeriodType);
    setIsAddTransactionModalOpen(true);
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const transactionDate = new Date(transaction.date + 'T00:00:00'); // Ensure proper date parsing for day
    const dayOfTransaction = transactionDate.getDate();
    setModalPeriodType(dayOfTransaction <= 15 ? PeriodType.MID_MONTH : PeriodType.END_OF_MONTH);

    // Close the list modal before opening the edit modal
    if (isProventosModalOpen) setIsProventosModalOpen(false);
    if (isDebitosModalOpen) setIsDebitosModalOpen(false);

    setIsAddTransactionModalOpen(true);
  };

  const handleDeleteTransactionInModal = (transaction: Transaction) => {
    if (window.confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      deleteTransaction(transaction.id);
      // Optionally, close the list modal if it's the last item or desired behavior
      // if (incomeTransactions.length === 1 && transaction.type === TransactionType.INCOME) setIsProventosModalOpen(false);
      // if (allExpenseTransactions.length === 1 && transaction.type === TransactionType.EXPENSE) setIsDebitosModalOpen(false);
    }
  };


  const openProventosModal = () => setIsProventosModalOpen(true);
  const closeProventosModal = () => setIsProventosModalOpen(false);

  const openDebitosModal = () => setIsDebitosModalOpen(true);
  const closeDebitosModal = () => setIsDebitosModalOpen(false);

  if (!settings || !currentMonthData) {
    return (
      <div className="p-4 text-center" style={{color: 'var(--text-secondary)'}}>
        Carregando dados do dashboard...
      </div>
    );
  }


  return (
    <div className="p-4 space-y-6">
      <MonthNavigator className="mb-3" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SummaryCard
          title="Saldo em Conta"
          value={formatCurrency(summary.accountBalance, currencySymbol)}
          icon={<DollarSignIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />}
          valueColor={'var(--text-primary)'} // Ensure high contrast on dark theme
          borderColor={'var(--text-primary)'} // Use a neutral or primary text color for border if needed
          subValue={`Saldo Inicial: ${formatCurrency(currentMonthData.openingBalance || 0, currencySymbol)}`}
        />
        <SummaryCard
          title="Total Restante no Mês"
          value={formatCurrency(summary.netSavings, currencySymbol)}
          icon={<DollarSignIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />}
          valueColor={summary.netSavings >= 0 ? 'var(--emerald-lime)' : 'var(--coral-red)'}
          borderColor={summary.netSavings >= 0 ? 'var(--emerald-lime)' : 'var(--coral-red)'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <SummaryCard
          onClick={openProventosModal}
          title="Total de Proventos"
          value={formatCurrency(summary.totalIncome, currencySymbol)}
          icon={<TrendingUpIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
          valueColor={'var(--emerald-lime)'}
          borderColor={'var(--emerald-lime)'}
        />
        <SummaryCard
          onClick={openDebitosModal}
          title="Total de Débitos"
          value={formatCurrency(summary.totalExpenses, currencySymbol)}
          icon={<BarChart2Icon className="w-5 h-5 transform scale-y-[-1] group-hover:scale-[-1.1,1.1] transition-transform" />}
          valueColor={'var(--coral-red)'}
          borderColor={'var(--coral-red)'}
        />
         <SummaryCard
          title="Gráfico Mensal"
          onClick={() => setIsMonthlyChartVisible(!isMonthlyChartVisible)}
          value=""
          isActionCard={true}
          valueColor={'var(--electric-blue)'}
          borderColor={'var(--electric-blue)'}
          icon={<PieChartIcon className="w-8 h-8" />}
        />
      </div>

      {isMonthlyChartVisible && (
        <div className="mt-5 space-y-6">
          <MonthlySummaryChart
            summary={{ totalIncome: summary.totalIncome, totalExpenses: summary.totalExpenses }}
            currencySymbol={currencySymbol}
          />
          <ExpensePieChart
            expenseTransactions={allExpenseTransactions}
            currencySymbol={currencySymbol}
          />
        </div>
      )}

      {currentMonthData.creditCardLimit !== undefined && currentMonthData.creditCardLimit !== null && currentMonthData.creditCardLimit > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <SummaryCard
            title="Limite do Cartão"
            value={formatCurrency(currentMonthData.creditCardLimit, currencySymbol)}
            valueColor={'var(--soft-magenta)'}
            borderColor={'var(--soft-magenta)'}
          />
          <SummaryCard
            title="Limite Restante Cartão"
            value={formatCurrency(summary.creditCardRemainingLimit !== undefined && summary.creditCardRemainingLimit !== null ? summary.creditCardRemainingLimit : 0, currencySymbol)}
            subValue={`Gasto: ${formatCurrency(summary.creditCardSpent, currencySymbol)}`}
            valueColor={summary.creditCardRemainingLimit !== undefined && summary.creditCardRemainingLimit !== null && summary.creditCardRemainingLimit >=0 ? 'var(--text-primary)' : 'var(--coral-red)'}
            borderColor={summary.creditCardRemainingLimit !== undefined && summary.creditCardRemainingLimit !== null && summary.creditCardRemainingLimit >=0 ? 'var(--amethyst-purple)' : 'var(--coral-red)'}
          />
        </div>
      )}

      <FloatingActionButton
        onClick={handleOpenAddTransactionModal}
        ariaLabel="Adicionar nova transação"
      />

      {/* <AiChatFab onClick={() => setIsAiChatModalOpen(true)} /> */} {/* Removed FAB */}

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => {setIsAddTransactionModalOpen(false); setEditingTransaction(null);}}
        periodType={modalPeriodType}
        transactionToEdit={editingTransaction}
      />

      <TransactionListModal
        isOpen={isProventosModalOpen}
        onClose={closeProventosModal}
        title={`Proventos de ${getMonthName(activeMonthYear)}`}
        transactions={incomeTransactions}
        currencySymbol={currencySymbol}
        transactionTypeForColor={TransactionType.INCOME}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteTransactionInModal}
      />

      <TransactionListModal
        isOpen={isDebitosModalOpen}
        onClose={closeDebitosModal}
        title={`Débitos de ${getMonthName(activeMonthYear)}`}
        transactions={allExpenseTransactions}
        currencySymbol={currencySymbol}
        transactionTypeForColor={TransactionType.EXPENSE}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteTransactionInModal}
      />

      <AiChatModal
        isOpen={isAiChatModalOpen}
        onClose={() => setIsAiChatModalOpen(false)}
        financialContext={{
          currentMonthData: currentMonthData ? {
            openingBalance: currentMonthData.openingBalance,
            creditCardLimit: currentMonthData.creditCardLimit,
          } : undefined,
          allTransactions: getAllTransactionsForMonth(activeMonthYear),
          monthlySummary: summary,
          userSettings: settings ? {
              currencySymbol: settings.currencySymbol,
              userName: settings.userNameDisplay || currentUsername || undefined,
          } : { currencySymbol: "R$", userName: currentUsername || undefined }
        }}
      />
    </div>
  );
};

export default DashboardScreen;