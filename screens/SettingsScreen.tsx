
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext.js';
import { CogIcon, COLORS, Trash2Icon, PlusCircleIcon, Edit3Icon } from '../constants.js'; // Added Edit3Icon
import { getMonthName } from '../utils/formatters.js';
import { TransactionType, UserCategory } from '../types.js'; // Removed DEFAULT_CATEGORIES import
import EditCategoryModal from '../components/EditCategoryModal.js'; 

const SettingsScreen: React.FC = () => {
  const { 
    settings, updateSettings, 
    activeMonthYear, updateMonthData, getCurrentMonthData, 
    logout, currentUsername,
    userCategories, addUserCategory, deleteUserCategory, updateUserCategory,
    getCombinedIncomeCategories, getCombinedExpenseCategories
  } = useAppContext();
  
  const [userNameDisplay, setUserNameDisplay] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('R$');
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');
  
  const currentMonthData = getCurrentMonthData(); 
  const [openingBalance, setOpeningBalance] = useState('');
  const [creditCardLimit, setCreditCardLimit] = useState('');

  // State for new category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>(TransactionType.EXPENSE);

  // State for editing category
  const [editingCategory, setEditingCategory] = useState<UserCategory | null>(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);


  useEffect(() => {
    if (settings) {
      setUserNameDisplay(settings.userNameDisplay || currentUsername || '');
      setCurrencySymbol(settings.currencySymbol);
      setSelectedTheme(settings.theme || 'dark');
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
    alert("Configurações salvas!");
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Por favor, insira um nome para a categoria.");
      return;
    }
    try {
      await addUserCategory(newCategoryName.trim(), newCategoryType);
      setNewCategoryName('');
    } catch (error: any) {
      // Error is handled by context
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
      try {
        await deleteUserCategory(categoryId);
      } catch (error: any) {
        // Error is handled by context
      }
    }
  };

  const handleOpenEditCategoryModal = (category: UserCategory) => {
    setEditingCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleSaveEditedCategory = async (categoryId: string, newName: string, newType: TransactionType) => {
    await updateUserCategory(categoryId, newName, newType);
  };
  
  const inputBaseClasses = "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-sm rounded-lg focus:ring-[var(--emerald-lime)] focus:border-[var(--emerald-lime)] block p-3 transition-colors duration-200 focus:outline-none input-neon-focus";
  const labelBaseClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-1";
  const cardBaseClasses = "p-6 bg-[var(--secondary-bg)] rounded-xl shadow-lg";
  const sectionTitleClasses = "text-xl font-semibold text-[var(--text-accent)] mb-4 border-b border-[var(--card-border-light)] pb-2";

  const combinedIncomeCategories = getCombinedIncomeCategories();
  const combinedExpenseCategories = getCombinedExpenseCategories();

  // Helper to find the UserCategory object by name and type from the userCategories list
  const findUserCategoryObject = (name: string, type: TransactionType): UserCategory | undefined => {
    return userCategories.find(uc => uc.name === name && uc.type === type && uc.user_id === settings?.user_id);
  };

  if (!settings) {
    return <div className="p-4 text-center text-[var(--text-secondary)]">Carregando configurações...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div className={`flex items-center space-x-3 p-4 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} rounded-lg shadow-md`}>
        <CogIcon className="w-8 h-8 text-white" />
        <h1 className="text-3xl font-bold text-white">Ajustes</h1>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSaveSettings} className={`${cardBaseClasses} space-y-6`}>
        <div>
          <h2 className={sectionTitleClasses}>Configurações Gerais</h2>
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
                className={`${inputBaseClasses} themed-select`}
              >
                <option value="dark">Escuro (Neon)</option>
                <option value="light">Claro</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h2 className={sectionTitleClasses}>
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
            className={`w-full py-3 px-5 bg-gradient-to-r from-${COLORS.petroleumBlue} via-${COLORS.deepPurple} to-${COLORS.discreetNeonGreen} text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[var(--emerald-lime)]/50 transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-100 shadow-lg hover:shadow-xl`}
          >
            Salvar Configurações e Dados do Mês
          </button>
        </div>
      </form>

      {/* Category Management Section */}
      <div className={cardBaseClasses}>
        <h2 className={sectionTitleClasses}>Gerenciar Categorias</h2>
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="newCategoryName" className={labelBaseClasses}>Nome da Nova Categoria</label>
            <input
              type="text"
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className={inputBaseClasses}
              placeholder="Ex: Supermercado, Salário Extra"
            />
          </div>
          <div>
            <label className={labelBaseClasses}>Tipo da Nova Categoria</label>
            <div className="flex rounded-[10px] shadow-sm overflow-hidden border border-[var(--card-border-light)]">
                <button
                type="button"
                onClick={() => setNewCategoryType(TransactionType.INCOME)}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                            ${newCategoryType === TransactionType.INCOME ? 'text-[var(--primary-bg)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
                style={newCategoryType === TransactionType.INCOME ? { background: 'var(--emerald-lime)' } : { background: 'var(--secondary-bg)'}}
                >
                Receita
                </button>
                <button
                type="button"
                onClick={() => setNewCategoryType(TransactionType.EXPENSE)}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                            ${newCategoryType === TransactionType.EXPENSE ? 'text-[var(--primary-bg)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
                style={newCategoryType === TransactionType.EXPENSE ? { background: 'var(--coral-red)' } : { background: 'var(--secondary-bg)'}}
                >
                Despesa
                </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddCategory}
            className="w-full flex items-center justify-center py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-emerald-700/50 transition-all duration-300 ease-in-out shadow-md"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Adicionar Categoria
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-semibold text-[var(--text-primary)] mb-2">Categorias de Receita</h3>
            <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
              {combinedIncomeCategories.map(catName => {
                const categoryObj = findUserCategoryObject(catName, TransactionType.INCOME);
                if (!categoryObj) return null; // Should not happen if seeding works
                return (
                  <li key={categoryObj.id} className="flex justify-between items-center p-2 rounded bg-[var(--tertiary-bg)] text-sm">
                    <span className="text-[var(--text-secondary)] flex-grow">{categoryObj.name}</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleOpenEditCategoryModal(categoryObj)} 
                        className="text-sky-500 hover:text-sky-400 p-1"
                        aria-label={`Editar categoria ${categoryObj.name}`}
                      >
                        <Edit3Icon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(categoryObj.id)} 
                        className="text-red-500 hover:text-red-400 p-1"
                        aria-label={`Excluir categoria ${categoryObj.name}`}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold text-[var(--text-primary)] mb-2">Categorias de Despesa</h3>
            <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
              {combinedExpenseCategories.map(catName => {
                 const categoryObj = findUserCategoryObject(catName, TransactionType.EXPENSE);
                 if (!categoryObj) return null; // Should not happen
                return (
                  <li key={categoryObj.id} className="flex justify-between items-center p-2 rounded bg-[var(--tertiary-bg)] text-sm">
                    <span className="text-[var(--text-secondary)] flex-grow">{categoryObj.name}</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleOpenEditCategoryModal(categoryObj)} 
                        className="text-sky-500 hover:text-sky-400 p-1"
                        aria-label={`Editar categoria ${categoryObj.name}`}
                      >
                        <Edit3Icon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(categoryObj.id)} 
                        className="text-red-500 hover:text-red-400 p-1"
                        aria-label={`Excluir categoria ${categoryObj.name}`}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      
      <div className={cardBaseClasses}>
          <h3 className={`text-lg font-semibold text-[var(--text-primary)] mb-2`}>Backup e Sincronização</h3>
          <p className={`text-sm text-[var(--text-secondary)]`}>Seus dados são salvos automaticamente no Supabase quando você realiza alterações.</p>
      </div>

      <div className={cardBaseClasses}>
        <h3 className={`text-lg font-semibold text-[var(--text-primary)] mb-3`}>Sessão</h3>
        <button 
          onClick={handleLogout}
          className={`w-full py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-red-800/50 transition-colors duration-300 ease-in-out shadow-md hover:shadow-lg`}
        >
          Sair do Aplicativo
        </button>
      </div>

      {editingCategory && (
        <EditCategoryModal
          isOpen={isEditCategoryModalOpen}
          onClose={() => { setIsEditCategoryModalOpen(false); setEditingCategory(null); }}
          categoryToEdit={editingCategory}
          onSave={handleSaveEditedCategory}
        />
      )}
    </div>
  );
};

export default SettingsScreen;
