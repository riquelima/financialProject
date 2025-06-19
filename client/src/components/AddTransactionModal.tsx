import { useState } from 'react';
import { Modal } from './ui/modal';
import { useAppContext } from '../hooks/useAppContext';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CATEGORY_LABELS } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { addTransaction, currentMonth } = useAppContext();
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    periodType: 'mid-month' as 'mid-month' | 'end-of-month'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      return;
    }

    try {
      await addTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        type: transactionType,
        periodType: formData.periodType
      });
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        periodType: 'mid-month'
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neon-cyan">Nova Transação</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times text-gray-400"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <button 
              type="button"
              onClick={() => setTransactionType('income')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                transactionType === 'income' 
                  ? 'bg-neon-green bg-opacity-20 text-neon-green' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              <i className="fas fa-plus mr-2"></i>Receita
            </button>
            <button 
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                transactionType === 'expense' 
                  ? 'bg-neon-red bg-opacity-20 text-neon-red' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              <i className="fas fa-minus mr-2"></i>Despesa
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              placeholder="Digite a descrição..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor</label>
            <input 
              type="number" 
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full p-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              placeholder="0,00" 
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 rounded-lg glass-effect text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-3 rounded-lg glass-effect text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 px-4 rounded-lg btn-neon text-white font-medium"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
