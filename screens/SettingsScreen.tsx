
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { CogIcon, COLORS } from '../constants';
import { getMonthName } from '../utils/formatters';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, activeMonthYear, updateMonthData, getCurrentMonthData, logout, currentUsername } = useAppContext();
  
  const [userNameDisplay, setUserNameDisplay] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('R$');
  
  const currentMonthData = getCurrentMonthData(); // Can be null initially
  const [openingBalance, setOpeningBalance] = useState('');
  const [creditCardLimit, setCreditCardLimit] = useState('');

  useEffect(() => {
    if (settings) {
      setUserNameDisplay(settings.userNameDisplay || currentUsername || ''); // Fallback to login username
      setCurrencySymbol(settings.currencySymbol);
    }
  }, [settings, currentUsername]);

  useEffect(() => {
    if (currentMonthData) {
      setOpeningBalance(String(currentMonthData.openingBalance || 0));
      setCreditCardLimit(String(currentMonthData.creditCardLimit || ''));
    } else {
      // If currentMonthData is null (e.g., during initial load or if activeMonth has no data yet)
      // set to default/empty strings.
      setOpeningBalance('0');
      setCreditCardLimit('');
    }
  }, [activeMonthYear, currentMonthData]);


  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) { // Should not happen if UI is rendered, but good check
        alert("Configurações ainda não carregadas.");
        return;
    }
    updateSettings({ userNameDisplay: userNameDisplay || undefined, currencySymbol });
    
    const numOpeningBalance = parseFloat(openingBalance) || 0;
    // Ensure creditCardLimit is explicitly null if empty, or a number if provided
    const numCreditCardLimit = creditCardLimit.trim() === '' ? null : parseFloat(creditCardLimit);


    updateMonthData(activeMonthYear, { 
      openingBalance: numOpeningBalance, 
      creditCardLimit: numCreditCardLimit === null ? undefined : numCreditCardLimit, 
    });
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };
  
  const inputBaseClasses = `w-full bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`;
  const labelBaseClasses = `block text-sm font-medium text-${COLORS.textSecondary} mb-1`;

  if (!settings) {
    return <div className="p-4 text-center" style={{color: 'var(--text-secondary)'}}>Carregando configurações...</div>;
  }

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
              <label htmlFor="userNameDisplay" className={labelBaseClasses}>Nome de Exibição (Opcional)</label>
              <input
                type="text"
                id="userNameDisplay"
                value={userNameDisplay}
                onChange={(e) => setUserNameDisplay(e.target.value)}
                className={inputBaseClasses}
                placeholder="Seu nome para exibição"
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
              <label htmlFor="openingBalance" className={labelBaseClasses}>Saldo Inicial do Mês ({currencySymbol})</label>
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
              <label htmlFor="creditCardLimit" className={labelBaseClasses}>Limite Total do Cartão de Crédito ({currencySymbol}) (Opcional)</label>
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
            Salvar Alterações
          </button>
        </div>
      </form>

      <div className={`p-6 bg-${COLORS.cardBackground} rounded-xl shadow-lg`}>
          <h3 className={`text-lg font-semibold text-${COLORS.textPrimary} mb-2`}>Tema</h3>
          <p className={`text-sm text-${COLORS.textSecondary}`}>Atualmente, o aplicativo utiliza o tema {settings.theme}. A opção de alternar temas será adicionada em futuras atualizações.</p>
      </div>
      <div className={`p-6 bg-${COLORS.cardBackground} rounded-xl shadow-lg`}>
          <h3 className={`text-lg font-semibold text-${COLORS.textPrimary} mb-2`}>Backup e Sincronização</h3>
          <p className={`text-sm text-${COLORS.textSecondary}`}>Seus dados são salvos automaticamente no Supabase quando você realiza alterações.</p>
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