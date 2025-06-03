import React from 'react';
import { COLORS } from '../constants';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  valueColor?: string; // e.g., 'var(--emerald-lime)'
  borderColor?: string; // e.g., 'var(--emerald-lime)' for side border
  subValue?: string;
  gradientBg?: string; // e.g. COLORS.gradientPrimary
  onClick?: () => void; // Make card clickable
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, valueColor, borderColor, subValue, gradientBg, onClick }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(30, 30, 30, 0.6)', // --deep-gray-2 with opacity
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', // For Safari
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative', // For pseudo-element border
    overflow: 'hidden', // Ensure pseudo-element respects border-radius
  };

  let titleTextColor = 'var(--text-secondary)';
  let subValueTextColor = 'var(--text-secondary)';

  if (gradientBg) {
    cardStyle.background = gradientBg;
    // Default dark text colors for gradient backgrounds for better contrast
    titleTextColor = 'var(--deep-gray-1)'; 
    subValueTextColor = 'var(--deep-gray-2)';
  }
  
  const iconContainerStyle: React.CSSProperties = {
    color: valueColor || 'var(--emerald-lime)',
    filter: `drop-shadow(0 0 5px ${valueColor || 'var(--emerald-lime)'}77)`, // Subtle glow for icon
    transition: 'transform 0.3s ease-in-out',
  };


  return (
    <div 
      style={cardStyle} 
      className={`p-5 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {borderColor && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5" 
          style={{ backgroundColor: borderColor, borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px' }}
        ></div>
      )}
      <div className={`flex items-center justify-between mb-1 ${borderColor ? 'ml-3' : ''}`}>
        <h3 className="text-sm font-medium uppercase tracking-wider" style={{color: titleTextColor}}>{title}</h3>
        {icon && <div style={iconContainerStyle} className="group-hover:scale-110">{icon}</div>}
      </div>
      <p 
        className="text-3xl font-bold animate-countUp" 
        style={{ color: valueColor || (gradientBg ? 'var(--deep-gray-1)' : 'var(--text-primary)'), WebkitTextStroke: `0.5px ${valueColor ? 'transparent' : 'rgba(255,255,255,0.1)'}`}}
      >
        {value}
      </p>
      {subValue && <p className="text-xs mt-1" style={{color: subValueTextColor}}>{subValue}</p>}
    </div>
  );
};

export default SummaryCard;