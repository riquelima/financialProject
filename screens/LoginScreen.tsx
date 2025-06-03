import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { COLORS, APP_NAME } from '../constants'; 
import { DollarSignIcon } from '../constants'; 

const LoginScreen: React.FC = () => {
  const { login, error: contextError } = useAppContext(); // Use error from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(''); // Clear local error before attempt
    const success = await login(username, password);
    if (!success && !contextError) { 
      setLocalError('Usuário ou senha inválidos. Tente novamente.');
    }
    // Navigation is handled by App.tsx
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${COLORS.gradientFrom} ${COLORS.gradientVia} ${COLORS.gradientTo} p-4`}>
      <div className={`w-full max-w-md bg-${COLORS.cardBackground} p-8 rounded-xl shadow-2xl`}>
        <div className="text-center mb-8">
          <DollarSignIcon className={`w-16 h-16 mx-auto text-${COLORS.primary} mb-3`} />
          <h1 className={`text-3xl font-bold text-${COLORS.textPrimary}`}>{APP_NAME}</h1>
          <p className={`text-${COLORS.textSecondary}`}>Seu controle financeiro pessoal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className={`block text-sm font-medium text-${COLORS.textSecondary} mb-1`}
            >
              Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`}
              placeholder="Nome de usuário"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className={`block text-sm font-medium text-${COLORS.textSecondary} mb-1`}
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`}
              placeholder="Sua senha"
            />
          </div>

          {localError && (
            <p className={`text-sm text-center text-${COLORS.expense} bg-red-900/30 p-2 rounded-md`}>{localError}</p>
          )}

          <div>
            <button
              type="submit"
              className={`w-full py-3 px-5 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-${COLORS.primary}/50 transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-100 shadow-lg hover:shadow-xl`}
            >
              Entrar
            </button>
          </div>
        </form>
        {/* A dica de credenciais foi removida daqui */}
      </div>
       <footer className="absolute bottom-4 text-center w-full">
        <p className={`text-xs text-slate-500`}>
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;