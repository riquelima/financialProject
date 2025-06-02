import React from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext';
import { HomeIcon, CalendarIcon, ListIcon, BarChart2Icon, CogIcon, COLORS, AlertTriangleIcon, CheckCircleIcon } from './constants';
import DashboardScreen from './screens/DashboardScreen';
import FinancialPeriodScreen from './screens/FinancialPeriodScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen'; // Import LoginScreen
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
    `flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
      isActive ? `text-${COLORS.primary}` : `text-gray-400 hover:text-${COLORS.discreetNeonGreen}`
    }`;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-${COLORS.cardBackground} border-t border-slate-700 shadow-lg z-50`}>
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {NavLinksArray.map(link => (
          <NavLink key={link.to} to={link.to} className={navLinkClasses} end={link.to === "/"}>
            <link.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{link.label}</span>
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
      <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex flex-col items-center justify-center z-[100] text-white text-xl space-y-4 backdrop-blur-sm">
        <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Carregando seus dados...</span>
      </div>
    );
  }
  
  if (isSaving) {
     return (
      <div className="fixed top-5 right-5 bg-sky-600 text-white text-sm py-2 px-4 rounded-lg shadow-lg z-[100] flex items-center space-x-2 animate-pulse">
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Salvando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-5 right-5 left-5 md:left-auto md:max-w-md bg-red-600 text-white text-sm py-3 px-5 rounded-lg shadow-lg z-[100] flex items-center space-x-3">
        <AlertTriangleIcon className="h-5 w-5 text-white" />
        <span>{error}</span>
      </div>
    )
  }

  return null;
};


const App: React.FC = () => {
  const { isAuthenticated } = useAppContext(); // isLoading is handled by GlobalFeedback now

  return (
    <HashRouter>
      <GlobalFeedback />
      {isAuthenticated ? (
        <div className="flex flex-col h-screen antialiased">
          <main className="flex-1 overflow-y-auto pb-16 bg-slate-900">
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
          <BottomNavigation />
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