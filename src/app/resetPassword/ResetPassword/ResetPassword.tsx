'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import InputField2 from '@/ui/InputField2/InputField2';
import Button from '@/ui/Button/Button';
import { API_BASE_URL } from '@/utils/utils';
import './ResetPassword.scss';
import SuccessModal from '../../../components/SuccessModal/SuccessModal';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import { apiFetch } from '@/lib/apiFetch';

interface UserInfo {
  email: string;
  name: string;
}

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // Validar token al cargar el componente
  useEffect(() => {
    if (!token) {
      setTokenError('No se proporcionó un token de recuperación válido');
      setIsValidatingToken(false);
      return;
    }

    validateToken(token);
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      setIsValidatingToken(true);
      const data = await apiFetch<any>(`${API_BASE_URL}/users/validate-reset-token/${resetToken}`);
      if (data.valid) {
        setTokenValid(true);
        setUserInfo(data.user);
      } else {
        setTokenError(data.message || 'El enlace de recuperación no es válido');
        setTokenValid(false);
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setTokenError('Error de conexión. Por favor intente de nuevo.');
      setTokenValid(false);
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ newPassword: '', confirmPassword: '' });

    if (!newPassword || !confirmPassword) {
      setFieldErrors({
        newPassword: !newPassword ? 'Por favor ingresa tu contraseña nueva' : '',
        confirmPassword: !confirmPassword ? 'Por favor confirma tu contraseña' : '',
      });
      // setError('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      setFieldErrors((prev) => ({ ...prev, newPassword: 'La contraseña debe tener entre 6 y 20 caracteres' }));
      // setError('La contraseña debe tener entre 6 y 20 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors({ newPassword: 'Las contraseñas no coinciden', confirmPassword: 'Las contraseñas no coinciden' });
      // setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsResettingPassword(true);
      setError('');

      const data = await apiFetch<any>(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        body: { token: token, newPassword: newPassword },
      });

      if (data.success) {       
        setShowResetPasswordModal(true)
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleRequestNewLink = () => {
    router.push('/forgotPassword'); // Nueva página para solicitar reset
  };

  // Estado de cargando validación
  if (isValidatingToken) {
    return (
      <div className="recuperar-contrasena-container" style={{ minHeight: 534, alignItems: 'flex-start' }}>
        <div className="recuperar-contrasena-content">
          <BackButtonLogo />
          <h1 className="recuperar-contrasena-title">Verificando enlace...</h1>
          <p className='recuperar-contrasena-subtitle'>
            Por favor espera mientras verificamos tu enlace de recuperación.
          </p>
        </div>
      </div>
    );
  }

  // Token inválido o expirado
  if (!tokenValid) {
    return (
      <div className="recuperar-contrasena-container">
        <div className="recuperar-contrasena-content">
          <BackButtonLogo />
          <h1 className="recuperar-contrasena-title">Enlace no válido</h1>
          <div style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{ color: '#991b1b', margin: 0, fontSize: '16px' }}>
              {tokenError}
            </p>
          </div>
          <Button
            label="Solicitar nuevo enlace"
            type="button"
            variant="primary"
            fullWidth={true}
            size="medium"
            onClick={handleRequestNewLink}
          />
        </div>
      </div>
    );
  }

  // Formulario de reset (token válido)
  return (
    <div className="recuperar-contrasena-container">
      <div className="recuperar-contrasena-content">
        <BackButtonLogo />
        <form className="recuperar-contrasena-form" onSubmit={handleSubmit}>
          {/* Title */}
          <h1 className="recuperar-contrasena-title">Reestablecer contraseña</h1>
          
          <p className="recuperar-contrasena-subtitle">
            Contraseña nueva
          </p>
          {/* New Password Field */}
          <div className="recuperar-contrasena-field-group">
            <InputField2
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
            <p className="recuperar-contrasena-hint">Usa de 6 a 20 caracteres</p>
          </div>

          {/* Confirm Password Field */}
          <div className="recuperar-contrasena-field-group">
            <InputField2
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
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#991b1b', margin: 0, fontSize: '14px' }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            label={isResettingPassword ? 'Guardando...' : 'Guardar cambios'}
            type="submit"
            variant="primary"
            fullWidth={true}
            size="medium"
            disabled={isResettingPassword}
            loading={isResettingPassword}
          />
        </form>
      </div>
      {showResetPasswordModal && <SuccessModal title="¡Contraseña actualizada!" text="Ahora puedes iniciar sesión con tu nueva contraseña." />}
    </div>
  );
}
