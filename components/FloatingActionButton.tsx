import React from 'react';
import { PlusIcon } from '../constants';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  ariaLabel: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, icon, label, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-24 md:bottom-6 right-6 text-white p-4 rounded-full shadow-xl focus:outline-none focus:ring-4 focus:ring-[var(--amethyst-purple)]/50 transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 z-40 flex items-center space-x-2"
      style={{ 
        background: 'linear-gradient(135deg, var(--emerald-lime), var(--amethyst-purple))',
        animation: 'fabPulse 2s infinite ease-in-out'
      }}
    >
      {icon || <PlusIcon className="w-7 h-7" />}
      {label && <span className="font-semibold text-sm">{label}</span>}
    </button>
  );
};

export default FloatingActionButton;