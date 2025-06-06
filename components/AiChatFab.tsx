import React from 'react';
import { RobotIcon, COLORS } from '../constants';

interface AiChatFabProps {
  onClick: () => void;
}

const AiChatFab: React.FC<AiChatFabProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Abrir assistente financeiro AI"
      className="fixed bottom-24 md:bottom-6 left-6 text-[var(--ref-white)] p-4 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--ref-blue-vibrant)]/30 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 z-40 flex items-center space-x-2"
      style={{ 
        backgroundColor: 'var(--ref-blue-vibrant)', 
        // animation: 'fabPulse 2.5s infinite ease-in-out' // Pulse might be distracting
        boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.4)'
      }}
    >
      <RobotIcon className="w-7 h-7" />
    </button>
  );
};

export default AiChatFab;