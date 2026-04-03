'use client';

import { useState } from 'react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    // { value: 'relevant', label: 'Más relevantes' },
    { value: 'price:asc', label: 'Menor precio' },
    { value: 'price:desc', label: 'Mayor precio' },
    { value: 'created_at:desc', label: 'Más recientes' },
    { value: 'total_surface:desc', label: 'Mayor superficie' },
    { value: 'total_surface:asc', label: 'Menor superficie' },
  ];

  const currentOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  return (
    <div className="sort-dropdown h-full">
      <button 
        className="sort-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="/icons/sort.svg" alt="Sort Icon" />
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
