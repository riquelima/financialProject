

import React, { useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext'; 
import { HomeIcon, CalendarIcon, BarChart2Icon, CogIcon, COLORS, AlertTriangleIcon, CheckCircleIcon } from './constants';
import DashboardScreen from './screens/DashboardScreen';
import FinancialPeriodScreen from './screens/FinancialPeriodScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import MonthlyAnalysisScreen from './screens/MonthlyAnalysisScreen'; // Import the new screen
import { PeriodType } from './types';

const baseNavLinks = [
  { to: "/", icon: HomeIcon, label: "Dashboard" },
  { to: "/month", icon: CalendarIcon, label: "Mês" }, 
  { to: "/analysis", icon: CheckCircleIcon, label: "Análise" }, 
  { to: "/history", icon: BarChart2Icon, label: "Histórico" },
  { to: "/settings", icon: CogIcon, label: "Ajustes" },
];

interface BottomNavigationProps {
  currentUsername: string | null; 
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentUsername }) => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `flex flex-col items-center justify-center p-2 transition-all duration-300 ease-in-out
     ${isActive 
       ? 'neon-glow-active bg-[color-mix(in_srgb,var(--link-active-text)_15%,transparent)] rounded-lg' 
       : 'hover:text-[var(--link-inactive-hover-text)] text-[var(--link-inactive-text)]'
     }`;


  const visibleNavLinks = useMemo(() => {
    if (currentUsername === 'admin') {
      return baseNavLinks;
    }
    // Non-admin users do not see "Análise" if it's meant to be admin-only (original logic)
    // For now, "Análise" (MonthlyAnalysisScreen) is visible to all authenticated users.
    // If it needs to be admin-only, filter it out here for non-admins.
    return baseNavLinks; 
  }, [currentUsername]);

  return (
    <nav style={{ backgroundColor: 'var(--secondary-bg)', borderTop: '1px solid var(--card-border-light)' }} 
         className="fixed bottom-0 left-0 right-0 shadow-2xl z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
        {visibleNavLinks.map(link => (
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
      <div style={{ backgroundColor: 'rgba(var(--primary-bg-rgb, 13, 13, 13), 0.9)', backdropFilter: 'blur(5px)' }} 
           className="fixed inset-0 flex flex-col items-center justify-center z-[100] text-[var(--text-primary)] text-lg space-y-4">
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
      <div style={{ background: 'var(--electric-blue)', color: 'var(--primary-bg)'}}
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
      <div style={{ background: 'var(--coral-red)', color: 'var(--primary-bg)' }}
           className="fixed top-5 right-5 left-5 md:left-auto md:max-w-md text-sm py-3 px-5 rounded-[14px] shadow-xl z-[100] flex items-center space-x-3">
        <AlertTriangleIcon className="h-5 w-5" />
        <span className="font-medium">{error}</span>
      </div>
    )
  }
  return null;
};


const App: React.FC = () => {
  const { isAuthenticated, currentUsername } = useAppContext();
  
  return (
    <HashRouter>
      <GlobalFeedback />
      {isAuthenticated ? (
        <div className="flex flex-col h-screen">
          <main className="flex-1 overflow-y-auto pb-20" style={{ backgroundColor: 'var(--primary-bg)' }}>
            <Routes>
              <Route path="/" element={<DashboardScreen />} />
              <Route path="/month" element={<FinancialPeriodScreen periodType={PeriodType.MID_MONTH} />} />
              {/* The "/analysis" route now points to MonthlyAnalysisScreen */}
              {/* It's visible to all users by default in BottomNavigation. Adjust if admin-only. */}
              <Route path="/analysis" element={<MonthlyAnalysisScreen />} /> 
              
              {/* Retain direct route for admin to old end-of-month screen if needed, but not linked in nav by "/analysis" anymore */}
              {currentUsername === 'admin' && ( 
                <Route path="/end-of-month-detail" element={<FinancialPeriodScreen periodType={PeriodType.END_OF_MONTH} />} />
              )}

              <Route path="/history" element={<HistoryScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              
              {/* If a non-admin tries to access a route that was specifically admin only (like the old end-of-month detail if you decide to keep it admin-only and give it a unique path) */}
              {/* {currentUsername !== 'admin' && <Route path="/analysis" element={<Navigate to="/" replace />} />} */} 
              {/* The above line is commented out as /analysis is now MonthlyAnalysisScreen and assumed visible to all. */}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <BottomNavigation currentUsername={currentUsername} />
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