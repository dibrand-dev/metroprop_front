'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import './UserSignup.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import EmailVerificationModal from '../../../components/EmailVerificationModal/EmailVerificationModal';
import { API_BASE_URL } from '@/utils/utils';
import { useMutation } from '@tanstack/react-query';
import SuccessModal from '../../../components/SuccessModal/SuccessModal';
import Button from '@/ui/Button/Button';
import { useGoogleAuth } from '@/lib/useGoogleAuth';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';

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
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', confirmPassword: '', agreeTerms: '', agreePrivacy: '' });
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resendDisabledUntil, setResendDisabledUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();

  // Mutation for user registration
  const registerUserMutation = useMutation({
    mutationFn: async (formData: { email: string; password?: string; name?: string; google?: boolean }) => {
      return apiFetch(`${API_BASE_URL}/registration/`, { method: 'POST', body: formData });
    },
    onSuccess: () => {
      setShowEmailVerificationModal(true);
    },
    onError: (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
      setError(errorMessage);
    },
  });

  // Check for existing resend cooldown on component mount
  useEffect(() => {
    const storedResendTime = localStorage.getItem(`resendDisabled_${email}`);
    if (storedResendTime) {
      const disabledUntil = parseInt(storedResendTime);
      const now = Date.now();
      if (disabledUntil > now) {
        setResendDisabledUntil(disabledUntil);
        setRemainingTime(Math.ceil((disabledUntil - now) / 1000));
      } else {
        localStorage.removeItem(`resendDisabled_${email}`);
      }
    }
  }, [email]);

  // Countdown timer effect
  useEffect(() => {
    if (resendDisabledUntil && remainingTime > 0) {
      const timer = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.ceil((resendDisabledUntil - now) / 1000);
        
        if (timeLeft <= 0) {
          setResendDisabledUntil(null);
          setRemainingTime(0);
          localStorage.removeItem(`resendDisabled_${email}`);
          clearInterval(timer);
        } else {
          setRemainingTime(timeLeft);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendDisabledUntil, remainingTime, email]);

  // Format remaining time for display
  const formatRemainingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

    registerUserMutation.mutate({ email: email.toLowerCase(), password });
  };

  const { isGoogleLoading, googleError, handleGoogleAuth } = useGoogleAuth({
    callbackPath: '/signup',
    paramName: 'googleRegister',
    onNewUser: () => {
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace('/');
      }, 3000);
    },
    onExistingUser: () => {
      router.push('/');
    },
  });

  const handleResendEmail = async () => {
    // Check if resend is currently disabled
    if (resendDisabledUntil && Date.now() < resendDisabledUntil) {
      return;
    }

    try {
      await apiFetch(`${API_BASE_URL}/registration/resend-welcome`, {
        method: 'POST',
        body: { email },
      });

      // (40 segundos para reenviar)
      const cooldownEnd = Date.now() + (40 * 1000); // 40 seconds in milliseconds
      setResendDisabledUntil(cooldownEnd);
      setRemainingTime(40); // 40 seconds
      localStorage.setItem(`resendDisabled_${email}`, cooldownEnd.toString());
      
    } catch (err) {
      console.error('Error al reenviar el correo de verificación:', err);
    }
  };

  // Check if resend is currently disabled
  const isResendDisabled = resendDisabledUntil && Date.now() < resendDisabledUntil;
  const resendMessage = isResendDisabled 
    ? `Podrás reenviar el correo en ${formatRemainingTime(remainingTime)}`
    : undefined;
  const isFormDisabled = isPending || isGoogleLoading;
  
  return (
  <>
    <BackButtonLogo />

    {/* Form Title */}
    <h1 className="merged-signup-title">Crear cuenta</h1>

    {/* Form */}
    <form onSubmit={handleSubmit} className="merged-signup-form" autoComplete='off'>
      {/* Email Input */}
      <div className="merged-signup-form-group">
        <InputField2
          label="Correo electrónico*"
          type="text"
          placeholder="Correo electrónico*"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          id="email"
          name="email"
          autoComplete="email"
          error={fieldErrors.email}
          disabled={isFormDisabled}
        />
      </div>

      {/* Password Input */}
      <div className="merged-signup-form-group">
        <InputField2
          label="Contraseña*"
          type="password"
          placeholder="Contraseña*"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          id="password"
          name="password"
          autoComplete="new-password"
          error={fieldErrors.password}
          disabled={isFormDisabled}
        />
      </div>

      {/* Confirm Password Input */}
      <div className="merged-signup-form-group">
        <InputField2
          label="Confirmar contraseña*"
          type="password"
          placeholder="Confirmar contraseña*"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          disabled={isFormDisabled}
        />
      </div>
      <Button
        label={isPending ? 'Registrando...' : 'Crear cuenta'}
        type="submit"
        variant="primary"
        buttonType="1"
        state="default"
        disabled={isFormDisabled}
        loading={isPending}
        fullWidth={true}
        size="medium"
      />
      {/* Sign In/Up Link */}
      <div className="merged-signup-signin-link">
        <span className="merged-signup-signin-text">
          ¿Ya tenés cuenta?
        </span>
        <Link prefetch={false}  
          href="/login" 
          className="merged-signup-link"
        >
          Iniciar sesión
        </Link>
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
        onClick={handleGoogleAuth}
        disabled={isFormDisabled}
      >
        <img src={iconGoogle} alt="" />
        <span>{isGoogleLoading ? 'Procesando...' : 'Google'}</span>
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
          disabled={isFormDisabled}
        />

        <Checkbox
          label="Acepto Política de privacidad"
          checked={agreePrivacy}
          onChange={(checked) => setAgreePrivacy(checked)}
          id="agreePrivacy"
          name="agreePrivacy"
          error={fieldErrors.agreePrivacy}
          disabled={isFormDisabled}
        />
      </div>
      {(error || googleError) && (
        <div className="merged-signup-error-message">
          {error || googleError}
        </div>
      )}
    </form>

    {/* Professional Signup CTA */}
    <div className="merged-signup-professional-cta">
      <p className="merged-signup-cta-text">
        ¿Formás parte del mercado inmobiliario<br />y aún no tenés cuenta?
      </p>
      <Link prefetch={false}  href="/professionalSignup" className="merged-signup-cta-link">
        Crear cuenta profesional
      </Link>
    </div>

    {showEmailVerificationModal && 
    <EmailVerificationModal 
      title="¡Te enviamos un e-mail para validar tu cuenta!" 
      text={`Ingresa a tu casilla de mail ${email} para continuar.`} 
      onClose={() => router.push('/')} 
      onResendEmail={isResendDisabled ? undefined : handleResendEmail}
      resendMessage={resendMessage}
    />}
    {showSuccessModal && <SuccessModal title="¡Cuenta creada exitosamente!" text="Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión y comenzar a explorar nuestras propiedades." />}
  </>
  );
}
