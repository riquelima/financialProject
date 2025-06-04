import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';
import { HomeIcon, CalendarIcon, ListIcon, BarChart2Icon, CogIcon, COLORS, AlertTriangleIcon } from './constants';
import DashboardScreen from './screens/DashboardScreen';
import FinancialPeriodScreen from './screens/FinancialPeriodScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import AiChatFab from './components/AiChatFab'; // Added
import AiChatModal from './components/AiChatModal'; // Added
import { PeriodType } from './types';

const NavLinksArray = [
  { to: "/", icon: HomeIcon, label: "Dashboard" },
  { to: "/mid-month", icon: CalendarIcon, label: "Meio Mês" },
  { to: "/end-of-month", icon: ListIcon, label: "Fim Mês" },
  { to: "/history", icon: BarChart2Icon, label: "Histórico" },
  { to: "/settings", icon: CogIcon, label: "Ajustes" },
];

const BottomNavigation: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `flex flex-col items-center justify-center p-2 transition-colors duration-300 ease-in-out
     ${isActive ? 'neon-glow-active' : 'text-slate-400 hover:text-slate-200'}`;

  return (
    <nav style={{ backgroundColor: 'var(--deep-gray-2)', borderTop: '1px solid rgba(255,255,255,0.1)' }} 
         className="fixed bottom-0 left-0 right-0 shadow-2xl z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {NavLinksArray.map(link => (
          <NavLink key={link.to} to={link.to} className={navLinkClasses} end={link.to === "/"}>
            <link.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const GlobalFeedback: React.FC = () => {
  const { isLoading, isSaving, error } = useAppContext();

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'rgba(13, 13, 13, 0.9)', backdropFilter: 'blur(5px)' }} 
           className="fixed inset-0 flex flex-col items-center justify-center z-[100] text-white text-lg space-y-4">
        <svg className="animate-spin h-10 w-10" style={{ color: 'var(--emerald-lime)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-medium">Carregando seus dados...</span>
      </div>
    );
  }
  
  if (isSaving) {
     return (
      <div style={{ background: 'var(--electric-blue)', color: 'var(--deep-gray-1)'}} 
           className="fixed top-5 right-5 text-sm py-2.5 px-5 rounded-[14px] shadow-xl z-[100] flex items-center space-x-2 animate-pulse">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-semibold">Salvando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'var(--coral-red)', color: 'var(--absolute-black)' }} 
           className="fixed top-5 right-5 left-5 md:left-auto md:max-w-md text-sm py-3 px-5 rounded-[14px] shadow-xl z-[100] flex items-center space-x-3">
        <AlertTriangleIcon className="h-5 w-5" />
        <span className="font-medium">{error}</span>
      </div>
    )
  }

  return null;
};


const App: React.FC = () => {
  const { isAuthenticated, data, settings, activeMonthYear, getAllTransactionsForMonth, getMonthlySummary } = useAppContext(); // Added data for AI
  const [isAiChatModalOpen, setIsAiChatModalOpen] = useState(false);

  return (
    <HashRouter>
      <GlobalFeedback />
      {isAuthenticated ? (
        <div className="flex flex-col h-screen">
          <main className="flex-1 overflow-y-auto pb-20" style={{ backgroundColor: 'var(--absolute-black)' }}>
            <Routes>
              <Route path="/" element={<DashboardScreen />} />
              <Route path="/mid-month" element={<FinancialPeriodScreen periodType={PeriodType.MID_MONTH} />} />
              <Route path="/end-of-month" element={<FinancialPeriodScreen periodType={PeriodType.END_OF_MONTH} />} />
              <Route path="/history" element={<HistoryScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AiChatFab onClick={() => setIsAiChatModalOpen(true)} />
          <BottomNavigation />
          <AiChatModal 
            isOpen={isAiChatModalOpen} 
            onClose={() => setIsAiChatModalOpen(false)} 
            // Pass relevant financial data for the AI context (placeholder for now)
            // In a real scenario, this data would be passed to the n8n workflow
            financialContext={{ 
              currentMonthData: data[activeMonthYear], 
              allTransactions: getAllTransactionsForMonth(activeMonthYear),
              monthlySummary: getMonthlySummary(activeMonthYear),
              userSettings: settings
            }}
          />
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
};

export default App;