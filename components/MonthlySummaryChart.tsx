



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

  const barBaseClass = "w-3/5 sm:w-2/5 rounded-lg transition-all duration-500 ease-out flex flex-col justify-end items-center p-2 relative shadow-md"; // More rounded, softer shadow
  const labelTextClass = "text-xs font-medium text-center mt-2"; // Poppins Medium
  const valueBelowLabelClass = "text-sm font-semibold text-center mt-1"; // Poppins Semibold

  return (
    <div 
      style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', boxShadow: 'var(--ref-box-shadow)' }}
      className="p-4 sm:p-6"
    >
      <div className="flex items-center mb-6"> 
        <BarChart2Icon className="w-6 h-6 mr-2" style={{ color: 'var(--ref-blue-vibrant)' }} /> {/* Use new blue for icon */}
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}> {/* Poppins Semibold */}
          Resumo do Mês: Proventos vs Débitos
        </h3>
      </div>
      
      {totalIncome === 0 && totalExpenses === 0 ? (
        <p className="text-center py-8 font-normal" style={{color: 'var(--text-secondary)'}}> {/* Poppins Normal */}
          Não há dados de proventos ou débitos para exibir no gráfico este mês.
        </p>
      ) : (
        <div className="flex justify-around items-end h-56 sm:h-64 w-full max-w-md mx-auto pt-4"> 
          <div className="flex flex-col items-center h-full justify-end text-center">
            <div 
              className={barBaseClass}
              style={{ 
                height: `${incomeHeightPercentage > 5 ? incomeHeightPercentage : 5}%`, 
                backgroundColor: 'var(--ref-blue-vibrant)', // Blue for income
                // boxShadow: `0 0 8px 1px color-mix(in srgb, var(--ref-blue-vibrant) 30%, transparent)` // Softer shadow
              }}
            >
            </div>
            <span className={labelTextClass} style={{ color: 'var(--ref-blue-vibrant)' }}>Proventos</span>
            <span className={valueBelowLabelClass} style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(totalIncome, currencySymbol)}
            </span>
          </div>

          <div className="flex flex-col items-center h-full justify-end text-center">
            <div 
              className={barBaseClass}
              style={{ 
                height: `${expenseHeightPercentage > 5 ? expenseHeightPercentage : 5}%`, 
                backgroundColor: 'var(--coral-red)', // Coral red for expenses for good contrast
                // boxShadow: `0 0 8px 1px color-mix(in srgb, var(--coral-red) 30%, transparent)` // Softer shadow
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