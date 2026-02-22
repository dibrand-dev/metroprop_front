'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Button from '@/ui/Button/Button';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import { API_BASE_URL } from '@/utils/utils';
import './ForgotPassword.scss';

const logoMetroprop = "/images/metropropLogo.png";

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFieldError('');

    if (!email) {
      setFieldError('Por favor ingresa tu correo electrónico');
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('Por favor ingresa un correo electrónico válido');
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/users/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || '¡Perfecto! Te enviamos un correo con las instrucciones para restablecer tu contraseña.');
        setEmail(''); // Limpiar el campo
      } else {
        setError(data.message || 'Error al enviar el correo de recuperación');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackButtonLogo />
      <div className="forgot-password-container">
        <div className="forgot-password-content">
          <img src={logoMetroprop} alt="Metroprop Logo" width="160" />
          
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <h1 className="forgot-password-title">¿Olvidaste tu contraseña?</h1>
            
            <p className="forgot-password-subtitle">
              Ingresá tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>

            <div className="forgot-password-field-group">
              <InputField2
                label="Correo electrónico*"
                type="email"
                placeholder="Correo electrónico*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                error={fieldError}
              />
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="forgot-password-success">
                <p>{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="forgot-password-error">
                <p>{error}</p>
              </div>
            )}

            <Button
              label={isLoading ? 'Enviando...' : 'Enviar'}
              type="submit"
              variant="primary"
              fullWidth={true}
              size="medium"
              disabled={isLoading}
              loading={isLoading}
            />

            <div className="forgot-password-back-to-login">
              <span>¿Recordaste tu contraseña?</span>
              <a href="/login" className="forgot-password-link">
                Volver al inicio de sesión
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}