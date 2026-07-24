'use client';

import { sortIcon } from '@/utils/icons';
import { useState } from 'react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'price:desc', label: 'Precio mayor a precio menor' },
    { value: 'price:asc', label: 'Precio menor a precio mayor' },
    // { value: 'created_at:desc', label: 'Más recientes' },
    { value: 'price_square_meter:asc', label: 'M² menor a M² mayor' },
    { value: 'price_square_meter:desc', label: 'M² mayor a M² menor' },
  ];

  const currentOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  return (
    <div className="sort-dropdown h-full">
      <div className="sort-button-container">
        <button 
          className={`sort-button ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {sortIcon}
          <span>Ordenar</span>
        </button>
      </div>
      {isOpen && (
        <>
          <div className="sort-overlay" onClick={() => setIsOpen(false)} />
          <div className="sort-menu">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`sort-option ${value === option.value ? 'active' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
