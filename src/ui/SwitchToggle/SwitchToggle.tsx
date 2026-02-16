'use client';

import './SwitchToggle.scss';

interface SwitchToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function SwitchToggle({
  checked,
  onChange,
  ariaLabel = 'Cambiar estado',
  disabled = false,
}: SwitchToggleProps) {
  return (
    <button
      type="button"
      className={`switch-toggle ${checked ? 'is-on' : 'is-off'}`}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange?.(!checked)}
      disabled={disabled}
    >
      <span className="switch-toggle-thumb" />
    </button>
  );
}
