import { useAppContext } from '../hooks/useAppContext';
import { MONTH_NAMES } from '../constants';

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function MonthNavigator() {
  const { currentMonth, setCurrentMonth } = useAppContext();

  const formatMonthDisplay = (monthYear: string): string => {
    const [year, month] = monthYear.split('-');
    const monthIndex = parseInt(month) - 1;
    return `${MONTH_NAMES_PT[monthIndex]} ${year}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1);
    
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    const newMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthYear);
  };

  if (!currentMonth) return null;

  return (
    <div className="glass-effect p-4 mb-6 fade-in">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold neon-text">
          <i className="fas fa-chart-line mr-2"></i>
          Controle Financeiro
        </h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full glass-effect hover:neon-glow transition-all"
          >
            <i className="fas fa-chevron-left text-neon-cyan"></i>
          </button>
          <span className="font-semibold text-lg min-w-[140px] text-center">
            {formatMonthDisplay(currentMonth)}
          </span>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full glass-effect hover:neon-glow transition-all"
          >
            <i className="fas fa-chevron-right text-neon-cyan"></i>
          </button>
        </div>
        <button className="p-2 rounded-full glass-effect hover:neon-glow transition-all">
          <i className="fas fa-moon text-neon-cyan"></i>
        </button>
      </div>
    </div>
  );
}
