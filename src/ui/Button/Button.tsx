'use client';

import { ReactNode } from 'react';
import './Button.scss';

type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'text'
  | 'back';

type ButtonState = 
  | 'default'
  | 'hover'
  | 'active'
  | 'disabled'
  | 'selected'
  | 'click';

type ButtonType = 
  | '1'
  | '2';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  state?: ButtonState;
  buttonType?: ButtonType;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  id?: string;
  name?: string;
  className?: string;
  ariaLabel?: string;
}

export default function Button({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  state = 'default',
  buttonType = '1',
  size = 'medium',
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  id,
  name,
  className,
  ariaLabel,
}: ButtonProps) {
  // Map state and disabled to actual state
  const actualState = disabled ? 'disabled' : state;

  const buttonClasses = `
    btn
    btn-${variant}
    btn-type-${buttonType}
    btn-${size}
    btn-state-${actualState}
    ${fullWidth ? 'btn-full-width' : ''}
    ${disabled || loading ? 'btn-disabled' : ''}
    ${className || ''}
  `;

  // Determine if button should be interactive based on variant and state
  const isInteractive = !disabled && !loading && variant !== 'text';

  return (
    <button
      id={id}
      name={name}
      type={type}
      className={buttonClasses.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || label}
      aria-busy={loading}
    >
      {loading && (
        <span className="btn-loader">
          <svg
            className="btn-spinner"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      <span className="btn-label">{label}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </button>
  );
}
