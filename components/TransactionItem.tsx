import React from 'react';
import { Transaction, TransactionType } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Trash2Icon, Edit3Icon, COLORS } from '../constants';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const { settings } = useAppContext();
  const isIncome = transaction.type === TransactionType.INCOME;

  return (
    <div className={`p-4 bg-${COLORS.cardBackgroundLighter} rounded-lg shadow-md mb-3 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">{transaction.description}</h3>
          <p className="text-xs text-gray-400">{transaction.category} - {formatDate(transaction.date)}</p>
        </div>
        <p className={`text-lg font-bold ${isIncome ? `text-${COLORS.income}` : `text-${COLORS.expense}`}`}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, settings.currencySymbol)}
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
