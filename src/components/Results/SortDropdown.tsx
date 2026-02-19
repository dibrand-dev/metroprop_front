'use client';

import { useState } from 'react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'relevant', label: 'Más relevantes' },
    { value: 'price-asc', label: 'Menor precio' },
    { value: 'price-desc', label: 'Mayor precio' },
    { value: 'newest', label: 'Más recientes' },
    { value: 'area-desc', label: 'Mayor superficie' },
    { value: 'area-asc', label: 'Menor superficie' },
  ];

  const currentOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  return (
    <div className="sort-dropdown">
      <button 
        className="sort-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 6h14M6 10h8M9 14h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Ordenar</span>
      </button>

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
