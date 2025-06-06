import React from 'react';
import { COLORS } from '../constants';

interface SummaryCardProps {
  title: string;
  value?: string | number | null; 
  icon?: React.ReactNode;
  valueColor?: string; 
  borderColor?: string; // No longer used for side border, kept for potential conditional styling
  subValue?: string;
  useSolidBackground?: boolean; // New prop for cards like "Saldo em Conta"
  solidBgColor?: string; // e.g., var(--ref-blue-vibrant)
  solidTextColor?: string; // e.g., var(--ref-white)
  onClick?: () => void;
  isActionCard?: boolean; 
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon, 
  valueColor, 
  // borderColor, // Side border removed based on print2
  subValue, 
  useSolidBackground = false,
  solidBgColor = 'var(--ref-blue-vibrant)',
  solidTextColor = 'var(--ref-white)',
  onClick,
  isActionCard = false 
}) => {
  const cardBaseClasses = "p-4 shadow-lg transition-all duration-300 ease-in-out rounded-[20px]"; // Using 20px as per prompt
  
  const interactiveClasses = onClick ? `cursor-pointer hover:transform hover:scale-[1.03] hover:shadow-xl` : '';

  let currentCardBg = useSolidBackground || isActionCard ? solidBgColor : 'var(--card-bg)';
  let currentTitleColor = useSolidBackground || isActionCard ? solidTextColor : 'var(--text-secondary)';
  let currentValueColor = useSolidBackground || isActionCard ? solidTextColor : (valueColor || 'var(--text-primary)');
  let currentSubValueColor = useSolidBackground || isActionCard ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'; // Lighter subtext on solid bg
  let currentIconColor = useSolidBackground || isActionCard ? solidTextColor : (valueColor || 'var(--text-accent)');

   if (isActionCard) {
     currentTitleColor = solidTextColor; // Action card title should also be solidTextColor
     currentIconColor = solidTextColor;
   }


  const iconContainerStyle: React.CSSProperties = {
    color: currentIconColor,
    transition: 'transform 0.3s ease-in-out',
  };

  const cardOuterStyle: React.CSSProperties = {
    backgroundColor: currentCardBg,
    boxShadow: 'var(--ref-box-shadow)', // Standard shadow for all cards
    border: useSolidBackground || isActionCard ? 'none' : '1px solid var(--card-border)', // Only border for non-solid cards
  };
  if(isActionCard){
     cardOuterStyle.display = 'flex';
     cardOuterStyle.flexDirection = 'column';
     cardOuterStyle.justifyContent = 'center';
     cardOuterStyle.alignItems = 'center';
     cardOuterStyle.padding = '20px'; // More padding for action card
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
      {isActionCard ? (
        <div className={`flex flex-col items-center justify-center text-center`}>
          {icon && <div className="mb-2" style={iconContainerStyle}>{React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-7 h-7" })}</div>}
          <h3 className="text-lg font-semibold" style={{color: currentTitleColor }}> {/* Poppins Semibold */}
            {title}
          </h3>
        </div>
      ) : (
        <div>
          <div className={`flex items-center justify-between mb-1`}>
            <h3 className="text-xs font-medium uppercase tracking-wider" style={{color: currentTitleColor}}>{title}</h3> {/* Poppins Medium, smaller */}
            {icon && <div style={iconContainerStyle} className="group-hover:scale-110">{icon}</div>}
          </div>
          {(value || value === 0) && ( 
             <p 
              className="text-2xl font-bold animate-countUp" // Poppins Bold
              style={{ color: currentValueColor }}
            >
              {value}
            </p>
          )}
          {subValue && <p className="text-xs mt-1 font-normal" style={{color: currentSubValueColor}}>{subValue}</p>} {/* Poppins Normal */}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;