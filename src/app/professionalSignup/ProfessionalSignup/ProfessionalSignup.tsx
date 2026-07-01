'use client';

import { useState, useTransition, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import './ProfessionalSignup.scss';
import BackButtonLogo from '@/ui/BackButtonLogo/BackButtonLogo';
import EmailVerificationModal from '../../../components/EmailVerificationModal/EmailVerificationModal';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';
import Image from 'next/image';

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const formatCuit = (input: string, finalize = false): string => {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;

  if (!finalize) {
    if (digits.length <= 9) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}-${digits.slice(2, digits.length - 1)}-${digits.slice(-1)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

const formatPhone = (input: string): string => input.replace(/\D/g, '').slice(0, 13);

export default function ProfessionalSignup() {
  const [userType, setUserType] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [fiscalCondition, setFiscalCondition] = useState<string>('');
  const [cuit, setCuit] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState({ userType: '', email: '', password: '', confirmPassword: '', name: '', businessName: '', fiscalCondition: '', cuit: '', phone: '', termsAccepted: '', privacyAccepted: '' });
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [resendDisabledUntil, setResendDisabledUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const router = useRouter();

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

  // Mutation for professional registration
  const registerProfessionalMutation = useMutation({
    mutationFn: async (formData: any) => {
      return apiFetch(`${API_BASE_URL}/registration/professional`, { method: 'POST', body: formData });
    },
    onSuccess: () => {
      setShowEmailVerificationModal(true);
    },
    onError: (err: any) => {
      setError(err.message || 'Error registrando profesional');
    },
  });

  const isPending = registerProfessionalMutation.isPending;

  // Mutation for resend email
  const resendEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiFetch(`${API_BASE_URL}/registration/resend-welcome`, { method: 'POST', body: { email } });
    },
    onSuccess: () => {
      // Set 1-hour cooldown (3600 seconds)
      const cooldownEnd = Date.now() + (60 * 60 * 1000); // 1 hour in milliseconds
      setResendDisabledUntil(cooldownEnd);
      setRemainingTime(3600); // 1 hour in seconds
      localStorage.setItem(`resendDisabled_${email}`, cooldownEnd.toString());
    },
    onError: (err: any) => {
      setError(err.message || 'Error al reenviar el correo de verificación');
    },
  });

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
    setFieldErrors({ userType: '', email: '', password: '', confirmPassword: '', name: '', businessName: '', fiscalCondition: '', cuit: '', phone: '', termsAccepted: '', privacyAccepted: '' });

    if (!userType || !email || !password || !confirmPassword || !name || !businessName || !fiscalCondition || !cuit || !phone || !termsAccepted || !privacyAccepted) {
      setFieldErrors({
        userType: !userType ? 'Por favor selecciona un tipo de usuario' : '',
        email: !email ? 'Por favor ingresa tu correo electrónico' : '',
        password: !password ? 'Por favor ingresa tu contraseña' : '',
        confirmPassword: !confirmPassword ? 'Por favor confirma tu contraseña' : '',
        name: !name ? 'Por favor ingresa tu nombre' : '',
        businessName: !businessName ? 'Por favor ingresa la razón social' : '',
        fiscalCondition: !fiscalCondition ? 'Por favor selecciona una condición fiscal' : '',
        cuit: !cuit ? 'Por favor ingresa el CUIT' : (cuit.replace(/\D/g, '').length < 10 ? 'El CUIT debe tener al menos 10 caracteres' : ''),
        phone: !phone ? 'Por favor ingresa el teléfono' : (phone.length < 10 ? 'El teléfono debe tener al menos 10 dígitos' : (phone.length > 13 ? 'El teléfono no puede tener más de 13 dígitos' : '')),
        termsAccepted: !termsAccepted ? 'Debes aceptar los términos y condiciones' : '',
        privacyAccepted: !privacyAccepted ? 'Debes aceptar la política de privacidad' : '',
      });
      // setError('Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Por favor ingresa un correo electrónico válido' }));
      // setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 6 || password.length > 20) {
      setFieldErrors((prev) => ({ ...prev, password: 'La contraseña debe tener entre 6 y 20 caracteres' }));
      // setError('La contraseña debe tener entre 6 y 20 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, password: 'Las contraseñas no coinciden', confirmPassword: 'Las contraseñas no coinciden' }));
      // setError('Las contraseñas no coinciden');
      return;
    }

    if (cuit.replace(/\D/g, '').length < 10) {
      setFieldErrors((prev) => ({ ...prev, cuit: 'El CUIT debe tener al menos 10 caracteres' }));
      return;
    }

    if (phone.length < 10 || phone.length > 13) {
      setFieldErrors((prev) => ({ ...prev, phone: phone.length < 10 ? 'El teléfono debe tener al menos 10 dígitos' : 'El teléfono no puede tener más de 13 dígitos' }));
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      // setError('Debes aceptar los términos y condiciones');
      return;
    }

    // Call mutation for registration
    registerProfessionalMutation.mutate({
      email: email.toLowerCase(),
      password,
      name,
      company_name: businessName,
      phone,
      cuit,
      fiscal_condition: fiscalCondition,
      social_reason: businessName,
    });
  };

  const handleResendEmail = () => {
    // Check if resend is currently disabled
    if (resendDisabledUntil && Date.now() < resendDisabledUntil) {
      return;
    }
    resendEmailMutation.mutate(email);
  };

  // Check if resend is currently disabled
  const isResendDisabled = resendDisabledUntil && Date.now() < resendDisabledUntil;
  // Show resend error if any
  // Optionally, you can show resendEmailMutation.error in the UI if needed
  const resendMessage = isResendDisabled 
    ? `Podrás reenviar el correo en ${formatRemainingTime(remainingTime)}`
    : undefined;

  return (
    <div className="signup-container bg-white min-h-screen w-full">
      <div className="signup-wrapper">
        {/* Left Panel - Form */}
        <div className="signup-left-panel">
          <BackButtonLogo showLogo={false} />

          <div className="signup-form-container">
            <h1 className="form-title">Ingresa los datos para crear tu perfil profesional</h1>

            <form onSubmit={handleSubmit} autoComplete='off'>
              {/* User Type Section */}
              <div className="form-section">
                <h2 className="form-section-title">Tipo de usuario</h2>
                <div className="form-field-group">
                  <div className="form-field">
                    <Select
                      label=""
                      placeholder="Seleccionar"
                      value={userType}
                      onChange={(value) => setUserType(value)}
                      options={[
                        { value: 'inmobiliario', label: 'Inmobiliario' },
                        { value: 'inversor', label: 'Inversor' },
                        { value: 'otros', label: 'Otros' },
                      ]}
                      error={fieldErrors.userType}
                    />
                  </div>

                  <div className="form-field">
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

                  <div className="form-field">
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
                    <p className="form-help-text">Usa de 6 a 20 caracteres</p>
                  </div>

                  <div className="form-field">
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
                </div>
              </div>

              {/* Data Section */}
              <div className="form-section">
                <h2 className="form-section-title">Datos</h2>
                <div className="form-field-group">
                  <div className="form-field">
                    <InputField2
                      label="Nombre*"
                      type="text"
                      placeholder="Nombre*"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="name"
                      name="name"
                      error={fieldErrors.name}
                    />
                  </div>

                  <div className="form-field">
                    <InputField2
                      label="Razón social*"
                      type="text"
                      placeholder="Razón social*"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      id="businessName"
                      name="businessName"
                      error={fieldErrors.businessName}
                    />
                  </div>
                </div>
              </div>

              {/* Fiscal Condition Section */}
              <div className="form-section">
                <h2 className="form-section-title">Condición fiscal</h2>
                <div className="form-field-group">
                  <div className="form-field">
                    <Select                      
                      placeholder="Seleccionar"
                      value={fiscalCondition}
                      onChange={(value) => setFiscalCondition(value)}
                      options={[
                        { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
                        { value: 'Monotributo', label: 'Monotributista' },
                        { value: 'Exento', label: 'Exento' },
                        { value: 'Consumidor Final', label: 'Consumidor Final' },
                        { value: 'No Responsable', label: 'No Responsable' }
                      ]}
                      error={fieldErrors.fiscalCondition}
                    />
                  </div>
                  <div className="form-field">
                    <InputField2
                      label="CUIT*"
                      type="text"
                      placeholder="CUIT*"
                      value={cuit}
                      onChange={(e) => setCuit(formatCuit(e.target.value))}
                      onBlur={(e) => setCuit(formatCuit(e.target.value, true))}
                      id="cuit"
                      name="cuit"
                      error={fieldErrors.cuit}
                    />
                  </div>

                  <div className="form-field">
                    <InputField2
                      label="Teléfono móvil*"
                      type="tel"
                      placeholder="Teléfono móvil*"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      error={fieldErrors.phone}
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="form-section merged-signup-terms-section">
                <Checkbox
                  label={<>Acepto&nbsp;<a rel="noopener noreferrer" target="_blank" href="/terms">Términos y condiciones de uso</a></>}
                  checked={termsAccepted}
                  onChange={(checked) => setTermsAccepted(checked)}
                  id="termsAccepted"
                  name="termsAccepted"
                  error={fieldErrors.termsAccepted}
                />

                <Checkbox
                  label={<>Acepto&nbsp;<a rel="noopener noreferrer" target="_blank" href="/policy">Política de privacidad</a></>}
                  checked={privacyAccepted}
                  onChange={(checked) => setPrivacyAccepted(checked)}
                  id="privacyAccepted"
                  name="privacyAccepted"
                  error={fieldErrors.privacyAccepted}
                />
              </div>

              <Button
                label={isPending ? 'Registrando...' : 'Registrarme'}
                type="submit"
                variant="primary"
                buttonType="1"
                state={isPending ? 'disabled' : 'default'}
                fullWidth={true}
                size="medium"
                disabled={isPending}
              />

              {error && (
                <div className="merged-signup-error-message">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
        <div className="signup-right-panel">
          <Image
            src="/images/Inicio-sesion.png"
            alt="Hero"
            fill
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
      {showEmailVerificationModal && (
        <EmailVerificationModal 
          title="¡Te enviamos un e-mail para validar tu cuenta!" 
          text={`Ingresá a tu casilla de mail para continuar.`} 
          onClose={() => router.push('/')} 
          onResendEmail={isResendDisabled ? undefined : handleResendEmail}
          resendMessage={resendMessage}
        />
      )}
    </div>
  );
}
