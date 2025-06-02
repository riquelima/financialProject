import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getMonthName, addMonths } from '../utils/formatters';
import { ChevronLeftIcon, ChevronRightIcon, COLORS } from '../constants';

interface MonthNavigatorProps {
  className?: string;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ className = ''}) => {
  const { activeMonthYear, setActiveMonthYear } = useAppContext();

  const handlePreviousMonth = () => {
    setActiveMonthYear(addMonths(activeMonthYear, -1));
  };

  const handleNextMonth = () => {
    setActiveMonthYear(addMonths(activeMonthYear, 1));
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-${COLORS.cardBackgroundLighter} rounded-lg shadow ${className}`}>
      <button 
        onClick={handlePreviousMonth} 
        className={`p-2 rounded-full hover:bg-${COLORS.petroleumBlue}/30 text-${COLORS.textSecondary} hover:text-${COLORS.textPrimary} transition-colors duration-200`}
        aria-label="Mês anterior"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <h2 className={`text-xl font-semibold text-center text-${COLORS.textPrimary} tabular-nums`}>
        {getMonthName(activeMonthYear)}
      </h2>
      <button 
        onClick={handleNextMonth} 
        className={`p-2 rounded-full hover:bg-${COLORS.petroleumBlue}/30 text-${COLORS.textSecondary} hover:text-${COLORS.textPrimary} transition-colors duration-200`}
        aria-label="Próximo mês"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MonthNavigator;
