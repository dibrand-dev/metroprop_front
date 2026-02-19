'use client';

import './Chip.scss';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Chip({
  label,
  selected = false,
  onClick,
  disabled = false,
}: ChipProps) {
  return (
    <button
      type="button"
      className={`chip ${selected ? 'chip-selected' : ''} ${disabled ? 'chip-disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
