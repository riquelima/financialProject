import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { APP_NAME, DollarSignIcon } from '../constants'; 

const LoginScreen: React.FC = () => {
  const { login, error: contextError } = useAppContext();
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
    setLocalError(''); 
    const success = await login(username, password);
    if (!success && !contextError) { 
      setLocalError('Usuário ou senha inválidos. Tente novamente.');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, var(--electric-blue), var(--absolute-black) 50%, var(--amethyst-purple))' }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-[14px] shadow-2xl"
        style={{ backgroundColor: 'var(--deep-gray-1)', border: '1px solid rgba(255,255,255,0.05)' }}
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
              className="w-full bg-[var(--deep-gray-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--placeholder-text-color)] text-base rounded-[10px] focus:border-[var(--emerald-lime)] focus:ring-2 focus:ring-[var(--emerald-lime)]/50 block p-3.5 transition-all duration-300 ease-in-out input-neon-focus"
              placeholder="Nome de usuário"
              style={{borderColor: 'rgba(255,255,255,0.1)'}}
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
              className="w-full bg-[var(--deep-gray-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--placeholder-text-color)] text-base rounded-[10px] focus:border-[var(--emerald-lime)] focus:ring-2 focus:ring-[var(--emerald-lime)]/50 block p-3.5 transition-all duration-300 ease-in-out input-neon-focus"
              placeholder="Sua senha"
              style={{borderColor: 'rgba(255,255,255,0.1)'}}
            />
          </div>

          {localError && (
            <p 
              className="text-sm text-center p-2.5 rounded-[10px]"
              style={{ backgroundColor: 'rgba(255,107,107,0.1)', color: 'var(--coral-red)'}}
            >
              {localError}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="w-full py-3.5 px-5 text-white font-semibold rounded-[10px] transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[var(--amethyst-purple)]/50 shadow-lg hover:shadow-xl button-gradient-hover"
              style={{ background: 'linear-gradient(90deg, var(--emerald-lime), var(--amethyst-purple))', backgroundSize: '200% auto' }}
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
       <footer className="absolute bottom-5 text-center w-full">
        <p className="text-xs" style={{color: 'rgba(255,255,255,0.3)'}}>
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;