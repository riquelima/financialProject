import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getMonthName, formatCurrency } from '../utils/formatters';
import MonthNavigator from '../components/MonthNavigator';
import SummaryCard from '../components/SummaryCard';
import { TargetIcon, TrendingUpIcon, TrendingDownIcon, COLORS, AlertTriangleIcon } from '../constants';
import { EXPENSE_CATEGORIES } from '../types';

const MonthlyAnalysisScreen: React.FC = () => {
  const { 
    activeMonthYear, 
    settings, 
    getMonthlySummary, 
    getCurrentMonthData,
    getCategorySpendingDetails 
  } = useAppContext();

  const currencySymbol = settings?.currencySymbol || 'R$';
  const currentMonthData = getCurrentMonthData();
  const monthlySummary = getMonthlySummary(activeMonthYear);
  const categorySpendingDetails = getCategorySpendingDetails(activeMonthYear);

  const overallMonthlyGoal = currentMonthData?.monthlyOverallSpendingGoal || 0;
  const totalMonthlyExpenses = monthlySummary.totalExpenses;
  const overallGoalProgress = overallMonthlyGoal > 0 ? Math.min((totalMonthlyExpenses / overallMonthlyGoal) * 100, 200) : (totalMonthlyExpenses > 0 ? 100 : 0);

  const getProgressBarColor = (percentage: number): string => {
    if (percentage > 100) return COLORS.coralRed; // Over budget
    if (percentage > 80) return COLORS.softMagenta; // Nearing budget (original mockup yellow was a bit hard to see)
    return COLORS.emeraldLime; // Within budget
  };
  const getPercentageTextColor = (percentage: number): string => {
    if (percentage > 100) return `text-${COLORS.expenseTailwind}`;
    if (percentage > 80) return `text-yellow-400`; // Using Tailwind yellow
    return `text-${COLORS.incomeTailwind}`;
  };


  if (!settings || !currentMonthData) {
    return (
      <div className="p-4 text-center" style={{color: 'var(--text-secondary)'}}>
        Carregando dados da análise mensal...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="text-center mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{color: 'var(--text-primary)'}}>Fechamento Mensal</h1>
        <p className="text-sm sm:text-base" style={{color: 'var(--text-secondary)'}}>
          Análise completa do período - {getMonthName(activeMonthYear)}
        </p>
      </header>
      
      <MonthNavigator className="mb-4" />

      {/* Meta Parcial Card */}
      <div 
        className="p-5 rounded-xl shadow-lg glassmorphism-card flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-5"
        style={{ borderColor: overallGoalProgress > 100 ? COLORS.coralRed : (overallGoalProgress > 80 ? COLORS.softMagenta : COLORS.emeraldLime)}}
      >
        <div 
            className={`p-3 rounded-full bg-opacity-20 ${
                overallGoalProgress > 100 ? 'bg-red-500 text-red-400' :
                overallGoalProgress > 80 ? 'bg-yellow-500 text-yellow-400' :
                'bg-emerald-500 text-emerald-400'
            }`}
        >
          {overallGoalProgress > 100 ? <AlertTriangleIcon className="w-7 h-7" /> : <TargetIcon className="w-7 h-7" />}
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h2 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Meta Mensal de Gastos</h2>
          <p className="text-xs" style={{color: 'var(--text-secondary)'}}>
            {overallGoalProgress.toFixed(1)}% da meta mensal
          </p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{formatCurrency(totalMonthlyExpenses, currencySymbol)}</p>
          <p className="text-xs" style={{color: 'var(--text-secondary)'}}>Meta: {formatCurrency(overallMonthlyGoal, currencySymbol)}</p>
        </div>
      </div>

      {/* Total Receitas e Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SummaryCard 
          title="Total Receitas" 
          value={formatCurrency(monthlySummary.totalIncome, currencySymbol)} 
          icon={<TrendingUpIcon className="w-5 h-5"/>}
          valueColor={'var(--emerald-lime)'}
          borderColor={'var(--emerald-lime)'}
        />
        <SummaryCard 
          title="Total Gastos" 
          value={formatCurrency(monthlySummary.totalExpenses, currencySymbol)} 
          icon={<TrendingDownIcon className="w-5 h-5"/>}
          valueColor={'var(--coral-red)'}
          borderColor={'var(--coral-red)'}
        />
      </div>

      {/* Performance por Categoria */}
      <div className="p-5 rounded-xl shadow-lg glassmorphism-card">
        <h2 className="text-xl font-semibold mb-4" style={{color: 'var(--text-accent)'}}>Performance por Categoria</h2>
        {categorySpendingDetails.length > 0 ? (
          <div className="space-y-5">
            {categorySpendingDetails.map(detail => (
              <div key={detail.category}>
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-base font-medium" style={{color: 'var(--text-primary)'}}>{detail.category}</p>
                  <span className={`text-sm font-semibold ${getPercentageTextColor(detail.percentage)}`}>
                    {detail.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[var(--primary-bg)] rounded-full h-3.5 shadow-inner overflow-hidden">
                  <div 
                    className="h-3.5 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${Math.min(detail.percentage, 100)}%`, // Cap bar at 100% width visually even if overspent
                      backgroundColor: getProgressBarColor(detail.percentage) 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1.5" style={{color: 'var(--text-secondary)'}}>
                  <span>{formatCurrency(detail.totalSpent, currencySymbol)}</span>
                  <span>Meta: {formatCurrency(detail.goal, currencySymbol)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4" style={{color: 'var(--text-secondary)'}}>
            Nenhuma meta de categoria definida ou nenhum gasto registrado este mês. Defina metas na tela de Ajustes.
          </p>
        )}
      </div>
    </div>
  );
};

export default MonthlyAnalysisScreen;