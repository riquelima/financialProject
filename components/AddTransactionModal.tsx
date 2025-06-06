

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../hooks/useAppContext'; 
import { Transaction, TransactionType, PeriodType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import CategorySelect from './CategorySelect';
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
      setDescription('');
      setAmount('');
      setCategory('');
      setTransactionType(TransactionType.EXPENSE); 
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!description || isNaN(numericAmount) || numericAmount <= 0 || !category || !date) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const baseTransactionData = { 
        description, 
        amount: numericAmount, 
        category, 
        type: transactionType, 
        date,
        period_type: periodType 
    };

    if (transactionToEdit) {
      const fullTransactionToUpdate: Transaction = {
        ...baseTransactionData,
        id: transactionToEdit.id,
        month_data_id: transactionToEdit.month_data_id,
        user_id: transactionToEdit.user_id,
      };
      updateTransaction(fullTransactionToUpdate);
    } else {
      addTransaction(activeMonthYear, periodType, baseTransactionData);
    }
    onClose();
  };

  const categories = transactionType === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  const inputBaseClasses = "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-sm rounded-xl focus:border-[var(--input-focus-border)] focus:ring-1 focus:ring-[var(--input-focus-border)]/50 block p-3 transition-all duration-300 ease-in-out input-neon-focus font-normal"; // Poppins Normal, more rounded
  const labelBaseClasses = "block text-xs font-medium mb-1.5 text-[var(--text-secondary)]"; // Poppins Medium


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? "Editar Transação" : "Adicionar Transação"}>
      <form onSubmit={handleSubmit} className="space-y-5"> {/* Adjusted spacing */}
        <div>
          <label htmlFor="transactionType" className={labelBaseClasses}>Tipo</label>
          <div className="flex rounded-xl shadow-sm overflow-hidden border border-[var(--card-border-light)]"> {/* More rounded */}
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.INCOME); setCategory(''); }}
              className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none 
                          ${transactionType === TransactionType.INCOME ? 'text-[var(--ref-white)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
              style={transactionType === TransactionType.INCOME ? { background: 'var(--ref-blue-vibrant)' } : { background: 'var(--secondary-bg)'}} // Use ref-blue-vibrant for active income
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.EXPENSE); setCategory(''); }}
              className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none 
                          ${transactionType === TransactionType.EXPENSE ? 'text-[var(--ref-white)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
              style={transactionType === TransactionType.EXPENSE ? { background: 'var(--coral-red)' } : { background: 'var(--secondary-bg)'}}
            >
              Saída
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelBaseClasses}>Descrição</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={inputBaseClasses}
            placeholder="Ex: Supermercado, Salário"
          />
        </div>
        
        <div>
          <label htmlFor="amount" className={labelBaseClasses}>Valor ({settings?.currencySymbol || 'R$'})</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className={inputBaseClasses}
            placeholder="0,00"
          />
        </div>

        <div>
          <label htmlFor="category" className={labelBaseClasses}>Categoria</label>
          <CategorySelect
            id="category"
            categories={categories}
            selectedValue={category}
            onChange={setCategory}
            placeholder="Selecione uma categoria"
          />
        </div>

         <div>
          <label htmlFor="date" className={labelBaseClasses}>Data</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={`${inputBaseClasses}`}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <button 
            type="button" 
            onClick={onClose}
            className="py-2.5 px-5 border border-[var(--ref-card-border)] text-sm font-semibold rounded-xl text-[var(--text-secondary)] hover:bg-[var(--tertiary-bg)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--secondary-bg)] focus:ring-[var(--ref-blue-vibrant)] transition-all duration-300 ease-in-out"
            // Using ref-card-border for secondary button, more rounded
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="ref-button-primary py-2.5 px-6 text-sm shadow-md hover:shadow-lg" // Use new button class
          >
            {transactionToEdit ? 'Salvar Alterações' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;