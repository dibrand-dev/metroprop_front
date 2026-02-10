'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import './UserSignup.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import EmailVerificationModal from '../EmailVerificationModal/EmailVerificationModal';

const iconGoogle = "/icons/google.svg";

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function UserSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirmPassword: '', agreeTerms: '', agreePrivacy: '' });
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFieldErrors({ email: '', password: '', confirmPassword: '', agreeTerms: '', agreePrivacy: '' });

    if (!email || !password || !confirmPassword) {
      setFieldErrors({
        email: !email ? 'Por favor ingresa tu correo electrónico' : '',
        password: !password ? 'Por favor ingresa tu contraseña' : '',
        confirmPassword: !confirmPassword ? 'Por favor confirma tu contraseña' : '',
        agreeTerms: !agreeTerms ? 'Debes aceptar los términos y condiciones' : '',
        agreePrivacy: !agreePrivacy ? 'Debes aceptar los términos y condiciones' : ''
      });
      setError('Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Por favor ingresa un correo electrónico válido', password: '', confirmPassword: '', agreeTerms: '', agreePrivacy: '' });
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 6 || password.length > 10) {
      setFieldErrors({ email: '', password: 'La contraseña debe tener entre 6 y 10 caracteres', confirmPassword: '', agreeTerms: '', agreePrivacy: '' });
      setError('La contraseña debe tener entre 6 y 10 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ email: '', password: 'Las contraseñas no coinciden', confirmPassword: 'Las contraseñas no coinciden', agreeTerms: '', agreePrivacy: '' });
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setFieldErrors((prev) => ({
        ...prev,
        agreeTerms: !agreeTerms ? 'Debes aceptar los términos y condiciones' : '',
        agreePrivacy: !agreePrivacy ? 'Debes aceptar la política de privacidad' : '',
      }));
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('http://localhost:3000/registration/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Error en el registro';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
          setError(errorMessage);
          return;
        }
        
        
        /*        
        const data = await response.json();
        setSuccessMessage('¡Registro exitoso! Redirigiendo al login...');
        console.log('Registration successful:', data);

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        */

        
        setShowEmailVerificationModal(true);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
        setError(errorMessage);
      }
    });
  };

  const handleGoogleSignUp = () => {
    startTransition(async () => {
      try {
        setError('');
        const result = await signIn('google', {
          redirect: false,
          callbackUrl: '/',
        });

        if (result?.error) {
          setError('Error al crear cuenta con Google');
        } else if (result?.ok) {
          router.push('/');
        }
      } catch (err) {
        setError('Error al crear cuenta con Google');
        console.error(err);
      }
    });
  };

  return (
  <>
    <BackButtonLogo />

    {/* Form Title */}
    <h1 className="merged-signup-title">Crear cuenta</h1>

    {/* Form */}
    <form onSubmit={handleSubmit} className="merged-signup-form">
      {/* Email Input */}
      <div className="merged-signup-form-group">
        <InputField2
          label="Correo electrónico*"
          type="text"
          placeholder="Correo electrónico*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          name="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
      </div>

      {/* Password Input */}
      <div className="merged-signup-form-group">
        <InputField2
          label="Contraseña*"
          type="password"
          placeholder="Contraseña*"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
          name="password"
          autoComplete="new-password"
          error={fieldErrors.password}
        />
      </div>

      {/* Confirm Password Input */}
      <div className="merged-signup-form-group">
        <InputField2
          label="Confirmar contraseña*"
          type="password"
          placeholder="Confirmar contraseña*"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />
      </div>

      {/* Submit Button */}
      <button type="submit" className="merged-signup-button" disabled={isPending}>
        {isPending ? 'Registrando...' : 'Crear cuenta'}
      </button>

      {/* Sign In/Up Link */}
      <div className="merged-signup-signin-link">
        <span className="merged-signup-signin-text">
          ¿Ya tenés cuenta?
        </span>
        <a 
          href="/login" 
          className="merged-signup-link"
        >
          Iniciar sesión
        </a>
      </div>

      {/* Divider */}
      <div className="merged-signup-divider">
        <div className="merged-signup-divider-line"></div>
        <span className="merged-signup-divider-text">
          O crear cuenta con
        </span>
        <div className="merged-signup-divider-line"></div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        className="merged-signup-google-button"
        onClick={handleGoogleSignUp}
        disabled={isPending}
      >
        <img src={iconGoogle} alt="" />
        <span>{isPending ? 'Procesando...' : 'Google'}</span>
      </button>

      {/* Terms Checkboxes */}
      <div className="merged-signup-terms-section">
        <Checkbox
          label="Acepto Términos y condiciones de uso"
          checked={agreeTerms}
          onChange={(checked) => setAgreeTerms(checked)}
          id="agreeTerms"
          name="agreeTerms"
          error={fieldErrors.agreeTerms}
        />

        <Checkbox
          label="Acepto Política de privacidad"
          checked={agreePrivacy}
          onChange={(checked) => setAgreePrivacy(checked)}
          id="agreePrivacy"
          name="agreePrivacy"
          error={fieldErrors.agreePrivacy}
        />
      </div>

      {successMessage && (
        <div className="merged-signup-success-message">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="merged-signup-error-message">
          {error}
        </div>
      )}
    </form>

    {/* Professional Signup CTA */}
    <div className="merged-signup-professional-cta">
      <p className="merged-signup-cta-text">
        ¿Formás parte del mercado inmobiliario<br />y aún no tenés cuenta?
      </p>
      <a href="/professionalSignup" className="merged-signup-cta-link">
        Crear cuenta profesional
      </a>
    </div>

    {showEmailVerificationModal && <EmailVerificationModal email={email} onClose={() => router.push('/')} onResendEmail={() => {}} />}
  </>
  );
}
