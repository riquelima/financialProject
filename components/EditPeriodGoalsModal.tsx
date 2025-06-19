
import React, { useState, useEffect } from 'react';
import Modal from './Modal.js';
import { PeriodType } from '../types.js';
import { useAppContext } from '../hooks/useAppContext.js'; // For currencySymbol

interface EditPeriodGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodType: PeriodType;
  currentSpendingGoal: number;
  currentSavingsGoal: number;
  onSave: (goals: { spendingGoal: number; savingsGoal: number }) => void;
  currencySymbol: string;
}

const EditPeriodGoalsModal: React.FC<EditPeriodGoalsModalProps> = ({
  isOpen,
  onClose,
  periodType,
  currentSpendingGoal,
  currentSavingsGoal,
  onSave,
  currencySymbol,
}) => {
  const [spendingGoal, setSpendingGoal] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSpendingGoal(String(currentSpendingGoal || 0));
      setSavingsGoal(String(currentSavingsGoal || 0));
    }
  }, [isOpen, currentSpendingGoal, currentSavingsGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numSpendingGoal = parseFloat(spendingGoal);
    const numSavingsGoal = parseFloat(savingsGoal);

    if (isNaN(numSpendingGoal) || numSpendingGoal < 0 || isNaN(numSavingsGoal) || numSavingsGoal < 0) {
      alert('Por favor, insira valores válidos para as metas.');
      return;
    }
    onSave({ spendingGoal: numSpendingGoal, savingsGoal: numSavingsGoal });
    onClose();
  };
  
  const inputBaseClasses = "w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--placeholder-text)] text-base rounded-[10px] focus:border-[var(--input-focus-border)] focus:ring-1 focus:ring-[var(--input-focus-border)]/50 block p-3.5 transition-all duration-300 ease-in-out input-neon-focus";
  const labelBaseClasses = "block text-xs font-semibold mb-1.5 text-[var(--text-secondary)]";

  const periodName = periodType === PeriodType.MID_MONTH ? "1ª Quinzena" : "2ª Quinzena";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Metas - ${periodName}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="spendingGoal" className={labelBaseClasses}>
            Meta de Gastos ({currencySymbol})
          </label>
          <input
            type="number"
            id="spendingGoal"
            value={spendingGoal}
            onChange={(e) => setSpendingGoal(e.target.value)}
            min="0"
            step="0.01"
            className={inputBaseClasses}
            placeholder="0,00"
            required
          />
        </div>

        <div>
          <label htmlFor="savingsGoal" className={labelBaseClasses}>
            Meta de Economia ({currencySymbol})
          </label>
          <input
            type="number"
            id="savingsGoal"
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(e.target.value)}
            min="0"
            step="0.01"
            className={inputBaseClasses}
            placeholder="0,00"
            required
          />
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
            Salvar Metas
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPeriodGoalsModal;
