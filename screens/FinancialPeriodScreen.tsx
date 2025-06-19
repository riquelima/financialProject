
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext.js';
import { PeriodType, Transaction, TransactionType } from '../types.js';
import AddTransactionModal from '../components/AddTransactionModal.js';
import EditPeriodGoalsModal from '../components/EditPeriodGoalsModal.js'; // Import new modal
import FloatingActionButton from '../components/FloatingActionButton.js';
import MonthNavigator from '../components/MonthNavigator.js';
import { formatCurrency } from '../utils/formatters.js';
import { PlusIcon, COLORS, CalendarIcon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon, TargetIcon } from '../constants.js';

interface FinancialPeriodScreenProps {
  periodType: PeriodType; 
}

const FinancialPeriodScreen: React.FC<FinancialPeriodScreenProps> = ({ periodType: initialPeriodType }) => {
  const { 
    activeMonthYear, 
    settings, 
    getPeriodSummary,
    getCurrentMonthData,
    updateMonthData // Added for updating goals
  } = useAppContext();

  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false); // State for new modal
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [displayedPeriodType, setDisplayedPeriodType] = useState<PeriodType>(initialPeriodType);

  useEffect(() => {
    setDisplayedPeriodType(initialPeriodType);
  }, [initialPeriodType]);

  const currencySymbol = settings?.currencySymbol || 'R$';
  const currentMonthData = getCurrentMonthData();
  
  const periodSummary = useMemo(() => getPeriodSummary(activeMonthYear, displayedPeriodType), [activeMonthYear, displayedPeriodType, getPeriodSummary]);

  const screenTitle = "Controle Quinzenal";
  const screenSubtitle = "Acompanhe suas finanças por período";

  const handleAddTransaction = () => {
    setTransactionToEdit(null); 
    setIsAddTransactionModalOpen(true);
  };

  const handleOpenEditGoalsModal = () => {
    setIsEditGoalsModalOpen(true);
  };

  const handleSavePeriodGoals = (goals: { spendingGoal: number; savingsGoal: number }) => {
    if (!currentMonthData) return;

    if (displayedPeriodType === PeriodType.MID_MONTH) {
      updateMonthData(activeMonthYear, {
        midMonthSpendingGoal: goals.spendingGoal,
        midMonthSavingsGoal: goals.savingsGoal,
      });
    } else {
      updateMonthData(activeMonthYear, {
        endOfMonthSpendingGoal: goals.spendingGoal,
        endOfMonthSavingsGoal: goals.savingsGoal,
      });
    }
    setIsEditGoalsModalOpen(false);
  };
  
  const currentSpendingGoal = displayedPeriodType === PeriodType.MID_MONTH 
    ? currentMonthData?.midMonthSpendingGoal 
    : currentMonthData?.endOfMonthSpendingGoal;
  const currentSavingsGoal = displayedPeriodType === PeriodType.MID_MONTH 
    ? currentMonthData?.midMonthSavingsGoal 
    : currentMonthData?.endOfMonthSavingsGoal;

  const actualSpending = periodSummary.periodExpenses;
  const spendingGoalProgress = (currentSpendingGoal && currentSpendingGoal > 0) 
    ? Math.min((actualSpending / currentSpendingGoal) * 100, 100) 
    : 0;

  const actualSavings = periodSummary.periodSavings;
  const savingsGoalAchieved = currentSavingsGoal !== undefined && actualSavings >= currentSavingsGoal;

  const tabBaseStyle = "flex-1 py-3 px-2 sm:px-4 text-sm sm:text-base font-semibold rounded-t-lg transition-all duration-300 ease-in-out flex items-center justify-center space-x-2 focus:outline-none";
  const activeTabStyle = "text-white shadow-md"; 
  const inactiveTabStyle = "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--tertiary-bg)] hover:bg-opacity-70";

  return (
    <div className="p-4 space-y-5">
      <header className="text-center mb-1">
        <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{screenTitle}</h1>
        <p className="text-sm" style={{color: 'var(--text-secondary)'}}>{screenSubtitle}</p>
      </header>
      
      <MonthNavigator />

      <div className="flex space-x-1 sm:space-x-2 p-1 rounded-lg" style={{backgroundColor: 'var(--primary-bg)'}}>
        <button 
          onClick={() => setDisplayedPeriodType(PeriodType.MID_MONTH)}
          className={`${tabBaseStyle} ${displayedPeriodType === PeriodType.MID_MONTH ? activeTabStyle : inactiveTabStyle}`}
          style={displayedPeriodType === PeriodType.MID_MONTH ? {backgroundColor: COLORS.electricBlue} : {}}
          aria-pressed={displayedPeriodType === PeriodType.MID_MONTH}
        >
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>1ª Quinzena</span>
        </button>
        <button 
          onClick={() => setDisplayedPeriodType(PeriodType.END_OF_MONTH)}
          className={`${tabBaseStyle} ${displayedPeriodType === PeriodType.END_OF_MONTH ? activeTabStyle : inactiveTabStyle}`}
          style={displayedPeriodType === PeriodType.END_OF_MONTH ? {backgroundColor: COLORS.electricBlue} : {}}
          aria-pressed={displayedPeriodType === PeriodType.END_OF_MONTH}
        >
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>2ª Quinzena</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg shadow-md glassmorphism-card flex items-center space-x-3">
          <TrendingUpIcon className="w-8 h-8 p-1.5 rounded-full bg-emerald-500/20 text-emerald-400" />
          <div>
            <p className="text-xs uppercase" style={{color: 'var(--text-secondary)'}}>Receitas</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(periodSummary.periodIncome, currencySymbol)}</p>
          </div>
        </div>
        <div className="p-4 rounded-lg shadow-md glassmorphism-card flex items-center space-x-3">
          <TrendingDownIcon className="w-8 h-8 p-1.5 rounded-full bg-red-500/20 text-red-400" />
          <div>
            <p className="text-xs uppercase" style={{color: 'var(--text-secondary)'}}>Gastos</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(periodSummary.periodExpenses, currencySymbol)}</p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-lg shadow-lg glassmorphism-card text-center bg-[var(--tertiary-bg)]">
         <DollarSignIcon className={`w-8 h-8 mx-auto mb-2 p-1 rounded-full ${periodSummary.periodSavings >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400' }`} />
        <p className="text-sm uppercase" style={{color: 'var(--text-secondary)'}}>Saldo do Período</p>
        <p className={`text-3xl font-bold ${periodSummary.periodSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(periodSummary.periodSavings, currencySymbol)}
        </p>
        <p className={`text-xs mt-1 ${periodSummary.periodSavings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {periodSummary.periodSavings >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
        </p>
      </div>

      {/* Metas do Período - Card is now clickable */}
      <div 
        className="p-5 rounded-lg shadow-md glassmorphism-card cursor-pointer hover:shadow-xl transition-shadow duration-300"
        onClick={handleOpenEditGoalsModal}
        role="button"
        tabIndex={0}
        aria-label="Editar metas do período"
        onKeyDown={(e) => e.key === 'Enter' && handleOpenEditGoalsModal()}
      >
        <div className="flex items-center mb-4">
            <TargetIcon className="w-6 h-6 mr-2" style={{color: 'var(--text-accent)'}}/>
            <h2 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Metas do Período</h2>
        </div>
        
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>Meta de Gastos</p>
            <span className="text-xs font-semibold" style={{color: spendingGoalProgress >= 100 ? COLORS.coralRed : 'var(--text-accent)'}}>
                {spendingGoalProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-[var(--primary-bg)] rounded-full h-3.5 shadow-inner">
            <div 
              className="bg-emerald-500 h-3.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${spendingGoalProgress}%`, backgroundColor: COLORS.emeraldLime }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1.5" style={{color: 'var(--text-secondary)'}}>
            <span>{formatCurrency(actualSpending, currencySymbol)}</span>
            <span>{formatCurrency(currentSpendingGoal || 0, currencySymbol)}</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1" style={{color: 'var(--text-secondary)'}}>Meta de Economia</p>
          <div className="flex justify-between items-baseline p-3 rounded-md" style={{backgroundColor: 'var(--tertiary-bg)'}}>
            <div>
                <span className="text-xs block" style={{color: 'var(--text-secondary)'}}>Atual:</span>
                <span className={`text-lg font-semibold ${actualSavings >= (currentSavingsGoal || 0) && actualSavings > 0 ? 'text-emerald-400' : actualSavings < 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                    {formatCurrency(actualSavings, currencySymbol)}
                </span>
            </div>
            <div className="text-right">
                <span className="text-xs block" style={{color: 'var(--text-secondary)'}}>Meta:</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                    {formatCurrency(currentSavingsGoal || 0, currencySymbol)}
                </span>
            </div>
          </div>
           {currentSavingsGoal !== undefined && currentSavingsGoal > 0 && (
            <p className={`text-xs mt-2 text-center font-medium ${savingsGoalAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
              {savingsGoalAchieved ? 'Meta de economia atingida! 🎉' : actualSavings > 0 ? 'Quase lá!' : 'Continue economizando!'}
            </p>
          )}
        </div>
      </div>

      <FloatingActionButton 
        onClick={handleAddTransaction} 
        ariaLabel="Adicionar nova transação para este período"
        icon={<PlusIcon className="w-7 h-7"/>}
      />

      <AddTransactionModal 
        isOpen={isAddTransactionModalOpen} 
        onClose={() => { setIsAddTransactionModalOpen(false); setTransactionToEdit(null); }}
        periodType={displayedPeriodType}
        transactionToEdit={transactionToEdit}
      />

      <EditPeriodGoalsModal
        isOpen={isEditGoalsModalOpen}
        onClose={() => setIsEditGoalsModalOpen(false)}
        periodType={displayedPeriodType}
        currentSpendingGoal={currentSpendingGoal || 0}
        currentSavingsGoal={currentSavingsGoal || 0}
        onSave={handleSavePeriodGoals}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};

export default FinancialPeriodScreen;
