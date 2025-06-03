import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { formatCurrency, getMonthName } from '../utils/formatters'; // Added getMonthName
import SummaryCard from '../components/SummaryCard';
import MonthNavigator from '../components/MonthNavigator';
import FloatingActionButton from '../components/FloatingActionButton';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionListModal from '../components/TransactionListModal'; 
import ExpensePieChart from '../components/ExpensePieChart'; // Import the new pie chart component
import { PeriodType, Transaction, TransactionType } from '../types'; 
import { DollarSignIcon, TrendingUpIcon, HomeIcon, BarChart2Icon, COLORS, PieChartIcon } from '../constants';

const DashboardScreen: React.FC = () => {
  const { activeMonthYear, settings, getMonthlySummary, getCurrentMonthData, getAllTransactionsForMonth } = useAppContext();
  
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [modalPeriodType, setModalPeriodType] = useState<PeriodType>(PeriodType.MID_MONTH);

  const [isProventosModalOpen, setIsProventosModalOpen] = useState(false);
  const [isDebitosModalOpen, setIsDebitosModalOpen] = useState(false);

  const summary = getMonthlySummary(activeMonthYear);
  const currentMonthData = getCurrentMonthData();

  const incomeTransactions = useMemo(() => {
    if (!isProventosModalOpen) return [];
    return getAllTransactionsForMonth(activeMonthYear, TransactionType.INCOME);
  }, [activeMonthYear, getAllTransactionsForMonth, isProventosModalOpen]);

  // Memoize all expense transactions for the pie chart and the debitos modal
  const allExpenseTransactions = useMemo(() => {
    return getAllTransactionsForMonth(activeMonthYear, TransactionType.EXPENSE);
  }, [activeMonthYear, getAllTransactionsForMonth]);

  const handleOpenAddTransactionModal = (period: PeriodType) => {
    setModalPeriodType(period);
    setIsAddTransactionModalOpen(true);
  };

  const openProventosModal = () => setIsProventosModalOpen(true);
  const closeProventosModal = () => setIsProventosModalOpen(false);

  const openDebitosModal = () => setIsDebitosModalOpen(true);
  const closeDebitosModal = () => setIsDebitosModalOpen(false);

  return (
    <div className="p-4 space-y-6">
      <MonthNavigator className="mb-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard 
          title="Saldo em Conta" 
          value={formatCurrency(summary.accountBalance, settings.currencySymbol)} 
          icon={<HomeIcon className="w-6 h-6" />}
          gradient
          colorClass={`text-white`}
          subValue={`Saldo Inicial: ${formatCurrency(currentMonthData.openingBalance, settings.currencySymbol)}`}
        />
        <SummaryCard 
          title="Total Restante no Mês" 
          value={formatCurrency(summary.netSavings, settings.currencySymbol)} 
          icon={<DollarSignIcon className="w-6 h-6" />}
          colorClass={summary.netSavings >= 0 ? `text-${COLORS.income}` : `text-${COLORS.expense}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div onClick={openProventosModal} className="cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openProventosModal()}>
          <SummaryCard 
            title="Total de Proventos" 
            value={formatCurrency(summary.totalIncome, settings.currencySymbol)} 
            icon={<TrendingUpIcon className="w-5 h-5" />}
            colorClass={`text-${COLORS.income}`}
          />
        </div>
        <div onClick={openDebitosModal} className="cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openDebitosModal()}>
          <SummaryCard 
            title="Total de Débitos" 
            value={formatCurrency(summary.totalExpenses, settings.currencySymbol)} 
            icon={<BarChart2Icon className="w-5 h-5 transform scale-y-[-1]" />}
            colorClass={`text-${COLORS.expense}`}
          />
        </div>
         <SummaryCard 
          title="Total de Benefícios" 
          value={formatCurrency(summary.totalBenefits, settings.currencySymbol)}
          colorClass={`text-${COLORS.discreetNeonGreen}`}
        />
      </div>
      
      {currentMonthData.creditCardLimit !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard 
            title="Limite do Cartão" 
            value={formatCurrency(currentMonthData.creditCardLimit, settings.currencySymbol)} 
          />
          <SummaryCard 
            title="Limite Residual do Cartão" 
            value={formatCurrency(summary.creditCardRemainingLimit !== undefined ? summary.creditCardRemainingLimit : 0, settings.currencySymbol)}
            subValue={`Gasto: ${formatCurrency(summary.creditCardSpent, settings.currencySymbol)}`}
            colorClass={summary.creditCardRemainingLimit !== undefined && summary.creditCardRemainingLimit >=0 ? `text-${COLORS.textPrimary}` : `text-${COLORS.expense}`}
          />
        </div>
      )}
      
      {/* Replace Acesso Rápido with ExpensePieChart */}
      <ExpensePieChart 
        expenseTransactions={allExpenseTransactions}
        currencySymbol={settings.currencySymbol}
      />

      <FloatingActionButton 
        onClick={() => handleOpenAddTransactionModal(PeriodType.MID_MONTH)}
        ariaLabel="Adicionar nova transação" 
      />
      
      <AddTransactionModal 
        isOpen={isAddTransactionModalOpen} 
        onClose={() => setIsAddTransactionModalOpen(false)}
        periodType={modalPeriodType}
      />

      <TransactionListModal
        isOpen={isProventosModalOpen}
        onClose={closeProventosModal}
        title={`Proventos de ${getMonthName(activeMonthYear)}`}
        transactions={incomeTransactions}
        currencySymbol={settings.currencySymbol}
        transactionTypeForColor={TransactionType.INCOME}
      />

      <TransactionListModal
        isOpen={isDebitosModalOpen}
        onClose={closeDebitosModal}
        title={`Débitos de ${getMonthName(activeMonthYear)}`}
        transactions={allExpenseTransactions} // Use allExpenseTransactions for Debitos modal
        currencySymbol={settings.currencySymbol}
        transactionTypeForColor={TransactionType.EXPENSE}
      />
    </div>
  );
};

export default DashboardScreen;