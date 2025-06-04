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
      className="fixed bottom-24 md:bottom-6 left-6 text-white p-4 rounded-full shadow-xl focus:outline-none focus:ring-4 focus:ring-[var(--electric-blue)]/50 transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 z-40 flex items-center space-x-2"
      style={{ 
        background: COLORS.gradientAiChatFab,
        animation: 'fabPulse 2.5s infinite ease-in-out' // Slightly different pulse
      }}
    >
      <RobotIcon className="w-7 h-7" />
    </button>
  );
};

export default AiChatFab;