import React from 'react';
import { ChevronDownIcon, COLORS } from '../constants';

interface CategorySelectProps {
  categories: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ categories, selectedValue, onChange, placeholder, id, disabled }) => {
  return (
    <div className="relative w-full">
      <select
        id={id}
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none bg-${COLORS.cardBackgroundLighter} border border-slate-600 text-${COLORS.textPrimary} placeholder-${COLORS.textSecondary} text-sm rounded-lg focus:ring-${COLORS.primary} focus:border-${COLORS.primary} block p-3 pr-10 transition-colors duration-200 focus:outline-none focus:shadow-outline-blue`}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <div className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-${COLORS.textSecondary}`}>
        <ChevronDownIcon className="w-5 h-5" />
      </div>
    </div>
  );
};

export default CategorySelect;
