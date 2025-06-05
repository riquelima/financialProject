import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { COLORS, PIE_CHART_COLORS, PieChartIcon } from '../constants';

interface ExpensePieChartProps {
  expenseTransactions: Transaction[];
  currencySymbol: string;
}

interface PieSliceData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
  pathD: string;
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenseTransactions, currencySymbol }) => {
  const chartData = useMemo(() => {
    if (!expenseTransactions || expenseTransactions.length === 0) {
      return [];
    }

    const categoryMap = new Map<string, number>();
    expenseTransactions.forEach(transaction => {
      if (transaction.type === TransactionType.EXPENSE) {
        const currentTotal = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, currentTotal + transaction.amount);
      }
    });

    const totalExpenses = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
    if (totalExpenses === 0) return [];

    let currentAngle = -90; 
    const slices: PieSliceData[] = [];
    
    let colorIndex = 0;
    Array.from(categoryMap.entries())
      .sort(([, a], [, b]) => b - a) 
      .forEach(([category, amount]) => {
        const percentage = (amount / totalExpenses) * 100;
        const angle = (amount / totalExpenses) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        const color = PIE_CHART_COLORS[colorIndex % PIE_CHART_COLORS.length];
        colorIndex++;

        const radius = 100;
        const cx = 120; 
        const cy = 120; 

        const startX = cx + radius * Math.cos(startAngle * Math.PI / 180);
        const startY = cy + radius * Math.sin(startAngle * Math.PI / 180);
        const endX = cx + radius * Math.cos(endAngle * Math.PI / 180);
        const endY = cy + radius * Math.sin(endAngle * Math.PI / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathD = `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;
        
        slices.push({
          category,
          amount,
          percentage,
          color,
          startAngle,
          endAngle,
          pathD,
        });
        currentAngle = endAngle;
      });
    return slices;
  }, [expenseTransactions]);

  const cardBgStyle = { backgroundColor: 'var(--secondary-bg)' };
  const textPrimaryStyle = { color: 'var(--text-primary)' };
  const textSecondaryStyle = { color: 'var(--text-secondary)' };
  const legendItemBgStyle = { backgroundColor: 'var(--tertiary-bg)' };


  if (chartData.length === 0) {
    return (
      <div style={cardBgStyle} className="p-6 rounded-xl shadow-lg text-center">
        <PieChartIcon className="w-12 h-12 mx-auto mb-3" style={textSecondaryStyle} />
        <h3 className="text-lg font-semibold mb-1" style={textPrimaryStyle}>Distribuição de Débitos</h3>
        <p style={textSecondaryStyle}>Nenhum débito registrado para este mês.</p>
      </div>
    );
  }

  return (
    <div style={cardBgStyle} className="p-4 sm:p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-center" style={textPrimaryStyle}>Distribuição de Débitos por Categoria</h3>
      <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6 space-y-4 md:space-y-0">
        <div className="relative w-full max-w-xs sm:max-w-sm md:w-2/3 mx-auto">
          <svg viewBox="0 0 240 240" className="w-full h-auto" aria-label="Gráfico de pizza de despesas">
            {chartData.map(slice => (
              <path
                key={slice.category}
                d={slice.pathD}
                fill={slice.color}
                className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
              >
                <title>
                  {`${slice.category}: ${formatCurrency(slice.amount, currencySymbol)} (${slice.percentage.toFixed(1)}%)`}
                </title>
              </path>
            ))}
          </svg>
        </div>
        <div className="w-full md:w-1/3 space-y-1 text-xs max-h-60 overflow-y-auto pr-2">
          {chartData.map(slice => (
            <div key={slice.category} style={legendItemBgStyle} className="flex items-center justify-between p-1.5 rounded">
              <div className="flex items-center">
                <span style={{ backgroundColor: slice.color }} className="w-3 h-3 rounded-full mr-2 inline-block"></span>
                <span style={textSecondaryStyle}>{slice.category}</span>
              </div>
              <span className="font-medium" style={textPrimaryStyle}>
                {formatCurrency(slice.amount, currencySymbol)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensePieChart;