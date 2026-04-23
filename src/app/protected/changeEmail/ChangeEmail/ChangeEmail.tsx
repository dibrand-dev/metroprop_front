'use client';

import { useEffect, useState } from 'react';
import './ChangeEmail.scss';
import InputField2 from '@/ui/InputField2/InputField2';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession } from 'next-auth/react';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import InputField from '@/ui/InputField/InputField';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';

const iconEditPencil = "/icons/pencil.svg";
const iconArrowBack = "/icons/arrow.svg";

interface PropertyData {
  [key: string]: string;
}

const formatNumeric = (value: string): string => value.replace(/\D/g, '');

export default function ChangeEmail() {
  const { data: sessionData } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ newEmail: '', confirmEmail: '' });
  const [properties, setProperties] = useState<any>({
    newEmail: '',
    confirmEmail: ''
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const userId = (sessionData?.user as any)?.id;
      const currentEmail = (sessionData?.user as any)?.email;
      if (!userId) throw new Error('No user id');
      const res = await fetch(`${API_BASE_URL}/users/${userId}/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          oldEmail: currentEmail,
          newEmail: data.newEmail,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Error al cambiar el email');
      return result;
    },
    onSuccess: (result) => {
      setSuccessMessage(result.message || 'Email cambiado correctamente');
      setErrorMessage('');
      setProperties((prev: any) => ({ ...prev, newEmail: '', confirmEmail: '' }));
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Error al guardar los cambios. Por favor intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const currentEmail = (sessionData?.user as any)?.email ?? '';

  const handleInputChange = (field: string, value: string) => {
    const next = { ...properties, [field]: value };
    setProperties(next);

    const errors = { newEmail: '', confirmEmail: '' };
    const ne = field === 'newEmail' ? value : next.newEmail;
    const ce = field === 'confirmEmail' ? value : next.confirmEmail;
    if (ne && !isValidEmail(ne)) errors.newEmail = 'Ingresa un email válido';
    if (ce && !isValidEmail(ce)) errors.confirmEmail = 'Ingresa un email válido';
    else if (ce && ne && ce === ne) errors.confirmEmail = 'La nueva dirección de email es igual a la anterior';
    setFieldErrors(errors);
  };

  const validate = (): boolean => {
    const errors = { newEmail: '', confirmEmail: '' };
    if (!properties.newEmail) errors.newEmail = 'Ingresa el nuevo email';
    else if (!isValidEmail(properties.newEmail)) errors.newEmail = 'Ingresa un email válido';
    if (!properties.confirmEmail) errors.confirmEmail = 'Ingresa el email de confirmación';
    else if (!isValidEmail(properties.confirmEmail)) errors.confirmEmail = 'Ingresa un email válido';
    else if (properties.confirmEmail === properties.newEmail) errors.confirmEmail = 'La nueva dirección de email es igual a la anterior';
    setFieldErrors(errors);
    return !errors.newEmail && !errors.confirmEmail;
  };

  const hasErrors = !!(fieldErrors.newEmail || fieldErrors.confirmEmail);
  const isFormEmpty = !properties.newEmail && !properties.confirmEmail;

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    updateUserMutation.mutate(properties);
  };
 
  return (
    <div className={`professionalContainer ${!showMenu ? "activeMenuMobile" : ""}`}>
      <Submenu active={showMenu} />
      <div className={`professional-profile-container ${showMenu ? 'mobile-hidden' : ''}`}>
        {/* Header */}
        <div className="professional-profile-header">
          <button className="professional-profile-back-button" onClick={() => setShowMenu(true)}>
            <img src={iconArrowBack} alt="Back"  />
          </button>
          <span className='professional-profile-title'>Cambiar Email</span>
        </div>
        <div className="profile-header">
          <div>
            <h1>Cambiar Email</h1>
          </div>
          <button className="professional-profile-save-button-header" onClick={handleSave} disabled={updateUserMutation.isPending || hasErrors || isFormEmpty}>
            {updateUserMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Main Content */}
        <div className={`professional-profile-content is-editing`}>
          {/* Section */}
          <section className="professional-profile-section">                     
            <div className="professional-profile-fields">
              <InputField
                type="email"
                placeholder="Nuevo Email"
                value={properties.newEmail}
                onChange={(e) => handleInputChange('newEmail', e.target.value)}
                label="Nuevo Email"
                error={fieldErrors.newEmail}
              />
              <InputField
                type="email"
                placeholder="Repetir Nuevo Email"
                value={properties.confirmEmail}
                onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                label="Repetir Nuevo Email"
                error={fieldErrors.confirmEmail}
              />
            </div>
          </section>

          {/* Save Button */}          
          <button className="professional-profile-save-button" onClick={handleSave} disabled={updateUserMutation.isPending || hasErrors || isFormEmpty}>
            {updateUserMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>

          {successMessage && (
            <div className="profile-feedback profile-feedback--success">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="profile-feedback profile-feedback--error">{errorMessage}</div>
          )}
        </div>
      </div>

      {showConfirm && (
        <AreYouSureModal
          title="Cambiar email"
          text="¿Estás seguro que deseas cambiar tu dirección de email?"
          icon="/icons/envelope_w.svg"
          onAccept={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
