import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppProvider } from "./contexts/AppContext";
import { useAppContext } from "./hooks/useAppContext";
import LoginScreen from "./pages/LoginScreen";
import DashboardScreen from "./pages/DashboardScreen";
import HistoryScreen from "./pages/HistoryScreen";
import SettingsScreen from "./pages/SettingsScreen";
import BottomNavigation from "./components/BottomNavigation";
import { Toaster } from "@/components/ui/toaster";

function AppContent() {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-primary">
        <div className="glass-effect p-8 rounded-xl neon-glow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto"></div>
          <p className="text-gray-300 text-center mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <Switch>
        <Route path="/" component={DashboardScreen} />
        <Route path="/dashboard" component={DashboardScreen} />
        <Route path="/history" component={HistoryScreen} />
        <Route path="/settings" component={SettingsScreen} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
