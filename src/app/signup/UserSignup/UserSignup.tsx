'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { signIn, useSession } from 'next-auth/react';
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
  const hasAutoRegisteredRef = useRef(false);
  const { data: googleSession, status: sessionStatus } = useSession();

  // Mutation for user registration
  const registerUserMutation = useMutation({
    mutationFn: async (formData: { email: string; password?: string; name?: string; google?: boolean }) => {
      const response = await fetch(`${API_BASE_URL}/registration/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error registering user');
      }
      return response.json();
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

  const registerUser = async (payload: { email: string; password?: string; name?: string, google?: boolean }) => {

      // Replace fetch with useMutation from tanstack/react-query
      // import { useMutation } from '@tanstack/react-query';
      // const registerUserMutation = useMutation({
      //   mutationFn: async (formData) => {
      //     const response = await fetch(`${API_BASE_URL}/registration/`, {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify(formData),
      //     });
      //     if (!response.ok) throw new Error('Error registering user');
      //     return response.json();
      //   }
      // });
      // registerUserMutation.mutate(payload);
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

    registerUserMutation.mutate({ email, password });
  };

  const handleGoogleSignUp = () => {
    startTransition(async () => {
      try {
        setError('');
        await signIn('google', {
          redirect: true,
          callbackUrl: '/signup?googleRegister=1',
        });
      } catch (err) {
        console.error('Google sign up exception:', err);
        setError('Error al crear cuenta con Google. Por favor intenta de nuevo.');
      }
    });
  };

  useEffect(() => {
    const shouldAutoRegister = searchParams.get('googleRegister') === '1';
    if (!shouldAutoRegister || hasAutoRegisteredRef.current) {
      return;
    }

    // Wait until NextAuth session is ready after the OAuth redirect
    if (sessionStatus !== 'authenticated') {
      return;
    }

    const runGoogleRegistration = async () => {
      const sessionEmail = googleSession?.user?.email ?? '';
      if (!sessionEmail) {
        return;
      }

      hasAutoRegisteredRef.current = true;
      setError('');

      startTransition(async () => {
        try {
          const response:any = await fetch(`${API_BASE_URL}/registration/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: sessionEmail,
              name: googleSession?.user?.name ?? undefined,
              avatar: (googleSession?.user as any)?.image ?? undefined,
              google_id: googleSession?.user?.id
            }),
          });

          if (!response.ok) {
            const errorMessage = 'Error al conectar con el servidor';
            setError(errorMessage);
            router.replace('/signup');
            return;
          } else {
            setShowSuccessModal(true);
            setTimeout(() => {
              setShowSuccessModal(false);
              router.replace('/signup');
            }, 3000);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
          setError(errorMessage);
        }
      });
    };

    runGoogleRegistration();
  }, [searchParams, startTransition, googleSession, sessionStatus]);
  
  const handleResendEmail = async () => {
    // Check if resend is currently disabled
    if (resendDisabledUntil && Date.now() < resendDisabledUntil) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/registration/resend-welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
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
      <Button
        label={isPending ? 'Registrando...' : 'Crear cuenta'}
        type="submit"
        variant="primary"
        buttonType="1"
        state="default"
        disabled={isPending}
        loading={isPending}
        fullWidth={true}
        size="medium"
      />
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
