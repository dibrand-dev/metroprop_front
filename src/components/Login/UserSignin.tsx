'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Button from '@/ui/Button/Button';
import './UserSignin.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';

const iconGoogle = "/icons/google.svg";


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
  const router = useRouter();

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

        // Call backend login endpoint
        const response = await fetch('http://localhost:3000/auth/login', {
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
        
        // Store JWT token and user data in localStorage
        if (data.access_token && data.user) {
          localStorage.setItem('authToken', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userEmail', data.user.email);
          
          // Call API route to set secure HttpOnly cookie on server
          try {
            const cookieResponse = await fetch('/api/auth/set-cookie', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: data.access_token }),
              credentials: 'include',
            });
            
            if (!cookieResponse.ok) {
              console.error('Failed to set cookie:', cookieResponse.status);
            } else {
              console.log('Cookie set successfully');
            }
          } catch (cookieError) {
            console.error('Error calling set-cookie API:', cookieError);
          }
        }

        // Redirect to dashboard or home
        router.push('/');
      } catch (err) {
        console.error('Login error:', err);
        setError('Error de conexión. Por favor intenta de nuevo.');
      }
    });
  };

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      try {
        setError('');
        const result = await signIn('google', {
          redirect: false,
          callbackUrl: '/',
        });

        if (result?.error) {
          setError('Error al iniciar sesión con Google');
        } else if (result?.ok) {
          router.push('/');
        }
      } catch (err) {
        setError('Error al iniciar sesión con Google');
        console.error(err);
      }
    });
  };

  return (<>
    <BackButtonLogo />
    <div className="signin-form-container">
      {/* Form Title */}
      <h1 className="form-title">Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div style={{ marginBottom: '24px' }}>
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
        <div style={{ marginBottom: '24px' }}>
          <InputField2
            label="Contraseña*"
            type="password"
            placeholder="Contraseña*"
            value={password}
            onChange={(e) => setPassword(e.target.value)}                
            id="password"
            name="password"
            autoComplete="current-password"
            error={fieldErrors.password}
          />
        </div>

        {/* Forgot Password */}
        <a href="/resetPassword" className="create-account-link block" style={{ marginBottom: '24px' }} >
          Olvidé mi contraseña
        </a>

        {/* Signin Button */}
        <div style={{ marginBottom: '24px' }}>
          <Button
            label={isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            type="submit"
            variant="primary"
            buttonType="2"
            state="default"
            disabled={isPending}
            loading={isPending}
            fullWidth={true}
            size="medium"
          />
        </div>

        {/* Create Account */}
        <div className="create-account">
          <span className="create-account-text">¿No tenés cuenta?</span>
          <a href="/signup" className="create-account-link">
            Crear una cuenta
          </a>
        </div>

        {/* Divider */}
        <div className="divider-container" style={{ marginTop: '32px', marginBottom: '32px' }}>
          <div className="divider-line"></div>
          <span className="divider-text">O iniciar sesión con</span>
          <div className="divider-line"></div>
        </div>

        {/* Google Button */}
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
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            color: '#991b1b',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  </>
  );
}
