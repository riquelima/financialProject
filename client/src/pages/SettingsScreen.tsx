import { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function SettingsScreen() {
  const { settings, updateSettings, logout, user } = useAppContext();
  const [formData, setFormData] = useState({
    userNameDisplay: '',
    currencySymbol: 'R$',
    theme: 'dark' as 'dark' | 'light'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        userNameDisplay: settings.userNameDisplay,
        currencySymbol: settings.currencySymbol,
        theme: settings.theme
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-20 md:pb-0">
      <div className="glass-effect p-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold neon-text">
            <i className="fas fa-cog mr-2"></i>
            Configurações
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* User Info */}
        <div className="glass-effect p-6 rounded-xl neon-glow">
          <h2 className="text-xl font-semibold text-neon-cyan mb-4">Informações do Usuário</h2>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center">
              <i className="fas fa-user text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{formData.userNameDisplay || 'Usuário'}</h3>
              <p className="text-gray-400">@{user?.username}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={formData.userNameDisplay}
                onChange={(e) => setFormData(prev => ({ ...prev, userNameDisplay: e.target.value }))}
                className="w-full p-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                placeholder="Seu nome"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-effect p-6 rounded-xl neon-glow">
          <h2 className="text-xl font-semibold text-neon-cyan mb-4">Preferências</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Símbolo da Moeda
              </label>
              <select 
                value={formData.currencySymbol}
                onChange={(e) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))}
                className="w-full p-3 rounded-lg glass-effect text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              >
                <option value="R$">R$ (Real)</option>
                <option value="$">$ (Dólar)</option>
                <option value="€">€ (Euro)</option>
                <option value="£">£ (Libra)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tema
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, theme: 'dark' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    formData.theme === 'dark'
                      ? 'bg-neon-cyan bg-opacity-20 text-neon-cyan'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  <i className="fas fa-moon mr-2"></i>Escuro
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, theme: 'light' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    formData.theme === 'light'
                      ? 'bg-neon-cyan bg-opacity-20 text-neon-cyan'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  <i className="fas fa-sun mr-2"></i>Claro
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="glass-effect p-6 rounded-xl neon-glow">
          <h2 className="text-xl font-semibold text-neon-cyan mb-4">Ações</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full py-3 px-4 btn-neon rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Salvar Configurações
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-lg bg-neon-red bg-opacity-20 text-neon-red font-medium hover:bg-opacity-30 transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
