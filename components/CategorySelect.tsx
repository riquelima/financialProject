import React from 'react';
import { ChevronDownIcon } from '../constants'; // Removed COLORS import as it's not directly used for bg/text here

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
        // Added themed-select class from index.html for consistent styling
        className={`w-full appearance-none themed-select text-sm rounded-lg focus:ring-[var(--emerald-lime)] focus:border-[var(--emerald-lime)] block p-3 pr-10 transition-colors duration-200 focus:outline-none input-neon-focus`}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <div className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--text-secondary)]`}>
        <ChevronDownIcon className="w-5 h-5" />
      </div>
    </div>
  );
};

export default CategorySelect;