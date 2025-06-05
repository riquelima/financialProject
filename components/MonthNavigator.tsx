import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getMonthName, addMonths } from '../utils/formatters';
import { ChevronLeftIcon, ChevronRightIcon } from '../constants';

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
    <div 
      style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--card-border)' }}
      className={`flex items-center justify-between p-3 rounded-[14px] shadow-lg ${className}`}
    >
      <button 
        onClick={handlePreviousMonth} 
        className="p-2 rounded-full hover:bg-[var(--amethyst-purple)] text-[var(--text-secondary)] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-110"
        aria-label="Mês anterior"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <h2 className="text-xl font-semibold text-center tabular-nums" style={{ color: 'var(--text-primary)'}}>
        {getMonthName(activeMonthYear)}
      </h2>
      <button 
        onClick={handleNextMonth} 
        className="p-2 rounded-full hover:bg-[var(--emerald-lime)] text-[var(--text-secondary)] hover:text-[var(--primary-bg)] transition-all duration-300 ease-in-out transform hover:scale-110"
        aria-label="Próximo mês"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MonthNavigator;
