

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { CogIcon, COLORS } from '../constants';
import { getMonthName } from '../utils/formatters';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, activeMonthYear, updateMonthData, getCurrentMonthData, logout, currentUsername } = useAppContext();
  
  const [userNameDisplay, setUserNameDisplay] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('R$');
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');
  
  const currentMonthData = getCurrentMonthData(); 
  const [openingBalance, setOpeningBalance] = useState('');
  const [creditCardLimit, setCreditCardLimit] = useState('');

  useEffect(() => {
    if (settings) {
      setUserNameDisplay(settings.userNameDisplay || currentUsername || '');
      setCurrencySymbol(settings.currencySymbol);
      setSelectedTheme(settings.theme || 'light'); // Default to light for settings page if new theme is light
    }
  }, [settings, currentUsername]);

  useEffect(() => {
    if (currentMonthData) {
      setOpeningBalance(String(currentMonthData.openingBalance || 0));
      setCreditCardLimit(String(currentMonthData.creditCardLimit || ''));
    } else {
      setOpeningBalance('0');
      setCreditCardLimit('');
    }
  }, [activeMonthYear, currentMonthData]);


  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) { 
        alert("Configurações ainda não carregadas.");
        return;
    }
    updateSettings({ 
      userNameDisplay: userNameDisplay || undefined, 
      currencySymbol,
      theme: selectedTheme 
    });
    
    const numOpeningBalance = parseFloat(openingBalance) || 0;
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
  
  const inputBaseClasses = "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-sm rounded-xl focus:ring-1 focus:ring-[var(--input-focus-border)]/50 focus:border-[var(--input-focus-border)] block p-3 transition-colors duration-200 focus:outline-none input-neon-focus font-normal"; // Poppins normal, more rounded
  const labelBaseClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-1.5"; // Poppins medium
  const cardBaseClasses = "p-6 bg-[var(--secondary-bg)] rounded-[20px] shadow-xl border border-[var(--card-border)]"; // New card style


  if (!settings) {
    return <div className="p-4 text-center text-[var(--text-secondary)]">Carregando configurações...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6"> {/* Adjusted spacing */}
      <div className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg`} style={{background: 'var(--ref-blue-vibrant)'}}>
        <CogIcon className="w-7 h-7 text-white" />
        <h1 className="text-2xl font-bold text-white">Ajustes</h1> {/* Poppins Bold */}
      </div>

      <form onSubmit={handleSaveSettings} className={`${cardBaseClasses} space-y-6`}>
        <div>
          <h2 className={`text-lg font-semibold text-[var(--text-accent)] mb-3 border-b border-[var(--card-border-light)] pb-2`}>Configurações Gerais</h2> {/* Poppins Semibold */}
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
            <div>
              <label htmlFor="themeSelector" className={labelBaseClasses}>Tema</label>
              <select
                id="themeSelector"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as 'dark' | 'light')}
                className={`${inputBaseClasses} themed-select`} // themed-select updated in index.html
              >
                <option value="light">Claro (Novo)</option>
                <option value="dark">Escuro (Adaptado)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h2 className={`text-lg font-semibold text-[var(--text-accent)] mb-3 border-b border-[var(--card-border-light)] pb-2`}> {/* Poppins Semibold */}
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
            className={`w-full ref-button-primary py-3 text-base shadow-md hover:shadow-lg`} // Use new button class
          >
            Salvar Alterações
          </button>
        </div>
      </form>
      
      <div className={cardBaseClasses}>
          <h3 className={`text-lg font-semibold text-[var(--text-primary)] mb-2`}>Backup e Sincronização</h3> {/* Poppins Semibold */}
          <p className={`text-sm text-[var(--text-secondary)] font-normal`}>Seus dados são salvos automaticamente no Supabase quando você realiza alterações.</p> {/* Poppins Normal */}
      </div>

      <div className={cardBaseClasses}>
        <h3 className={`text-lg font-semibold text-[var(--text-primary)] mb-3`}>Sessão</h3> {/* Poppins Semibold */}
        <button 
          onClick={handleLogout}
          className={`w-full py-2.5 px-5 bg-[var(--coral-red)] hover:brightness-90 text-white font-semibold rounded-xl transition-all duration-300 ease-in-out shadow-md hover:shadow-lg`} // Poppins Semibold, more rounded
        >
          Sair do Aplicativo
        </button>
      </div>

    </div>
  );
};

export default SettingsScreen;