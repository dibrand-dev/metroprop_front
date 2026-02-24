'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import './UserSignup.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import EmailVerificationModal from '../EmailVerificationModal/EmailVerificationModal';
import { API_BASE_URL } from '@/utils/utils';
import SuccessModal from '../SuccessModal/SuccessModal';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAutoRegisteredRef = useRef(false);

  const registerUser = async (payload: { email: string; password?: string; name?: string, google?: boolean }) => {
    const response = await fetch(`${API_BASE_URL}/registration/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Error en el registro';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
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

    startTransition(async () => {
      try {
        await registerUser({ email, password });        
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

    const runGoogleRegistration = async () => {
      const session:any = await getSession();
      const sessionEmail = session?.user?.email ?? '';
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
              name: session?.user?.name ?? undefined,
              avatar: session?.user?.image ?? undefined,
              google_id: session?.user?.id
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
  }, [searchParams, startTransition]);

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
    {showSuccessModal && <SuccessModal title="¡Cuenta creada exitosamente!" text="Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión y comenzar a explorar nuestras propiedades." />}
  </>
  );
}
