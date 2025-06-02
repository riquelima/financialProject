import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { CogIcon, COLORS } from '../constants';
import { getMonthName } from '../utils/formatters';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, activeMonthYear, updateMonthData, getCurrentMonthData, logout } = useAppContext(); // Added logout
  
  const [userName, setUserName] = useState(settings.userName || '');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  
  const currentMonthData = getCurrentMonthData();
  const [openingBalance, setOpeningBalance] = useState(String(currentMonthData.openingBalance || 0));
  const [creditCardLimit, setCreditCardLimit] = useState(String(currentMonthData.creditCardLimit || ''));

  useEffect(() => {
    setUserName(settings.userName || '');
    setCurrencySymbol(settings.currencySymbol);
  }, [settings]);

  useEffect(() => {
    const monthData = getCurrentMonthData(); 
    setOpeningBalance(String(monthData.openingBalance || 0));
    setCreditCardLimit(String(monthData.creditCardLimit || ''));
  }, [activeMonthYear, getCurrentMonthData]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ userName: userName || undefined, currencySymbol });
    
    const numOpeningBalance = parseFloat(openingBalance) || 0;
    const numCreditCardLimit = creditCardLimit ? parseFloat(creditCardLimit) : undefined;

    updateMonthData(activeMonthYear, { 
      openingBalance: numOpeningBalance, 
      creditCardLimit: numCreditCardLimit 
    });
    alert('Configurações salvas! Lembre-se: os dados não persistirão até a integração com Google Sheets ser finalizada.');
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair? Seus dados não salvos nesta sessão serão perdidos.')) {
      logout();
      // Navigation will be handled by App.tsx due to isAuthenticated changing
    }
  };
  
  const inputBaseClasses = `w-full bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`;
  const labelBaseClasses = `block text-sm font-medium text-${COLORS.textSecondary} mb-1`;

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className={`flex items-center space-x-3 p-4 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} rounded-lg shadow-md`}>
        <CogIcon className="w-8 h-8 text-white" />
        <h1 className="text-3xl font-bold text-white">Ajustes</h1>
      </div>

      <form onSubmit={handleSaveSettings} className={`space-y-6 p-6 bg-${COLORS.cardBackground} rounded-xl shadow-lg`}>
        <div>
          <h2 className={`text-xl font-semibold text-${COLORS.textAccent} mb-4 border-b border-slate-700 pb-2`}>Configurações Gerais</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className={labelBaseClasses}>Nome do Usuário (Opcional)</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={inputBaseClasses}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label htmlFor="currencySymbol" className={labelBaseClasses}>Símbolo da Moeda</label>
              <input
                type="text"
                id="currencySymbol"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                required
                className={inputBaseClasses}
                placeholder="Ex: R$"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className={`text-xl font-semibold text-${COLORS.textAccent} mb-4 border-b border-slate-700 pb-2`}>
            Dados para {getMonthName(activeMonthYear)}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="openingBalance" className={labelBaseClasses}>Saldo Inicial do Mês ({settings.currencySymbol})</label>
              <input
                type="number"
                id="openingBalance"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                min="0"
                step="0.01"
                className={inputBaseClasses}
                placeholder="0,00"
              />
            </div>
            <div>
              <label htmlFor="creditCardLimit" className={labelBaseClasses}>Limite Total do Cartão de Crédito ({settings.currencySymbol}) (Opcional)</label>
              <input
                type="number"
                id="creditCardLimit"
                value={creditCardLimit}
                onChange={(e) => setCreditCardLimit(e.target.value)}
                min="0"
                step="0.01"
                className={inputBaseClasses}
                placeholder="Ex: 1000,00"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button 
            type="submit"
            className={`w-full py-3 px-5 bg-gradient-to-r from-${COLORS.petroleumBlue} via-${COLORS.deepPurple} to-${COLORS.discreetNeonGreen} text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-${COLORS.primary}/50 transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-100 shadow-lg hover:shadow-xl`}
          >
            Salvar Alterações (Localmente)
          </button>
        </div>
      </form>

      <div className={`p-6 bg-${COLORS.cardBackground} rounded-xl shadow-lg`}>
          <h3 className={`text-lg font-semibold text-${COLORS.textPrimary} mb-2`}>Tema</h3>
          <p className={`text-sm text-${COLORS.textSecondary}`}>Atualmente, o aplicativo utiliza o tema escuro. A opção de alternar para o tema claro será adicionada em futuras atualizações.</p>
      </div>
      <div className={`p-6 bg-${COLORS.cardBackground} rounded-xl shadow-lg`}>
          <h3 className={`text-lg font-semibold text-${COLORS.textPrimary} mb-2`}>Backup e Sincronização</h3>
          <p className={`text-sm text-${COLORS.textSecondary}`}>A integração com Firebase foi removida. A intenção é utilizar Google Sheets para persistência de dados. <strong className="text-amber-400">No momento, os dados são salvos apenas localmente na sessão atual do navegador e serão perdidos ao fechar ou recarregar a página completamente.</strong> A implementação da sincronização com Google Sheets está pendente.</p>
      </div>

      <div className={`p-6 bg-${COLORS.cardBackground} rounded-xl shadow-lg`}>
        <h3 className={`text-lg font-semibold text-${COLORS.textPrimary} mb-3`}>Sessão</h3>
        <button 
          onClick={handleLogout}
          className={`w-full py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-red-800/50 transition-colors duration-300 ease-in-out shadow-md hover:shadow-lg`}
        >
          Sair do Aplicativo
        </button>
      </div>

    </div>
  );
};

export default SettingsScreen;