'use client';

import { useEffect, useState, useTransition } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Button from '@/ui/Button/Button';
import './UserSignin.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import { API_BASE_URL } from '@/utils/utils';
import SuccessModal from '../../../components/SuccessModal/SuccessModal';
import { useMutation } from '@tanstack/react-query';
import { useGoogleAuth } from '@/lib/useGoogleAuth';
import { apiFetch, invalidateSessionTokenCache } from '@/lib/apiFetch';
import Link from 'next/link';
import Image from 'next/image';

const iconGoogle = '/icons/google.svg';

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function UserSignin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);  
  const [showEmailVerificatedModal, setShowEmailVerificatedModal] = useState(false);
  const [sessionExpiredToast, setSessionExpiredToast] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();

  const setCookieMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiFetch('/api/auth/set-cookie', {
        method: 'POST',
        body: { token },
      });
    }
  });

  const { isGoogleLoading, googleError, handleGoogleAuth } = useGoogleAuth({
    callbackPath: '/login',
    paramName: 'googleLogin',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '' });

    if (!email || !password) {
      setFieldErrors({
        email: !email ? 'Por favor ingresa tu correo electrónico' : '',
        password: !password ? 'Por favor ingresa tu contraseña' : '',
      });
      // setError('Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Por favor ingresa un correo electrónico válido', password: '' });
      // setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    startTransition(async () => {
      try {
        setError('');

        const result = await signIn('credentials', {
          email: email.toLowerCase(),
          password,
          redirect: false,
        });
        if (!result?.ok || result?.error) {
          // NextAuth sanitizes errors - make direct API call to get actual error message
          try {
            const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: email.toLowerCase(),
                password,
              }),
            });
            
            if (!loginResponse.ok) {
              const errorData = await loginResponse.json().catch(() => null);
              if (errorData?.message) {
                setError(errorData.message);
                return;
              }
            }
          } catch (apiError) {
            console.error("Error fetching login error details:", apiError);
          }
          
          // Fallback error message
          setError('Email o contraseña incorrectos. Por favor intenta de nuevo.');
          return;
        }
        // Fetch the fresh session to get apiToken + organization written by JWT callback
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        const apiToken: string | undefined = sessionData?.user?.apiToken;
        const user = sessionData?.user;
        
        if (apiToken && user) {          
          if (user.organization) {            
            await updateSession({ organization: user.organization });
          }
          try {
            console.log("Calling set-cookie API with token...", apiToken)
            await setCookieMutation.mutateAsync(apiToken);
          } catch (cookieError) {
            console.log("catch cookieError", cookieError)
            console.error('Error calling set-cookie API:', cookieError);
          }
        }
        invalidateSessionTokenCache();
        router.push('/');
        setTimeout(() => {
          router.refresh();
        }, 1000); 
        
      } catch (err) {
        setError('Error de conexión. Por favor intenta de nuevo.');
      }
    });
  };

  const isFormDisabled = isPending || isGoogleLoading;

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      setSessionExpiredToast(true);
      const timer = window.setTimeout(() => setSessionExpiredToast(false), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {    
    const shouldProcessValidation = searchParams.get('verifyMailToken') !== null && searchParams.get('verifyMailToken') !== "";
    
    if (!shouldProcessValidation) {
      return;
    }

    const processValidation = async () => {
      const token = searchParams.get('verifyMailToken') || '';
      try {
        const responseData = await apiFetch<any>(`${API_BASE_URL}/users/verify-email`, {
          method: 'POST',
          body: { token },
        });
        if (responseData.success) {
          setShowEmailVerificatedModal(true)
          setTimeout(() => {
            setShowEmailVerificatedModal(false);
          }, 3000);
        } else {
          let errorMessage = responseData.message         
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
        setError(errorMessage);
      }
    };

    processValidation();

  }, [searchParams]);

  useEffect(() => {
    const tmeid = setTimeout(() => {
      const formElement = document.getElementById('password');
      formElement?.click();
      formElement?.focus();
      const tmeid = setTimeout(() => {
        const formElement = document.getElementById('email');
        formElement?.click();
        formElement?.focus();
      }, 202)
    }, 200)
    
    return () => {
      clearTimeout(tmeid);
    };
  }, []);

  return (
    <>
      {sessionExpiredToast && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: '260px', maxWidth: '420px', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', fontWeight: 500, boxShadow: '0 6px 18px rgba(0,0,0,0.2)', background: '#c62828' }}>
          Se cerró la sesión. Logueate nuevamente
        </div>
      )}
      <BackButtonLogo />
      <div className="signin-form-container">
        <h1 className="form-title">Iniciar sesión</h1>
        <form id="formSignin" onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <InputField2
              label="Correo electrónico*"
              type="text"
              placeholder="Correo electrónico*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              name="email"
              disabled={isFormDisabled}
              error={fieldErrors.email}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <InputField2
              label="Contraseña*"
              type="password"
              placeholder="Contraseña*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              disabled={isFormDisabled}
              error={fieldErrors.password}
            />
          </div>

          <Link prefetch={false}  href="/forgotPassword" className="create-account-link block" style={{ marginBottom: '24px' }}>
            Olvidé mi contraseña
          </Link>

          <div style={{ marginBottom: '24px' }}>
            <Button
              label={isFormDisabled ? 'Iniciando sesión...' : 'Iniciar sesión'}
              type="submit"
              variant="primary"
              buttonType="1"
              state="default"
              disabled={isFormDisabled}
              loading={isFormDisabled}
              fullWidth={true}
              size="medium"
            />
          </div>

          <div className="create-account">
            <span className="create-account-text">¿No tenés cuenta?</span>
            <Link prefetch={false}  href="/signup" className="create-account-link">
              Crear una cuenta
            </Link>
          </div>

          <div className="divider-container" style={{ marginTop: '32px', marginBottom: '32px' }}>
            <div className="divider-line"></div>
            <span className="divider-text">O iniciar sesión con</span>
            <div className="divider-line"></div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <button
              type="button"
              className="merged-signup-google-button"
              onClick={handleGoogleAuth}
              disabled={isFormDisabled || isPending}
            >
              <img src={iconGoogle} alt="" />
              <span>{isGoogleLoading ? 'Procesando...' : 'Google'}</span>
            </button>
          </div>

          {(error || googleError) && (
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
              {error || googleError}
            </div>
          )}
        </form>
      </div>
      {showEmailVerificatedModal && <SuccessModal title="¡E-mail verificado!" text="Ya podés loguearte con tu e-mail." />}
      {showSuccessModal && <SuccessModal title="¡Cuenta creada exitosamente!" text="Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión y comenzar a explorar nuestras propiedades." />}
    </>
  );
}
