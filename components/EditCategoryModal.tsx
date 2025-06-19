
import React, { useState, useEffect } from 'react';
import Modal from './Modal.js';
import { UserCategory, TransactionType } from '../types.js';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: UserCategory | null;
  onSave: (categoryId: string, newName: string, newType: TransactionType) => Promise<void>;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, onClose, categoryToEdit, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  useEffect(() => {
    if (categoryToEdit && isOpen) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit || !name.trim()) {
      alert('Nome da categoria não pode ser vazio.');
      return;
    }
    try {
      await onSave(categoryToEdit.id, name.trim(), type);
      onClose();
    } catch (error) {
      // Error is usually handled by context, but an alert can be added here if needed
      // console.error("Error saving category:", error);
      // alert(`Failed to save category: ${error.message}`);
    }
  };

  const inputBaseClasses = "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-sm rounded-lg focus:ring-[var(--emerald-lime)] focus:border-[var(--emerald-lime)] block p-3 transition-colors duration-200 focus:outline-none input-neon-focus";
  const labelBaseClasses = "block text-sm font-medium text-[var(--text-secondary)] mb-1";

  if (!categoryToEdit) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Categoria">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="editCategoryName" className={labelBaseClasses}>Nome da Categoria</label>
          <input
            type="text"
            id="editCategoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputBaseClasses}
            required
          />
        </div>
        <div>
          <label className={labelBaseClasses}>Tipo da Categoria</label>
          <div className="flex rounded-[10px] shadow-sm overflow-hidden border border-[var(--card-border-light)]">
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                          ${type === TransactionType.INCOME ? 'text-[var(--primary-bg)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
              style={type === TransactionType.INCOME ? { background: 'var(--emerald-lime)' } : { background: 'var(--secondary-bg)'}}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none 
                          ${type === TransactionType.EXPENSE ? 'text-[var(--primary-bg)] shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--tertiary-bg)]'}`}
              style={type === TransactionType.EXPENSE ? { background: 'var(--coral-red)' } : { background: 'var(--secondary-bg)'}}
            >
              Despesa
            </button>
          </div>
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
            Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCategoryModal;
