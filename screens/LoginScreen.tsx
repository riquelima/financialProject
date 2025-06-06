
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { APP_NAME, DollarSignIcon } from '../constants'; 

const LoginScreen: React.FC = () => {
  const { login, error: contextError, isLoading } = useAppContext(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (contextError) {
      if (typeof contextError === 'string') {
        setLocalError(contextError);
      } else {
        setLocalError('Ocorreu um erro inesperado. Verifique o console.');
        console.warn("LoginScreen: contextError não é uma string:", contextError);
      }
    } else {
      setLocalError(''); 
    }
  }, [contextError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 
    setLocalError(''); 
    await login(username, password); 
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, var(--electric-blue), var(--primary-bg) 50%, var(--amethyst-purple))' }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-xl shadow-2xl"
        style={{ backgroundColor: 'var(--secondary-bg)', border: '1px solid var(--card-border)' }}
      >
        <div className="text-center mb-10">
          <DollarSignIcon className="w-20 h-20 mx-auto mb-4 gradient-text" />
          <h1 className="text-4xl font-bold" style={{color: 'var(--text-primary)'}}>{APP_NAME}</h1>
          <p style={{color: 'var(--text-secondary)'}} className="text-sm mt-1">Seu controle financeiro pessoal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label 
              htmlFor="username" 
              className="block text-xs font-semibold mb-1.5"
              style={{color: 'var(--text-secondary)'}}
            >
              Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading} 
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-base rounded-lg focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-border)]/50 block p-3.5 transition-all duration-300 ease-in-out input-neon-focus disabled:opacity-50" // Reverted placeholder variable
              placeholder="Nome de usuário"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-xs font-semibold mb-1.5"
              style={{color: 'var(--text-secondary)'}}
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading} 
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-base rounded-lg focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-border)]/50 block p-3.5 transition-all duration-300 ease-in-out input-neon-focus disabled:opacity-50" // Reverted placeholder variable
              placeholder="Sua senha"
            />
          </div>

          {localError && !isLoading && ( 
            <p 
              className="text-sm text-center p-2.5 rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--coral-red) 15%, transparent)', color: 'var(--coral-red)'}}
            >
              {localError}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading} 
              className="w-full py-3.5 px-5 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[var(--amethyst-purple)]/50 shadow-lg hover:shadow-xl button-gradient-hover disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ background: 'linear-gradient(90deg, var(--emerald-lime), var(--amethyst-purple))', backgroundSize: '200% auto' }}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Entrar"}
            </button>
          </div>
        </form>
      </div>
       <footer className="absolute bottom-5 text-center w-full">
        <p className="text-xs" style={{color: 'color-mix(in srgb, var(--text-secondary) 50%, transparent)'}}>
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;