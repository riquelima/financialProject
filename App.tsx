



import React, { useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAppContext } from './hooks/useAppContext'; 
import { HomeIcon, CalendarIcon, ListIcon, BarChart2Icon, CogIcon, COLORS, AlertTriangleIcon } from './constants';
import DashboardScreen from './screens/DashboardScreen';
import FinancialPeriodScreen from './screens/FinancialPeriodScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import { PeriodType } from './types';

const baseNavLinks = [
  { to: "/", icon: HomeIcon, label: "Dashboard" },
  { to: "/mid-month", icon: CalendarIcon, label: "Meio Mês" }, 
  { to: "/end-of-month", icon: ListIcon, label: "Fim Mês" },
  { to: "/history", icon: BarChart2Icon, label: "Histórico" },
  { to: "/settings", icon: CogIcon, label: "Ajustes" },
];

interface BottomNavigationProps {
  currentUsername: string | null; 
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentUsername }) => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `flex flex-col items-center justify-center p-2 transition-colors duration-300 ease-in-out
     ${isActive ? 'text-[var(--link-active-text)] font-medium' : 'text-[var(--link-inactive-text)] hover:text-[var(--link-inactive-hover-text)]'}`;
     // Removed neon-glow-active, using text color and font-weight for active state


  const visibleNavLinks = useMemo(() => {
    if (currentUsername === 'admin') {
      return baseNavLinks;
    }
    return baseNavLinks
      .filter(link => link.label !== "Fim Mês") 
      .map(link => {
        if (link.label === "Meio Mês") {
          return { ...link, label: "Mês" }; 
        }
        return link;
      });
  }, [currentUsername]);

  return (
    <nav style={{ backgroundColor: 'var(--secondary-bg)', borderTop: '1px solid var(--card-border)' }} // Use new card-border
         className="fixed bottom-0 left-0 right-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50"> {/* Softer shadow for top border */}
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {visibleNavLinks.map(link => (
          <NavLink key={link.to} to={link.to} className={navLinkClasses} end={link.to === "/"}>
            <link.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-normal">{link.label}</span> {/* Poppins normal */}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const GlobalFeedback: React.FC = () => {
  const { isLoading, isSaving, error, settings } = useAppContext();
  const isLightTheme = settings?.theme === 'light';

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'rgba(var(--primary-bg-rgb, 245,247,250), 0.8)', backdropFilter: 'blur(4px)' }} 
           className="fixed inset-0 flex flex-col items-center justify-center z-[100] text-[var(--text-primary)] text-lg space-y-4">
        <svg className="animate-spin h-10 w-10" style={{ color: 'var(--text-accent)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-medium">Carregando seus dados...</span> {/* Poppins Medium */}
      </div>
    );
  }
  
  if (isSaving) {
     return (
      <div style={{ background: 'var(--ref-blue-vibrant)', color: 'var(--ref-white)'}} 
           className="fixed top-5 right-5 text-sm py-2.5 px-5 rounded-[12px] shadow-lg z-[100] flex items-center space-x-2 animate-pulse"> {/* More rounded */}
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-semibold">Salvando...</span> {/* Poppins Semibold */}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'var(--coral-red)', color: 'var(--ref-white)' }}
           className="fixed top-5 right-5 left-5 md:left-auto md:max-w-md text-sm py-3 px-5 rounded-[12px] shadow-lg z-[100] flex items-center space-x-3"> {/* More rounded */}
        <AlertTriangleIcon className="h-5 w-5" />
        <span className="font-medium">{error}</span> {/* Poppins Medium */}
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
              <Route path="/mid-month" element={<FinancialPeriodScreen periodType={PeriodType.MID_MONTH} />} />
              {currentUsername === 'admin' && ( 
                <Route path="/end-of-month" element={<FinancialPeriodScreen periodType={PeriodType.END_OF_MONTH} />} />
              )}
              <Route path="/history" element={<HistoryScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              {currentUsername !== 'admin' && <Route path="/end-of-month" element={<Navigate to="/" replace />} />}
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