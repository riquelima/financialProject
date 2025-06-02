import React from 'react';
import { PlusIcon, COLORS } from '../constants';

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
      className={`fixed bottom-20 right-5 bg-gradient-to-br from-${COLORS.petroleumBlue} via-${COLORS.deepPurple} to-${COLORS.discreetNeonGreen} text-white p-4 rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-${COLORS.primary}/50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 z-40 flex items-center space-x-2`}
    >
      {icon || <PlusIcon className="w-7 h-7" />}
      {label && <span className="font-medium">{label}</span>}
    </button>
  );
};

export default FloatingActionButton;
