import React from 'react';
import Modal from './Modal';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { COLORS, Edit3Icon, Trash2Icon } from '../constants';

interface TransactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transactions: Transaction[];
  currencySymbol: string; 
  transactionTypeForColor?: TransactionType;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

const TransactionListModal: React.FC<TransactionListModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  transactions, 
  currencySymbol,
  transactionTypeForColor,
  onEdit,
  onDelete
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {transactions.length === 0 ? (
        <p className="text-center py-8" style={{color: 'var(--text-secondary)'}}>Nenhuma transação encontrada.</p>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {transactions.map(transaction => (
            <div key={transaction.id} className="p-3 rounded-lg shadow" style={{backgroundColor: 'var(--tertiary-bg)'}}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium" style={{color: 'var(--text-primary)'}}>{transaction.description}</p>
                  <p className="text-xs" style={{color: 'var(--text-secondary)'}}>{transaction.category} - {formatDate(transaction.date)}</p>
                </div>
                <p className={`font-semibold ${transaction.type === TransactionType.INCOME ? `text-${COLORS.incomeTailwind}` : `text-${COLORS.expenseTailwind}`}`}>
                  {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(transaction.amount, currencySymbol)}
                </p>
              </div>
              {(onEdit || onDelete) && (
                <div className="mt-2.5 flex justify-end space-x-2.5">
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(transaction)} 
                      className="p-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-700/30 hover:bg-sky-600/40 rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 ring-sky-500"
                      aria-label="Editar transação"
                    >
                      <Edit3Icon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(transaction)} 
                      className="p-1.5 text-xs text-red-400 hover:text-red-300 bg-red-700/30 hover:bg-red-600/40 rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 ring-red-500"
                      aria-label="Excluir transação"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className={`py-2 px-5 bg-gradient-to-r from-${COLORS.petroleumBlue} to-${COLORS.deepPurple} text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--secondary-bg)] focus:ring-[var(--emerald-lime)] transition-opacity shadow-md hover:shadow-lg`}
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default TransactionListModal;