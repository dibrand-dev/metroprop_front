'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { getSession, signIn, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Button from '@/ui/Button/Button';
import './UserSignin.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import { API_BASE_URL } from '@/utils/utils';
import SuccessModal from '../../../components/SuccessModal/SuccessModal';
import { useMutation } from '@tanstack/react-query';

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
  const [showEmailVerificatedModal, setShowEmailVerificatedModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessedGoogleLoginRef = useRef(false);

  const setCookieMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error setting cookie');
      return response.json();
    }
  });

  // Mutation for Google registration/login
  const googleRegistrationMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(`${API_BASE_URL}/registration/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al iniciar sesión con Google');
      }
      return response.json();
    },
    onSuccess: async (data: any) => {
      await storeAuthData(data);
      router.push('/');
    },
    onError: (err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión. Por favor intenta de nuevo.';
      setError(errorMessage);
    },
  });

  const storeAuthData = async (data: any) => {
    if (!(data?.access_token && data?.user)) {
      return;
    }
    console.log("storeAuthData", data);
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('userEmail', data.user.email);

    try {
      console.log("TRY /api/auth/set-cookie");
      await setCookieMutation.mutateAsync(data.access_token);
    } catch (cookieError) {
      console.error('Error calling set-cookie API:', cookieError);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '' });

    if (!email || !password) {
      setFieldErrors({
        email: !email ? 'Por favor ingresa tu correo electrónico' : '',
        password: !password ? 'Por favor ingresa tu contraseña' : '',
      });
      setError('Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Por favor ingresa un correo electrónico válido', password: '' });
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    startTransition(async () => {
      try {
        setError('');

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'Error al iniciar sesión');
          return;
        }

        const data = await response.json();
        await storeAuthData(data);
        router.push('/');
      } catch (err) {
        console.error('Login error:', err);
        setError('Error de conexión. Por favor intenta de nuevo.');
      }
    });
  };

  const handleGoogleSignIn = () => {
    console.log("handleGoogleSignIn CLICK")
    startTransition(async () => {
      console.log("startTransition for Google SignIn")
      try {
        setError('');
        console.log("await signIn('google'")
        await signIn('google', {
          redirect: true,
          callbackUrl: '/login?googleLogin=1',
        });
      } catch (err) {
        console.error('Google sign in exception:', err);
        setError('Error al iniciar sesión con Google. Por favor intenta de nuevo.');
      }
    });
  };

  useEffect(() => {    
    const shouldProcessGoogleLogin = searchParams.get('googleLogin') === '1';
    const shouldProcessValidation = searchParams.get('verifyMailToken') !== null && searchParams.get('verifyMailToken') !== "";
    
    if (!shouldProcessValidation && (!shouldProcessGoogleLogin || hasProcessedGoogleLoginRef.current)) {
      return;
    }

    const processGoogleLogin = async () => {
      const session: any = await getSession();
      const sessionEmail = session?.user?.email ?? '';
      if (!sessionEmail) {
        return;
      }

      hasProcessedGoogleLoginRef.current = true;
      setError('');
      googleRegistrationMutation.mutate({
        email: sessionEmail,
        name: session?.user?.name ?? undefined,
        avatar: session?.user?.image ?? undefined,
        google_id: session?.user?.id,
      });
    };

    const processValidation = async () => {
      const token = searchParams.get('verifyMailToken') || '';
      try {
        const response = await fetch(`${API_BASE_URL}/users/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token
          })
        });

        const responseData = await response.json();
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

    shouldProcessGoogleLogin && processGoogleLogin();
    shouldProcessValidation && processValidation()

  }, [router, searchParams, startTransition]);

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
              error={fieldErrors.password}
            />
          </div>

          <a href="/forgotPassword" className="create-account-link block" style={{ marginBottom: '24px' }}>
            Olvidé mi contraseña
          </a>

          <div style={{ marginBottom: '24px' }}>
            <Button
              label={isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
              type="submit"
              variant="primary"
              buttonType="1"
              state="default"
              disabled={isPending}
              loading={isPending}
              fullWidth={true}
              size="medium"
            />
          </div>

          <div className="create-account">
            <span className="create-account-text">¿No tenés cuenta?</span>
            <a href="/signup" className="create-account-link">
              Crear una cuenta
            </a>
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
              onClick={handleGoogleSignIn}
              disabled={isPending}
            >
              <img src={iconGoogle} alt="" />
              <span>{isPending ? 'Procesando...' : 'Google'}</span>
            </button>
          </div>

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
              {error}
            </div>
          )}
        </form>
      </div>
      {showEmailVerificatedModal && <SuccessModal title="¡Email verificado!" text="Puedes loguearte con tu email." />}
    </>
  );
}
