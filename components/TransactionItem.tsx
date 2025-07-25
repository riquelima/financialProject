import React from 'react';
import { Transaction, TransactionType } from '../types.js';
import { useAppContext } from '../hooks/useAppContext.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { Trash2Icon, Edit3Icon, COLORS } from '../constants.js';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const { settings } = useAppContext();
  const isIncome = transaction.type === TransactionType.INCOME;

  return (
    <div 
        className={`p-4 rounded-lg shadow-md mb-3 transition-all duration-300 hover:shadow-lg`}
        style={{ backgroundColor: 'var(--tertiary-bg)'}}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)'}}>{transaction.description}</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)'}}>{transaction.category} - {formatDate(transaction.date)}</p>
        </div>
        <p className={`text-lg font-bold ${isIncome ? `text-${COLORS.incomeTailwind}` : `text-${COLORS.expenseTailwind}`}`}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, settings?.currencySymbol || 'R$')}
        </p>
      </div>
      <div className="mt-3 flex justify-end space-x-2">
        <button 
            onClick={onEdit} 
            className={`p-2 text-xs text-sky-400 hover:text-sky-300 bg-sky-700/30 hover:bg-sky-600/40 rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 ring-sky-500`}
            aria-label="Editar transação"
        >
            <Edit3Icon className="w-4 h-4" />
        </button>
        <button 
            onClick={onDelete} 
            className={`p-2 text-xs text-red-400 hover:text-red-300 bg-red-700/30 hover:bg-red-600/40 rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 ring-red-500`}
            aria-label="Excluir transação"
        >
            <Trash2Icon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;