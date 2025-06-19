import { Transaction } from '../types';
import { CATEGORY_LABELS } from '../types';
import { useAppContext } from '../hooks/useAppContext';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const { settings } = useAppContext();
  const currency = settings?.currencySymbol || 'R$';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formattedAmount = `${currency} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-dark-tertiary hover:bg-opacity-80 transition-all">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          transaction.type === 'income' 
            ? 'bg-neon-green bg-opacity-20' 
            : 'bg-neon-red bg-opacity-20'
        }`}>
          <i className={`${
            transaction.type === 'income' ? 'fas fa-plus text-neon-green' : 'fas fa-minus text-neon-red'
          } text-sm`}></i>
        </div>
        <div>
          <div className="font-medium">{transaction.description}</div>
          <div className="text-sm text-gray-400">
            {CATEGORY_LABELS[transaction.category] || transaction.category}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-semibold ${
          transaction.type === 'income' ? 'text-neon-green' : 'text-neon-red'
        }`}>
          {formatAmount(transaction.amount, transaction.type)}
        </div>
        <div className="text-sm text-gray-400">
          {formatDate(transaction.date)}
        </div>
      </div>
    </div>
  );
}
