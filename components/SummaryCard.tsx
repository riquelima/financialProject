import React from 'react';
import { COLORS } from '../constants.js';

interface SummaryCardProps {
  title: string;
  value?: string | number | null; 
  icon?: React.ReactNode;
  valueColor?: string; 
  borderColor?: string; 
  subValue?: string;
  gradientBg?: string; 
  onClick?: () => void;
  isActionCard?: boolean; 
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
  isActionCard = false 
}) => {
  // glassmorphism-card class handles background and base border via CSS variables
  const cardBaseClasses = "p-5 shadow-lg transition-all duration-300 ease-in-out glassmorphism-card";
  
  const interactiveClasses = onClick ? `cursor-pointer ${!isActionCard ? 'hover:transform hover:-translate-y-1' : ''} hover:shadow-2xl` : '';

  // Determine text colors based on whether a gradient background is used (which implies light text)
  // or fall back to theme variables.
  let titleTextColor = gradientBg ? 'rgba(var(--primary-bg-rgb, 0,0,0),0.8)' : 'var(--text-secondary)';
  let subValueTextColor = gradientBg ? 'rgba(var(--primary-bg-rgb, 0,0,0),0.7)' : 'var(--text-secondary)';
  let valuePrimaryColor = gradientBg ? 'var(--primary-bg)' : 'var(--text-primary)';

  const iconContainerStyle: React.CSSProperties = {
    color: valueColor || 'var(--emerald-lime)', // Default icon color if not specified
    filter: `drop-shadow(0 0 5px ${valueColor || 'var(--emerald-lime)'}77)`,
    transition: 'transform 0.3s ease-in-out',
  };

  const actionCardTitleColor = valueColor || (gradientBg ? 'var(--primary-bg)' : 'var(--text-accent)');

  const cardOuterStyle: React.CSSProperties = {};
  if (gradientBg) {
    cardOuterStyle.background = gradientBg;
  }
  if(isActionCard){
     cardOuterStyle.display = 'flex';
     cardOuterStyle.flexDirection = 'column';
     cardOuterStyle.justifyContent = 'center';
     cardOuterStyle.alignItems = 'center';
  }


  return (
    <div 
      style={cardOuterStyle}
      className={`${cardBaseClasses} ${interactiveClasses}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {borderColor && !isActionCard && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5" 
          style={{ backgroundColor: borderColor, borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px' }}
        ></div>
      )}
       {borderColor && isActionCard && ( 
        <div 
          className="absolute inset-0 border-2 pointer-events-none rounded-[14px]" 
          style={{ borderColor: borderColor, opacity: 0.7 }}
        ></div>
      )}
      
      {isActionCard ? (
        <div className={`flex flex-col items-center justify-center text-center`}>
          {icon && <div className="mb-2" style={iconContainerStyle}>{icon}</div>}
          <h3 className="text-xl font-semibold" style={{color: actionCardTitleColor }}>
            {title}
          </h3>
        </div>
      ) : (
        <div className={borderColor ? 'ml-3' : ''}>
          <div className={`flex items-center justify-between mb-1`}>
            <h3 className="text-sm font-medium uppercase tracking-wider" style={{color: titleTextColor}}>{title}</h3>
            {icon && <div style={iconContainerStyle} className="group-hover:scale-110">{icon}</div>}
          </div>
          {(value || value === 0) && ( 
             <p 
              className="text-3xl font-bold animate-countUp" 
              style={{ 
                color: valueColor || valuePrimaryColor, 
                // WebkitTextStroke: `0.5px ${valueColor ? 'transparent' : 'rgba(var(--text-primary-rgb, 224,224,224),0.1)'}`
              }}
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