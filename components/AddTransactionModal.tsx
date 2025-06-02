import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, PeriodType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import CategorySelect from './CategorySelect';
import { COLORS } from '../constants';
import { formatDate } from '../utils/formatters';


interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodType: PeriodType;
  transactionToEdit?: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, periodType, transactionToEdit }) => {
  const { activeMonthYear, addTransaction, updateTransaction, settings } = useAppContext();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setTransactionType(transactionToEdit.type);
      setDate(transactionToEdit.date);
    } else {
      // Reset form for new transaction
      setDescription('');
      setAmount('');
      setCategory('');
      // Default to expense, or could be smarter based on context if needed
      setTransactionType(TransactionType.EXPENSE); 
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit, isOpen]); // Reset form when modal opens or transactionToEdit changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!description || isNaN(numericAmount) || numericAmount <= 0 || !category || !date) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    // Ensure date is included in transactionData for both add and update
    const transactionData = { description, amount: numericAmount, category, type: transactionType, date };

    if (transactionToEdit) {
      // Pass the complete transaction object for update, merging new data with existing id
      updateTransaction(activeMonthYear, periodType, { ...transactionData, id: transactionToEdit.id });
    } else {
      // addTransaction now expects transactionData to include the date
      addTransaction(activeMonthYear, periodType, transactionData);
    }
    onClose(); // Close modal after submission
  };

  const categories = transactionType === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!category && categories.length > 0) {
      // setCategory(categories[0]); // Auto-select first category, if desired. Forcing user selection is often better.
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? "Editar Transação" : "Adicionar Transação"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="transactionType" className={`block text-sm font-medium text-${COLORS.textSecondary} mb-1`}>Tipo</label>
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.INCOME); setCategory(''); }}
              className={`flex-1 py-2 px-4 text-sm font-medium ${transactionType === TransactionType.INCOME ? `bg-${COLORS.income} text-white` : `bg-slate-600 text-${COLORS.textPrimary} hover:bg-slate-500`} rounded-l-md focus:outline-none transition-colors`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.EXPENSE); setCategory(''); }}
              className={`flex-1 py-2 px-4 text-sm font-medium ${transactionType === TransactionType.EXPENSE ? `bg-${COLORS.expense} text-white` : `bg-slate-600 text-${COLORS.textPrimary} hover:bg-slate-500`} rounded-r-md focus:outline-none transition-colors`}
            >
              Saída
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="description" className={`block text-sm font-medium text-${COLORS.textSecondary} mb-1`}>Descrição</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={`w-full bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`}
            placeholder="Ex: Supermercado, Salário"
          />
        </div>
        
        <div>
          <label htmlFor="amount" className={`block text-sm font-medium text-${COLORS.textSecondary} mb-1`}>Valor ({settings.currencySymbol})</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className={`w-full bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`}
            placeholder="0,00"
          />
        </div>

        <div>
          <label htmlFor="category" className={`block text-sm font-medium text-${COLORS.textSecondary} mb-1`}>Categoria</label>
          <CategorySelect
            id="category"
            categories={categories}
            selectedValue={category}
            onChange={setCategory}
            placeholder="Selecione uma categoria"
          />
        </div>

         <div>
          <label htmlFor="date" className={`block text-sm font-medium text-${COLORS.textSecondary} mb-1`}>Data</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={`w-full bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className={`py-2 px-4 border border-slate-600 text-sm font-medium rounded-lg text-${COLORS.textSecondary} hover:bg-slate-700 hover:text-${COLORS.textPrimary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors`}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className={`py-2 px-5 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-${COLORS.primary} transition-opacity shadow-md hover:shadow-lg transform active:scale-95`}
          >
            {transactionToEdit ? 'Salvar Alterações' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;