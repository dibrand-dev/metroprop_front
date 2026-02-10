'use client';

import { useState } from 'react';
import InputField from '@/ui/InputField/InputField';
import Button from '@/ui/Button/Button';
import './ResetPassword.scss';

const logoMetroprop = "/images/metropropLogo.png";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ newPassword: '', confirmPassword: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ newPassword: '', confirmPassword: '' });

    if (!newPassword || !confirmPassword) {
      setFieldErrors({
        newPassword: !newPassword ? 'Por favor ingresa tu contraseña nueva' : '',
        confirmPassword: !confirmPassword ? 'Por favor confirma tu contraseña' : '',
      });
      setError('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 10) {
      setFieldErrors((prev) => ({ ...prev, newPassword: 'La contraseña debe tener entre 6 y 10 caracteres' }));
      setError('La contraseña debe tener entre 6 y 10 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors({ newPassword: 'Las contraseñas no coinciden', confirmPassword: 'Las contraseñas no coinciden' });
      setError('Las contraseñas no coinciden');
      return;
    }

    console.log('Password reset:', { newPassword });
    // Here you would make an API call
  };

  return (
    <div className="recuperar-contraseña-container">
      <div className="recuperar-contraseña-content">
        <img src={logoMetroprop} alt="Metroprop Logo" width="160" />
        <form className="recuperar-contraseña-form" onSubmit={handleSubmit}>
          {/* Title */}
          <h1 className="recuperar-contraseña-title">Reestablecer contraseña</h1>

          {/* New Password Field */}
          <div className="recuperar-contraseña-field-group">
            <InputField
              label="Contraseña nueva"
              type="password"
              placeholder="Contraseña nueva"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              error={fieldErrors.newPassword}
            />
            <p className="recuperar-contraseña-hint">Usa de 6 a 10 caracteres</p>
          </div>

          {/* Confirm Password Field */}
          <div className="recuperar-contraseña-field-group">
            <InputField
              label="Repetir contraseña"
              type="password"
              placeholder="Repetir contraseña nueva"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              error={fieldErrors.confirmPassword}
            />
          </div>

          {/* Error Message */}
          {error && <p className="recuperar-contraseña-error">{error}</p>}

          {/* Submit Button */}
          <Button
            label="Guardar cambios"
            type="submit"
            variant="primary"
            fullWidth={true}
            size="medium"
          />
        </form>
      </div>
    </div>
  );
}
