import { useQuery } from '@tanstack/react-query';
import { MonthData } from '../types';
import { useAppContext } from '../hooks/useAppContext';

export default function HistoryScreen() {
  const { setCurrentMonth, settings } = useAppContext();
  
  const { data: months = [] } = useQuery<MonthData[]>({
    queryKey: ['/api/months'],
  });

  const currency = settings?.currencySymbol || 'R$';

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleViewMonth = (monthYear: string) => {
    setCurrentMonth(monthYear);
    // Navigate to dashboard - using window.location for simplicity
    window.location.hash = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20 md:pb-0">
      <div className="glass-effect p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold neon-text">
            <i className="fas fa-history mr-2"></i>
            Histórico Financeiro
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="glass-effect p-6 rounded-xl neon-glow">
          <h2 className="text-xl font-semibold text-neon-cyan mb-6">Meses Anteriores</h2>
          
          {months.length > 0 ? (
            <div className="space-y-4">
              {months.map((month) => (
                <div 
                  key={month.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-dark-tertiary hover:bg-opacity-80 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center">
                      <i className="fas fa-calendar text-white"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {formatMonthYear(month.monthYear)}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Saldo inicial: {currency} {month.openingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewMonth(month.monthYear)}
                    className="px-4 py-2 btn-neon rounded-lg font-medium text-white hover:shadow-lg transition-all"
                  >
                    Ver Detalhes
                    <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-calendar-times text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Nenhum histórico encontrado</h3>
              <p>Comece a adicionar transações para ver o histórico aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
