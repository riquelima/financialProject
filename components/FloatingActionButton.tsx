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
      className="fixed bottom-24 md:bottom-6 right-6 text-[var(--ref-white)] p-4 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--ref-blue-vibrant)]/30 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 z-40 flex items-center space-x-2"
      style={{ 
        backgroundColor: 'var(--ref-blue-vibrant)',
        // animation: 'fabPulse 2s infinite ease-in-out' // Pulse might be distracting with new theme
        boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.4)' // Custom shadow for blue button
      }}
    >
      {icon || <PlusIcon className="w-7 h-7" />}
      {label && <span className="font-semibold text-sm">{label}</span>} {/* Poppins Semibold */}
    </button>
  );
};

export default FloatingActionButton;