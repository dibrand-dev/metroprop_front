'use client';

import React, { useState } from 'react';
import './InputField2.scss';

interface InputField2Props {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
	onIconClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  multiline?: boolean;
  rows?: number;
}

export default function InputField2({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  error = '',
  label = placeholder,
  id,
  name,
  autoComplete,
  icon,
	onIconClick,
  iconPosition = 'right',
  multiline = false,
  rows = 4,
}: InputField2Props) {
  const [isFocused, setIsFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

  const hasValue = value && value.length > 0;
  const isActive = isFocused || hasValue;

  let stateClass = 'default';
  if (error) {
    stateClass = 'error';
  } else if (isFocused) {
    stateClass = 'focus';
  } else if (hasValue) {
    stateClass = 'filled';
  } else if (disabled) {
    stateClass = 'disabled';
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

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

	const isPasswordField = type === 'password' && !multiline;
  const inputType = isPasswordField && showPassword ? 'text' : type;

  // Default eye icon for password fields
  const displayIcon = icon || (isPasswordField && (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="black" strokeOpacity="0.5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="black" strokeOpacity="0.5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ));

  return (
    <div className={`input-field-2-wrapper state-${stateClass}`}>
      <div className={`input-field-2-container ${disabled ? 'disabled' : ''}`}>
        <label className={`input-field-2-label ${isActive || error ? 'is-active' : ''}`} htmlFor={id}>
          {label}
          {required && <span className="input-field-2-required">*</span>}
        </label>
        <div className="input-field-2-input-wrapper">
          {multiline ? (
            <textarea
              id={id}
              name={name}
              className="input-field-2-input"
              placeholder=""
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              required={required}
              rows={rows}
            />
          ) : (
            <input
              id={id}
              name={name}
              type={inputType}
              className="input-field-2-input"
              placeholder=""
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              required={required}
              autoComplete={autoComplete}
            />
          )}             
					{displayIcon && (
						<button
							type="button"
							className="input-field-2-icon input-field-2-icon-${iconPosition}"
							onClick={handleIconClick}
							aria-label={isPasswordField ? (showPassword ? 'Hide password' : 'Show password') : 'Toggle'}
							disabled={disabled}
							tabIndex={-1}
						>
							{displayIcon}
						</button>
					)}
        </div>
      </div>
      {error && <div className="input-field-2-error">{error}</div>}
    </div>
  );
}
