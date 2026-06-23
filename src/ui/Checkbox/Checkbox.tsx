'use client';

import { useState, useEffect, ReactNode } from 'react';
import './Checkbox.scss';

const checkIcon = "https://www.figma.com/api/mcp/asset/e40a38dd-43d8-40d0-b9c9-610150a3f23f";

interface CheckboxProps {
  label: ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  linkText?: string;
  onLinkClick?: () => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  error?: string;
}

export default function Checkbox({
  label,
  checked = false,
  onChange,
  linkText,
  onLinkClick,
  disabled = false,
  id,
  name,
  required = false,
  error,
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  // Update checked state when prop changes
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (<>
    <div className={`checkbox-container ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`}>
      <button
        type="button"
        className={`checkbox-wrapper ${isChecked ? 'checked' : ''}`}
        onClick={handleChange}
        disabled={disabled}
        aria-label={typeof label === 'string' ? `${label} checkbox` : 'checkbox'}
        aria-checked={isChecked}
        role="checkbox"
      >
        <div className={`checkbox-box ${isChecked ? 'checked' : ''}`}>
          {isChecked && (
            <svg
              className="checkbox-icon"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <span className="checkbox-label">{label}</span>
      </button>

      {linkText && (
        <button
          type="button"
          className="checkbox-link"
          onClick={onLinkClick}
          disabled={disabled}
        >
          {linkText}
        </button>
      )}

      <input
        type="checkbox"
        id={id}
        name={name}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
     
    </div>
    {error && <p className="checkbox-error">{error}</p>}
    </>
  );
}
