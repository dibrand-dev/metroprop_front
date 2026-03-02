'use client';

import { useState, useRef, useEffect } from 'react';
import './Select.scss';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
  name?: string;
}

export default function Select({
  label,
  options,
  value = '',
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  id,
  name,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayLabel = selectedOption?.label || placeholder;

  // Close select when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Update selected value when value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={`select-container ${error ? 'error' : ''}`}
      ref={selectRef}
    >
      {label && <label htmlFor={id}>{label}</label>}
      <button
        id={id}
        className={`select-trigger ${isOpen ? 'open' : ''} ${selectedValue ? 'selected' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
        aria-expanded={isOpen}
        aria-label={`${label} select`}
      >
        <span className={`select-display ${!selectedValue ? 'placeholder' : ''}`}>
          {displayLabel}
        </span>
        <img src="/icons/chevron-up.svg" alt="Toggle select options" />
      </button>

      {isOpen && (
        <div className="select-menu">
          {options.map((option) => (
            <button
              key={option.value}
              className={`select-item ${selectedValue === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={selectedValue === option.value}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="select-error">{error}</p>}
    </div>
  );
}
