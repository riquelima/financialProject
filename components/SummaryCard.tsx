import React from 'react';
import { COLORS } from '../constants';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string; // e.g., 'text-emerald-500'
  gradient?: boolean;
  subValue?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, colorClass, gradient = false, subValue }) => {
  const baseBg = gradient ? `bg-gradient-to-br ${COLORS.gradientFrom} ${COLORS.gradientTo}` : `bg-${COLORS.cardBackgroundLighter}`;
  
  return (
    <div className={`${baseBg} p-5 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className={`text-sm font-medium text-${COLORS.textSecondary} uppercase tracking-wider`}>{title}</h3>
        {icon && <span className={`text-${colorClass || COLORS.textAccent}`}>{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${colorClass || `text-${COLORS.textPrimary}`}`}>{value}</p>
      {subValue && <p className={`text-xs mt-1 ${COLORS.textSecondary}`}>{subValue}</p>}
    </div>
  );
};

export default SummaryCard;
