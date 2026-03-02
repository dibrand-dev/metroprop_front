'use client';

import { useState, ReactNode } from 'react';
import './InputField.scss';

interface InputFieldProps {
  label?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: ReactNode;
  onIconClick?: () => void;
  required?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  error?: string;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  multiline?: boolean;
  rows?: number;
  cols?: number;
  maxLength?: number;
}

export default function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  onIconClick,
  required = false,
  name,
  id,
  disabled = false,
  error,
  autoComplete,
  min,
  max,
  step,
  multiline = false,
  rows,
  cols,
  maxLength,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleIconClick = () => {
    if (isPasswordField) {
      togglePasswordVisibility();
    } else if (onIconClick) {
      onIconClick();
    }
  };

  const inputType = isPasswordField && showPassword ? 'text' : type;

  // Default eye icon for password fields
  const displayIcon = icon || (isPasswordField && (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ));

  return (
    <div className="input-field-container">
      {label && <div className="input-field-label-wrapper">
        <label htmlFor={id} className="input-field-label">
          {label}
        </label>
      </div>}
      <div className={`input-field-wrapper ${error ? 'error' : ''} ${multiline ? 'multiline' : ''}`}>
        {multiline ? (
          <textarea
            id={id}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="input-field-element"
            rows={rows}
            cols={cols}
            maxLength={maxLength}
          />
        ) : (
          <input
            id={id}
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="input-field-element"
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            maxLength={maxLength}
          />
        )}
        
      </div>
      {displayIcon && (
          <button
            type="button"
            className="input-field-icon-button"
            onClick={handleIconClick}
            aria-label={isPasswordField ? (showPassword ? 'Hide password' : 'Show password') : 'Toggle'}
            disabled={disabled}
            tabIndex={-1}
          >
            {displayIcon}
          </button>
        )}
      {error && <p className="input-field-error">{error}</p>}
    </div>
  );
}
