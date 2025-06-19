import React from 'react';
import { useAppContext } from '../hooks/useAppContext.js';
import { getMonthName, formatCurrency } from '../utils/formatters.js';
import { BarChart2Icon, TrendingUpIcon, COLORS } from '../constants.js'; 

const HistoryScreen: React.FC = () => {
  const { data, settings, getMonthlySummary, setActiveMonthYear } = useAppContext();

  const currencySymbol = settings?.currencySymbol || 'R$';

  const sortedMonthYears = Object.keys(data || {}) 
    .sort((a, b) => {
      const [yearAStr, monthAStr] = a.split('-');
      const dateA = new Date(parseInt(yearAStr, 10), parseInt(monthAStr, 10) - 1);
      const [yearBStr, monthBStr] = b.split('-');
      const dateB = new Date(parseInt(yearBStr, 10), parseInt(monthBStr, 10) - 1);
      return dateB.getTime() - dateA.getTime(); 
    });

  const cardBgStyle = { backgroundColor: 'var(--secondary-bg)' };
  const lighterCardBgStyle = { backgroundColor: 'var(--tertiary-bg)' };
  const textPrimaryStyle = { color: 'var(--text-primary)' };
  const textSecondaryStyle = { color: 'var(--text-secondary)' };
  const textAccentStyle = { color: 'var(--text-accent)' };


  if (!settings || sortedMonthYears.length === 0) {
    return (
      <div className="p-6 text-center">
        <BarChart2Icon className={`w-16 h-16 mx-auto mb-4`} style={textSecondaryStyle} />
        <h2 className={`text-2xl font-semibold mb-2`} style={textPrimaryStyle}>Histórico Vazio</h2>
        <p style={textSecondaryStyle}>
          { !settings ? "Carregando configurações..." : "Nenhum dado mensal encontrado. Comece a adicionar transações!"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <div className={`flex justify-between items-center p-4 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} rounded-lg shadow-md mb-6`}>
        <h1 className="text-2xl font-bold text-white">📜 Histórico Mensal</h1>
      </div>

      <div className="space-y-4">
        {sortedMonthYears.map(monthYear => {
          const summary = getMonthlySummary(monthYear);
          const monthData = data[monthYear]; 
          
          if (!monthData) return null;

          return (
            <div key={monthYear} style={cardBgStyle} className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
              <h2 className={`text-xl font-semibold mb-3`} style={textAccentStyle}>{getMonthName(monthYear)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-md" style={lighterCardBgStyle}>
                  <p className="text-xs" style={textSecondaryStyle}>Saldo Inicial</p>
                  <p className="font-medium" style={textPrimaryStyle}>{formatCurrency(monthData.openingBalance, currencySymbol)}</p>
                </div>
                <div className="p-3 rounded-md" style={lighterCardBgStyle}>
                  <p className="text-xs" style={textSecondaryStyle}>Proventos</p>
                  <p className={`font-medium text-${COLORS.incomeTailwind}`}>{formatCurrency(summary.totalIncome, currencySymbol)}</p>
                </div>
                <div className="p-3 rounded-md" style={lighterCardBgStyle}>
                  <p className="text-xs" style={textSecondaryStyle}>Débitos</p>
                  <p className={`font-medium text-${COLORS.expenseTailwind}`}>{formatCurrency(summary.totalExpenses, currencySymbol)}</p>
                </div>
                <div className={`p-3 rounded-md ${summary.netSavings >= 0 ? 'bg-emerald-800/30' : 'bg-red-800/30'}`} style={summary.netSavings >= 0 ? {backgroundColor: 'color-mix(in srgb, var(--emerald-lime) 30%, transparent)'} : {backgroundColor: 'color-mix(in srgb, var(--coral-red) 30%, transparent)'}}>
                  <p className={`text-xs ${summary.netSavings >= 0 ? `text-emerald-300` : `text-red-300`}`}>Saldo do Mês</p>
                  <p className={`font-semibold text-lg ${summary.netSavings >= 0 ? `text-${COLORS.incomeTailwind}` : `text-${COLORS.expenseTailwind}`}`}>{formatCurrency(summary.netSavings, currencySymbol)}</p>
                </div>
                 <div className="p-3 rounded-md sm:col-span-2 md:col-span-4" style={lighterCardBgStyle}>
                  <p className="text-xs" style={textSecondaryStyle}>Saldo Final em Conta</p>
                  <p className="font-semibold text-xl" style={textPrimaryStyle}>{formatCurrency(summary.accountBalance, currencySymbol)}</p>
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
      <p className="text-center text-xs mt-8" style={textSecondaryStyle}>
        Comparativo de evolução e exportação PDF/CSV serão implementados futuramente.
      </p>
    </div>
  );
};

export default HistoryScreen;