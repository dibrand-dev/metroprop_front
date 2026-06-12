'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import InputField2 from '@/ui/InputField2/InputField2';
import Button from '@/ui/Button/Button';
import { API_BASE_URL } from '@/utils/utils';
import './ForgotPassword.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import EmailVerificationModal from '@/components/EmailVerificationModal/EmailVerificationModal';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');  
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const router = useRouter();

  const requestPasswordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiFetch(`${API_BASE_URL}/users/request-password-reset`, {
        method: 'POST',
        body: { email },
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (!email) {
      setFieldError('Por favor ingresa tu correo electrónico');
      // setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError('Por favor ingresa un correo electrónico válido');
      // setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await requestPasswordResetMutation.mutateAsync(email);
      if (data && data.success) {
        setShowEmailVerificationModal(true);
        setEmail('');
      } else {
        setError(data.message || 'Error al enviar el correo de recuperación');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recuperar-contraseña-container">
      <div className="recuperar-contraseña-content">
        <BackButtonLogo />
        <form className="recuperar-contraseña-form" onSubmit={handleSubmit}>
          {/* Title */}
          <h1 className="recuperar-contraseña-title">¿Olvidaste tu contraseña?</h1>
          <p className="forgot-password-subtitle">
            Ingresá tu correo electrónico
          </p>
          <InputField2
            label="Correo electrónico*"
            type="text"
            placeholder="Correo electrónico*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
            error={fieldError}
          />

          {/* Error Message */}
          {error && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              color: '#991b1b',
              fontSize: '14px',
            }}
          >
            <p>{error}</p>
          </div>)}

          <Button
            label={isLoading ? 'Enviando...' : 'Enviar'}
            type="submit"
            variant="primary"
            fullWidth={true}
            size="medium"
            disabled={isLoading}
            loading={isLoading}
          />
        </form>
      </div>
      {showEmailVerificationModal && <EmailVerificationModal title="¡Te enviamos un e-mail para restablecer tu contraseña!" text={`Ingresá a tu casilla de mail ${email} para continuar.`} onClose={() => router.push('/login')} />}
    </div>
  );
}