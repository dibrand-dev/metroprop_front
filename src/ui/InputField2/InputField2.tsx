'use client';

import React, { useState } from 'react';
import './InputField2.scss';

interface InputField2Props {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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

	const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  // Default eye icon for password fields
  const displayIcon = icon || (isPasswordField && (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ));

  return (
    <div className={`input-field-2-wrapper state-${stateClass}`}>
      <div className="input-field-2-container">
        {(isActive || error) && (
          <label className="input-field-2-label">
            {label}
            {required && <span className="input-field-2-required">*</span>}
          </label>
        )}
        <div className="input-field-2-input-wrapper">
          <input
            id={id}
            name={name}
            type={inputType}
            className="input-field-2-input"
            placeholder={!isActive ? label : ''}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
          />             
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
