import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { getMonthName, formatCurrency } from '../utils/formatters';
import { BarChart2Icon, TrendingUpIcon, COLORS } from '../constants'; // Removed DownloadCloudIcon

const HistoryScreen: React.FC = () => {
  const { data, settings, getMonthlySummary, setActiveMonthYear } = useAppContext();

  const sortedMonthYears = Object.keys(data)
    .sort((a, b) => {
      const [yearAStr, monthAStr] = a.split('-');
      const dateA = new Date(parseInt(yearAStr, 10), parseInt(monthAStr, 10) - 1);
      const [yearBStr, monthBStr] = b.split('-');
      const dateB = new Date(parseInt(yearBStr, 10), parseInt(monthBStr, 10) - 1);
      return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
    });

  if (sortedMonthYears.length === 0) {
    return (
      <div className="p-6 text-center">
        <BarChart2Icon className={`w-16 h-16 mx-auto text-${COLORS.textSecondary} mb-4`} />
        <h2 className={`text-2xl font-semibold text-${COLORS.textPrimary} mb-2`}>Histórico Vazio</h2>
        <p className={`text-${COLORS.textSecondary}`}>Nenhum dado mensal encontrado. Comece a adicionar transações!</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <div className={`flex justify-between items-center p-4 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} rounded-lg shadow-md mb-6`}>
        <h1 className="text-2xl font-bold text-white">Histórico Mensal</h1>
        {/* Export button removed */}
      </div>

      <div className="space-y-4">
        {sortedMonthYears.map(monthYear => {
          const summary = getMonthlySummary(monthYear);
          const monthData = data[monthYear];
          
          return (
            <div key={monthYear} className={`p-5 bg-${COLORS.cardBackground} rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              <h2 className={`text-xl font-semibold text-${COLORS.textAccent} mb-3`}>{getMonthName(monthYear)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-slate-700 rounded-md">
                  <p className={`text-xs text-${COLORS.textSecondary}`}>Saldo Inicial</p>
                  <p className={`font-medium text-${COLORS.textPrimary}`}>{formatCurrency(monthData.openingBalance, settings.currencySymbol)}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-md">
                  <p className={`text-xs text-${COLORS.textSecondary}`}>Proventos</p>
                  <p className={`font-medium text-${COLORS.income}`}>{formatCurrency(summary.totalIncome, settings.currencySymbol)}</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-md">
                  <p className={`text-xs text-${COLORS.textSecondary}`}>Débitos</p>
                  <p className={`font-medium text-${COLORS.expense}`}>{formatCurrency(summary.totalExpenses, settings.currencySymbol)}</p>
                </div>
                <div className={`p-3 rounded-md ${summary.netSavings >= 0 ? 'bg-emerald-800/50' : 'bg-red-800/50'}`}>
                  <p className={`text-xs ${summary.netSavings >= 0 ? `text-emerald-300` : `text-red-300`}`}>Saldo do Mês</p>
                  <p className={`font-semibold text-lg ${summary.netSavings >= 0 ? `text-${COLORS.income}` : `text-${COLORS.expense}`}`}>{formatCurrency(summary.netSavings, settings.currencySymbol)}</p>
                </div>
                 <div className="p-3 bg-slate-700 rounded-md sm:col-span-2 md:col-span-4">
                  <p className={`text-xs text-${COLORS.textSecondary}`}>Saldo Final em Conta</p>
                  <p className={`font-semibold text-xl text-${COLORS.textPrimary}`}>{formatCurrency(summary.accountBalance, settings.currencySymbol)}</p>
                </div>
              </div>
               <button
                onClick={() => setActiveMonthYear(monthYear)}
                className={`mt-4 w-full text-sm bg-${COLORS.petroleumBlue}/80 hover:bg-${COLORS.petroleumBlue} text-white font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition-all duration-200`}
              >
                Ver Detalhes de {getMonthName(monthYear)} no Dashboard
              </button>
            </div>
          );
        })}
      </div>
      <p className={`text-center text-xs text-${COLORS.textSecondary} mt-8`}>
        Comparativo de evolução e exportação PDF/CSV serão implementados futuramente.
      </p>
    </div>
  );
};

export default HistoryScreen;