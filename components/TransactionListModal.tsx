import React from 'react';
import Modal from './Modal';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { COLORS } from '../constants';

interface TransactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transactions: Transaction[];
  currencySymbol: string; 
  transactionTypeForColor?: TransactionType; 
}

const TransactionListModal: React.FC<TransactionListModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  transactions, 
  currencySymbol,
  transactionTypeForColor
}) => {
  if (!isOpen) return null;

  const amountColorClass = transactionTypeForColor === TransactionType.INCOME 
    ? `text-${COLORS.incomeTailwind}` 
    : transactionTypeForColor === TransactionType.EXPENSE 
    ? `text-${COLORS.expenseTailwind}`
    : 'text-[var(--text-primary)]'; // Fallback if no type is specified

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {transactions.length === 0 ? (
        <p className="text-center py-8" style={{color: 'var(--text-secondary)'}}>Nenhuma transação encontrada.</p>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {transactions.map(transaction => (
            <div key={transaction.id} className="p-3 rounded-lg shadow" style={{backgroundColor: 'var(--tertiary-bg)'}}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium" style={{color: 'var(--text-primary)'}}>{transaction.description}</p>
                  <p className="text-xs" style={{color: 'var(--text-secondary)'}}>{transaction.category} - {formatDate(transaction.date)}</p>
                </div>
                <p className={`font-semibold ${transaction.type === TransactionType.INCOME ? `text-${COLORS.incomeTailwind}` : `text-${COLORS.expenseTailwind}`}`}>
                  {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(transaction.amount, currencySymbol)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className={`py-2 px-5 bg-gradient-to-r from-[${COLORS.petroleumBlue}] to-[${COLORS.deepPurple}] text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--secondary-bg)] focus:ring-[var(--emerald-lime)] transition-opacity shadow-md hover:shadow-lg`}
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default TransactionListModal;