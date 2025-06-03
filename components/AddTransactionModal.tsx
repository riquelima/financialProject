import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAppContext } from '../hooks/useAppContext';
import { Transaction, TransactionType, PeriodType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import CategorySelect from './CategorySelect';
// import { COLORS } from '../constants'; // COLORS can be removed if using CSS vars directly
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

    const transactionData = { description, amount: numericAmount, category, type: transactionType, date };

    if (transactionToEdit) {
      updateTransaction(activeMonthYear, periodType, { ...transactionData, id: transactionToEdit.id });
    } else {
      addTransaction(activeMonthYear, periodType, transactionData);
    }
    onClose();
  };

  const categories = transactionType === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  const inputBaseClasses = "w-full bg-[var(--deep-gray-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--placeholder-text-color)] text-base rounded-[10px] focus:border-[var(--emerald-lime)] focus:ring-1 focus:ring-[var(--emerald-lime)]/50 block p-3.5 transition-all duration-300 ease-in-out input-neon-focus";
  const labelBaseClasses = "block text-xs font-semibold mb-1.5 text-[var(--text-secondary)]";


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? "Editar Transação" : "Adicionar Transação"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="transactionType" className={labelBaseClasses}>Tipo</label>
          <div className="flex rounded-[10px] shadow-sm overflow-hidden border border-[rgba(255,255,255,0.1)]">
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.INCOME); setCategory(''); }}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                          ${transactionType === TransactionType.INCOME ? 'text-black shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--deep-gray-2)]'}`}
              style={transactionType === TransactionType.INCOME ? { background: 'var(--emerald-lime)' } : { background: 'var(--deep-gray-1)'}}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => { setTransactionType(TransactionType.EXPENSE); setCategory(''); }}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                          ${transactionType === TransactionType.EXPENSE ? 'text-black shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--deep-gray-2)]'}`}
              style={transactionType === TransactionType.EXPENSE ? { background: 'var(--coral-red)' } : { background: 'var(--deep-gray-1)'}}
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
            style={{borderColor: 'rgba(255,255,255,0.1)'}}
          />
        </div>
        
        <div>
          <label htmlFor="amount" className={labelBaseClasses}>Valor ({settings.currencySymbol})</label>
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
            style={{borderColor: 'rgba(255,255,255,0.1)'}}
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
            className={`${inputBaseClasses} dark-date-picker`}
            style={{borderColor: 'rgba(255,255,255,0.1)'}}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <button 
            type="button" 
            onClick={onClose}
            className="py-2.5 px-5 border border-[rgba(255,255,255,0.2)] text-sm font-semibold rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--deep-gray-2)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--deep-gray-1)] focus:ring-[var(--amethyst-purple)] transition-all duration-300 ease-in-out"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="py-2.5 px-6 text-white text-sm font-semibold rounded-[10px] transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--deep-gray-1)] focus:ring-[var(--emerald-lime)] shadow-lg hover:shadow-xl button-gradient-hover"
            style={{ background: 'linear-gradient(90deg, var(--emerald-lime), var(--amethyst-purple))', backgroundSize: '200% auto' }}
          >
            {transactionToEdit ? 'Salvar Alterações' : 'Adicionar'}
          </button>
        </div>
      </form>
      <style>{`
        .dark-date-picker::-webkit-calendar-picker-indicator {
            filter: invert(1) brightness(0.7); /* Adjust brightness for visibility */
        }
      `}</style>
    </Modal>
  );
};

export default AddTransactionModal;