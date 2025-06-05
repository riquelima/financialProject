import React, { useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { PeriodType, Transaction, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import TransactionItem from '../components/TransactionItem';
import AddTransactionModal from '../components/AddTransactionModal';
import FloatingActionButton from '../components/FloatingActionButton';
import MonthNavigator from '../components/MonthNavigator';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { PlusIcon, COLORS } from '../constants';

interface FinancialPeriodScreenProps {
  periodType: PeriodType;
}

const FinancialPeriodScreen: React.FC<FinancialPeriodScreenProps> = ({ periodType }) => {
  const { activeMonthYear, settings, getTransactionsForPeriod, deleteTransaction } = useAppContext(); // Removed getCurrentMonthData as it's not directly used here for rendering
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE); // Default to expenses

  const currencySymbol = settings?.currencySymbol || 'R$';
  
  const transactions = useMemo(() => {
    return getTransactionsForPeriod(activeMonthYear, periodType, activeTab);
  }, [activeMonthYear, periodType, activeTab, getTransactionsForPeriod]);

  const periodTitle = periodType === PeriodType.MID_MONTH ? "Meio do Mês" : "Fim do Mês";
  const fullTitle = `${periodTitle} - ${getMonthName(activeMonthYear)}`;

  const handleAddTransaction = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      // The deleteTransaction in context now only needs the transactionId
      deleteTransaction(transactionId);
    }
  };
  
  const periodIncome = getTransactionsForPeriod(activeMonthYear, periodType, TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const periodExpenses = getTransactionsForPeriod(activeMonthYear, periodType, TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
  const periodBalance = periodIncome - periodExpenses;

  return (
    <div className="p-4 space-y-6">
      <MonthNavigator />
      <header className={`p-4 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} rounded-lg shadow-md`}>
        <h1 className="text-2xl font-bold text-white text-center">🗓️ {fullTitle}</h1>
      </header>

      <div className={`p-4 bg-${COLORS.cardBackground} rounded-lg shadow-md`}>
        <div className="flex justify-around mb-4 border-b border-slate-700">
            <button 
                onClick={() => setActiveTab(TransactionType.INCOME)}
                className={`py-3 px-4 font-medium transition-colors w-1/2 ${activeTab === TransactionType.INCOME ? `text-${COLORS.income} border-b-2 border-${COLORS.income}` : `text-${COLORS.textSecondary} hover:text-${COLORS.textPrimary}`}`}
            >A Receber</button>
            <button 
                onClick={() => setActiveTab(TransactionType.EXPENSE)}
                className={`py-3 px-4 font-medium transition-colors w-1/2 ${activeTab === TransactionType.EXPENSE ? `text-${COLORS.expense} border-b-2 border-${COLORS.expense}` : `text-${COLORS.textSecondary} hover:text-${COLORS.textPrimary}`}`}
            >A Pagar</button>
        </div>
        
        {transactions.length === 0 ? (
          <p className={`text-center text-${COLORS.textSecondary} py-8`}>
            Nenhuma transação de {activeTab === TransactionType.INCOME ? 'entrada' : 'saída'} registrada para este período.
          </p>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
            {transactions.map(transaction => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction}
                onEdit={() => handleEditTransaction(transaction)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className={`grid grid-cols-3 gap-2 text-center p-3 bg-${COLORS.cardBackgroundLighter} rounded-lg shadow`}>
        <div>
          <p className={`text-xs text-${COLORS.textSecondary}`}>Entradas Período</p>
          <p className={`font-semibold text-lg text-${COLORS.income}`}>{formatCurrency(periodIncome, currencySymbol)}</p>
        </div>
        <div>
          <p className={`text-xs text-${COLORS.textSecondary}`}>Saídas Período</p>
          <p className={`font-semibold text-lg text-${COLORS.expense}`}>{formatCurrency(periodExpenses, currencySymbol)}</p>
        </div>
        <div>
          <p className={`text-xs text-${COLORS.textSecondary}`}>Saldo Período</p>
          <p className={`font-semibold text-lg ${periodBalance >= 0 ? `text-${COLORS.income}` : `text-${COLORS.expense}`}`}>{formatCurrency(periodBalance, currencySymbol)}</p>
        </div>
      </div>

      <FloatingActionButton 
        onClick={handleAddTransaction} 
        ariaLabel={`Adicionar ${activeTab === TransactionType.INCOME ? 'Entrada' : 'Saída'}`}
        icon={<PlusIcon className="w-7 h-7"/>}
      />

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setTransactionToEdit(null); }}
        periodType={periodType}
        transactionToEdit={transactionToEdit}
      />
    </div>
  );
};

export default FinancialPeriodScreen;