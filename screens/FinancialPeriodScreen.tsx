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
  const { activeMonthYear, settings, getTransactionsForPeriod, deleteTransaction } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE); 

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
      deleteTransaction(transactionId);
    }
  };
  
  const periodIncome = getTransactionsForPeriod(activeMonthYear, periodType, TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const periodExpenses = getTransactionsForPeriod(activeMonthYear, periodType, TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
  const periodBalance = periodIncome - periodExpenses;

  const cardBgStyle = { backgroundColor: 'var(--secondary-bg)' };
  const lighterCardBgStyle = { backgroundColor: 'var(--tertiary-bg)' };
  const textPrimaryStyle = { color: 'var(--text-primary)' };
  const textSecondaryStyle = { color: 'var(--text-secondary)' };

  return (
    <div className="p-4 space-y-6">
      <MonthNavigator />
      <header className={`p-4 bg-gradient-to-r from-[${COLORS.petroleumBlue}] to-[${COLORS.deepPurple}] rounded-lg shadow-md`}>
        <h1 className="text-2xl font-bold text-white text-center">🗓️ {fullTitle}</h1>
      </header>

      <div style={cardBgStyle} className="rounded-lg shadow-md">
        <div className={`flex justify-around mb-4 border-b`} style={{borderColor: 'var(--card-border-light)'}}>
            <button 
                onClick={() => setActiveTab(TransactionType.INCOME)}
                className={`py-3 px-4 font-medium transition-colors w-1/2 ${activeTab === TransactionType.INCOME ? `text-${COLORS.incomeTailwind} border-b-2 border-${COLORS.incomeTailwind}` : 'hover:text-[var(--text-primary)]'}`}
                style={activeTab !== TransactionType.INCOME ? textSecondaryStyle : {}}
            >A Receber</button>
            <button 
                onClick={() => setActiveTab(TransactionType.EXPENSE)}
                className={`py-3 px-4 font-medium transition-colors w-1/2 ${activeTab === TransactionType.EXPENSE ? `text-${COLORS.expenseTailwind} border-b-2 border-${COLORS.expenseTailwind}` : 'hover:text-[var(--text-primary)]'}`}
                style={activeTab !== TransactionType.EXPENSE ? textSecondaryStyle : {}}
            >A Pagar</button>
        </div>
        
        <div className="p-4"> {/* Added padding here for content within the card */}
          {transactions.length === 0 ? (
            <p className="text-center py-8" style={textSecondaryStyle}>
              Nenhuma transação de {activeTab === TransactionType.INCOME ? 'entrada' : 'saída'} registrada para este período.
            </p>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-1"> {/* Adjusted max-height */}
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
      </div>
      
      <div style={lighterCardBgStyle} className="grid grid-cols-3 gap-2 text-center p-3 rounded-lg shadow">
        <div>
          <p className="text-xs" style={textSecondaryStyle}>Entradas Período</p>
          <p className={`font-semibold text-lg text-${COLORS.incomeTailwind}`}>{formatCurrency(periodIncome, currencySymbol)}</p>
        </div>
        <div>
          <p className="text-xs" style={textSecondaryStyle}>Saídas Período</p>
          <p className={`font-semibold text-lg text-${COLORS.expenseTailwind}`}>{formatCurrency(periodExpenses, currencySymbol)}</p>
        </div>
        <div>
          <p className="text-xs" style={textSecondaryStyle}>Saldo Período</p>
          <p className={`font-semibold text-lg ${periodBalance >= 0 ? `text-${COLORS.incomeTailwind}` : `text-${COLORS.expenseTailwind}`}`}>{formatCurrency(periodBalance, currencySymbol)}</p>
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