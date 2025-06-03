import React from 'react';
import { COLORS } from '../constants';

interface SummaryCardProps {
  title: string;
  value?: string | number | null; // Made value optional
  icon?: React.ReactNode;
  valueColor?: string; 
  borderColor?: string; 
  subValue?: string;
  gradientBg?: string; 
  onClick?: () => void;
  isActionCard?: boolean; // New prop
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon, 
  valueColor, 
  borderColor, 
  subValue, 
  gradientBg, 
  onClick,
  isActionCard = false // Default to false
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(30, 30, 30, 0.6)', 
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', 
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative', 
    overflow: 'hidden',
    display: 'flex', // Added for isActionCard centering
    flexDirection: 'column', // Added for isActionCard centering
    justifyContent: isActionCard ? 'center' : 'flex-start', // Center content for action card
    alignItems: isActionCard ? 'center' : 'stretch', // Center content for action card
  };

  let titleTextColor = 'var(--text-secondary)';
  let subValueTextColor = 'var(--text-secondary)';

  if (gradientBg) {
    cardStyle.background = gradientBg;
    titleTextColor = 'var(--deep-gray-1)'; 
    subValueTextColor = 'var(--deep-gray-2)';
  }
  
  const iconContainerStyle: React.CSSProperties = {
    color: valueColor || 'var(--emerald-lime)',
    filter: `drop-shadow(0 0 5px ${valueColor || 'var(--emerald-lime)'}77)`,
    transition: 'transform 0.3s ease-in-out',
  };

  // For action card, title uses valueColor if provided, else default titleTextColor
  const actionCardTitleColor = valueColor || titleTextColor;

  return (
    <div 
      style={cardStyle} 
      className={`p-5 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl ${!isActionCard ? 'hover:transform hover:-translate-y-1' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {borderColor && !isActionCard && ( // Border only for non-action cards, or style differently
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5" 
          style={{ backgroundColor: borderColor, borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px' }}
        ></div>
      )}
       {borderColor && isActionCard && ( // Full border for action cards perhaps, or different style
        <div 
          className="absolute inset-0 border-2 pointer-events-none rounded-[14px]" 
          style={{ borderColor: borderColor, opacity: 0.7 }}
        ></div>
      )}
      
      {isActionCard ? (
        <div className={`flex flex-col items-center justify-center text-center ${borderColor ? '' : ''}`}>
          {icon && <div className="mb-2" style={iconContainerStyle}>{icon}</div>}
          <h3 className="text-xl font-semibold" style={{color: actionCardTitleColor }}>
            {title}
          </h3>
        </div>
      ) : (
        <div className={borderColor ? 'ml-3' : ''}> {/* Apply margin only if border is present */}
          <div className={`flex items-center justify-between mb-1`}>
            <h3 className="text-sm font-medium uppercase tracking-wider" style={{color: titleTextColor}}>{title}</h3>
            {icon && <div style={iconContainerStyle} className="group-hover:scale-110">{icon}</div>}
          </div>
          {(value || value === 0) && ( 
             <p 
              className="text-3xl font-bold animate-countUp" 
              style={{ color: valueColor || (gradientBg ? 'var(--deep-gray-1)' : 'var(--text-primary)'), WebkitTextStroke: `0.5px ${valueColor ? 'transparent' : 'rgba(255,255,255,0.1)'}`}}
            >
              {value}
            </p>
          )}
          {subValue && <p className="text-xs mt-1" style={{color: subValueTextColor}}>{subValue}</p>}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;