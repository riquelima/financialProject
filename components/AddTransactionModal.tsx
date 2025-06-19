
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal.js';
import { useAppContext } from '../hooks/useAppContext.js'; 
import { Transaction, TransactionType, PeriodType } from '../types.js';
import CategorySelect from './CategorySelect.js';
import { formatDate } from '../utils/formatters.js';


interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodType: PeriodType;
  transactionToEdit?: Transaction | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, periodType, transactionToEdit }) => {
  const { 
    activeMonthYear, 
    addTransaction, 
    updateTransaction, 
    settings,
    getCombinedIncomeCategories, // New context function
    getCombinedExpenseCategories // New context function
  } = useAppContext();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setTransactionType(transactionToEdit.type);
      setDate(transactionToEdit.date);
      setIsRecurring(transactionToEdit.isRecurring || false); 
    } else {
      setDescription('');
      setAmount('');
      setCategory('');
      setTransactionType(TransactionType.EXPENSE); 
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false); 
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
        period_type: periodType,
        isRecurring: isRecurring, 
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

  const currentCategories = useMemo(() => {
    return transactionType === TransactionType.INCOME 
      ? getCombinedIncomeCategories() 
      : getCombinedExpenseCategories();
  }, [transactionType, getCombinedIncomeCategories, getCombinedExpenseCategories]);
  
  // Ensure category is reset if it's not in the new list of categories when type changes
  useEffect(() => {
    if (category && !currentCategories.includes(category)) {
      setCategory('');
    }
  }, [currentCategories, category]);

  const inputBaseClasses = "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-base rounded-[10px] focus:border-[var(--input-focus-border)] focus:ring-1 focus:ring-[var(--input-focus-border)]/50 block p-3.5 transition-all duration-300 ease-in-out input-neon-focus";
  const labelBaseClasses = "block text-xs font-semibold mb-1.5 text-[var(--text-secondary)]";


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? "Editar Transação" : "Adicionar Transação"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="transactionType" className={labelBaseClasses}>Tipo</label>
          <div className="flex rounded-[10px] shadow-sm overflow-hidden border border-[var(--card-border-light)]">
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.INCOME); setCategory(''); }}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                          ${transactionType === TransactionType.INCOME ? 'text-[var(--primary-bg)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
              style={transactionType === TransactionType.INCOME ? { background: 'var(--emerald-lime)' } : { background: 'var(--secondary-bg)'}}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.EXPENSE); setCategory(''); }}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                          ${transactionType === TransactionType.EXPENSE ? 'text-[var(--primary-bg)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
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
            categories={currentCategories}
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
            className={`${inputBaseClasses} dark-date-picker`}
          />
        </div>

        <div>
          <label htmlFor="isRecurring" className="flex items-center space-x-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="form-checkbox h-4 w-4 rounded text-[var(--emerald-lime)] bg-[var(--input-bg)] border-[var(--input-border)] focus:ring-[var(--emerald-lime)] focus:ring-offset-0 shadow-sm"
            />
            <span className={`${labelBaseClasses} mb-0`}>Marcar como Recorrente</span>
          </label>
        </div>


        <div className="flex justify-end space-x-3 pt-3">
          <button 
            type="button" 
            onClick={onClose}
            className="py-2.5 px-5 border border-[var(--card-border)] text-sm font-semibold rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--secondary-bg)] focus:ring-[var(--amethyst-purple)] transition-all duration-300 ease-in-out"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="py-2.5 px-6 text-white text-sm font-semibold rounded-[10px] transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--secondary-bg)] focus:ring-[var(--emerald-lime)] shadow-lg hover:shadow-xl button-gradient-hover"
            style={{ background: 'linear-gradient(90deg, var(--emerald-lime), var(--amethyst-purple))', backgroundSize: '200% auto' }}
          >
            {transactionToEdit ? 'Salvar Alterações' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTransactionModal;
