



import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext'; 
import { formatCurrency, getMonthName } from '../utils/formatters';
import SummaryCard from '../components/SummaryCard';
import MonthNavigator from '../components/MonthNavigator';
import FloatingActionButton from '../components/FloatingActionButton';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionListModal from '../components/TransactionListModal'; 
import ExpensePieChart from '../components/ExpensePieChart';
import MonthlySummaryChart from '../components/MonthlySummaryChart'; 
import AiChatFab from '../components/AiChatFab'; 
import AiChatModal from '../components/AiChatModal'; 
import { PeriodType, Transaction, TransactionType } from '../types'; 
import { DollarSignIcon, TrendingUpIcon, BarChart2Icon, PieChartIcon, COLORS } from '../constants'; 

const DashboardScreen: React.FC = () => {
  const { activeMonthYear, settings, getMonthlySummary, getCurrentMonthData, getAllTransactionsForMonth, currentUsername } = useAppContext();
  
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
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

  if (!settings || !currentMonthData) {
    return (
      <div className="p-4 text-center" style={{color: 'var(--text-secondary)'}}>
        Carregando dados do dashboard...
      </div>
    );
  }


  return (
    <div className="p-4 space-y-5"> {/* Adjusted spacing */}
      <MonthNavigator className="mb-3" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SummaryCard 
          title="Saldo em Conta" 
          value={formatCurrency(summary.accountBalance, currencySymbol)} 
          icon={<DollarSignIcon className="w-5 h-5" />} // Slightly smaller icon
          useSolidBackground={true}
          solidBgColor="var(--ref-blue-vibrant)"
          solidTextColor="var(--ref-white)"
          subValue={`Saldo Inicial: ${formatCurrency(currentMonthData.openingBalance || 0, currencySymbol)}`}
        />
        <SummaryCard 
          title="Total Restante no Mês" 
          value={formatCurrency(summary.netSavings, currencySymbol)} 
          icon={<DollarSignIcon className="w-5 h-5" />}
          valueColor={summary.netSavings >= 0 ? 'var(--ref-blue-vibrant)' : 'var(--coral-red)'}
          // borderColor prop no longer creates a side border, style is via card background/border
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <SummaryCard 
          onClick={openProventosModal}
          title="Total de Proventos" 
          value={formatCurrency(summary.totalIncome, currencySymbol)} 
          icon={<TrendingUpIcon className="w-5 h-5" />}
          valueColor={'var(--ref-blue-vibrant)'} // Use vibrant blue for positive values
        />
        <SummaryCard 
          onClick={openDebitosModal}
          title="Total de Débitos" 
          value={formatCurrency(summary.totalExpenses, currencySymbol)} 
          icon={<BarChart2Icon className="w-5 h-5 transform scale-y-[-1]" />}
          valueColor={'var(--coral-red)'}
        />
         <SummaryCard 
          title="Gráfico Mensal"
          onClick={() => setIsMonthlyChartVisible(!isMonthlyChartVisible)}
          value="" 
          isActionCard={true} 
          solidBgColor="var(--ref-blue-vibrant)" // Blue background for action card
          solidTextColor="var(--ref-white)"
          icon={<PieChartIcon className="w-7 h-7" />} 
        />
      </div>
      
      {isMonthlyChartVisible && (
        <div className="mt-5 space-y-5"> 
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
            valueColor={'var(--ref-yellow-soft)'} // Use yellow for this info
          />
          <SummaryCard 
            title="Limite Restante Cartão" 
            value={formatCurrency(summary.creditCardRemainingLimit !== undefined && summary.creditCardRemainingLimit !== null ? summary.creditCardRemainingLimit : 0, currencySymbol)}
            subValue={`Gasto: ${formatCurrency(summary.creditCardSpent, currencySymbol)}`}
            valueColor={summary.creditCardRemainingLimit !== undefined && summary.creditCardRemainingLimit !== null && summary.creditCardRemainingLimit >=0 ? 'var(--text-primary)' : 'var(--coral-red)'}
          />
        </div>
      )}
      
      <FloatingActionButton 
        onClick={() => handleOpenAddTransactionModal(PeriodType.MID_MONTH)}
        ariaLabel="Adicionar nova transação" 
      />

      <AiChatFab onClick={() => setIsAiChatModalOpen(true)} /> 
      
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
        currencySymbol={currencySymbol}
        transactionTypeForColor={TransactionType.INCOME}
      />

      <TransactionListModal
        isOpen={isDebitosModalOpen}
        onClose={closeDebitosModal}
        title={`Débitos de ${getMonthName(activeMonthYear)}`}
        transactions={allExpenseTransactions}
        currencySymbol={currencySymbol}
        transactionTypeForColor={TransactionType.EXPENSE}
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