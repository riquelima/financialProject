


import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { COLORS, BarChart2Icon } from '../constants'; 

interface MonthlySummaryChartProps {
  summary: {
    totalIncome: number;
    totalExpenses: number;
  };
  currencySymbol: string;
}

const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({ summary, currencySymbol }) => {
  const { totalIncome, totalExpenses } = summary;
  const maxVal = Math.max(totalIncome, totalExpenses, 1); 

  const incomeHeightPercentage = (totalIncome / maxVal) * 100;
  const expenseHeightPercentage = (totalExpenses / maxVal) * 100;

  const barBaseClass = "w-3/5 sm:w-2/5 rounded-t-lg transition-all duration-500 ease-out flex flex-col justify-end items-center p-2 relative";
  const labelTextClass = "text-xs font-medium text-center mt-2"; 
  const valueBelowLabelClass = "text-sm font-semibold text-center mt-1"; 

  return (
    <div 
      style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--card-border)' }}
      className="p-4 sm:p-6 rounded-xl shadow-xl"
    >
      <div className="flex items-center mb-6"> 
        <BarChart2Icon className="w-6 h-6 mr-2" style={{ color: 'var(--electric-blue)' }} />
        <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Resumo do Mês: Proventos vs Débitos
        </h3>
      </div>
      
      {totalIncome === 0 && totalExpenses === 0 ? (
        <p className="text-center py-8" style={{color: 'var(--text-secondary)'}}>
          Não há dados de proventos ou débitos para exibir no gráfico este mês.
        </p>
      ) : (
        <div className="flex justify-around items-end h-56 sm:h-64 w-full max-w-md mx-auto pt-4"> 
          <div className="flex flex-col items-center h-full justify-end text-center">
            <div 
              className={barBaseClass}
              style={{ 
                height: `${incomeHeightPercentage > 5 ? incomeHeightPercentage : 5}%`, 
                backgroundColor: 'var(--emerald-lime)',
                boxShadow: `0 0 10px 1px color-mix(in srgb, var(--emerald-lime) 30%, transparent)`
              }}
            >
            </div>
            <span className={labelTextClass} style={{ color: 'var(--emerald-lime)' }}>Proventos</span>
            <span className={valueBelowLabelClass} style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalIncome, currencySymbol)}
            </span>
          </div>

          <div className="flex flex-col items-center h-full justify-end text-center">
            <div 
              className={barBaseClass}
              style={{ 
                height: `${expenseHeightPercentage > 5 ? expenseHeightPercentage : 5}%`, 
                backgroundColor: 'var(--coral-red)',
                boxShadow: `0 0 10px 1px color-mix(in srgb, var(--coral-red) 30%, transparent)`
              }}
            >
            </div>
            <span className={labelTextClass} style={{ color: 'var(--coral-red)' }}>Débitos</span>
            <span className={valueBelowLabelClass} style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalExpenses, currencySymbol)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySummaryChart;
