'use client';

import './RadioButton.scss';

interface RadioButtonProps {
  label: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  description?: string;
  additionalInfo?: string;
}

export default function RadioButton({
  label,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  description,
  additionalInfo,
}: RadioButtonProps) {
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={`radio-button ${disabled ? 'disabled' : ''}`}>
      <div className="radio-button-main">
        <input
          type="radio"
          id={`${name}-${value}`}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="radio-input"
        />
        <label htmlFor={`${name}-${value}`} className="radio-label">
          <span className="radio-custom"></span>
          <span className="radio-text">{label}</span>
        </label>
      </div>
      
      {(description || additionalInfo) && (
        <div className="radio-details">
          {description && <span className="radio-description">{description}</span>}
          {additionalInfo && <span className="radio-info">{additionalInfo}</span>}
        </div>
      )}
    </div>
  );
}
