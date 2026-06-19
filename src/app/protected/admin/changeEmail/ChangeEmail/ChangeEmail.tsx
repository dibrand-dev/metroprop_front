'use client';

import { useEffect, useState } from 'react';
import './ChangeEmail.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import InputField from '@/ui/InputField/InputField';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import { apiFetch } from '@/lib/apiFetch';
import Button from '@/ui/Button/Button';

const iconArrowBack = "/icons/arrow.svg";

interface PropertyData {
  [key: string]: string;
}

const formatNumeric = (value: string): string => value.replace(/\D/g, '');

export default function ChangeEmail() {
  const { data: sessionData } = useSession();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ oldEmail: '', newEmail: '' });
  const [properties, setProperties] = useState<any>({
    oldEmail: '',
    newEmail: ''
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const result = await apiFetch<any>(`${API_BASE_URL}/users/change-email`, {
        method: 'POST',
        body: {
          oldEmail: data.oldEmail,
          newEmail: data.newEmail,
        },
      });
      if (!result.success) throw new Error(result.message || 'Error al cambiar el email');
      return result;
    },
    onSuccess: (result) => {
      setSuccessMessage(result.message || 'Email cambiado correctamente');
      setErrorMessage('');
      setProperties((prev: any) => ({ ...prev, oldEmail: '', newEmail: '' }));
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Error al guardar los cambios. Por favor intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (field: string, value: string) => {
    const next = { ...properties, [field]: value };
    setProperties(next);

    const errors = { oldEmail: '', newEmail: '' };
    const oe = field === 'oldEmail' ? value : next.oldEmail;
    const ne = field === 'newEmail' ? value : next.newEmail;
    if (ne && !isValidEmail(ne)) errors.newEmail = 'Ingresa un email válido';
    if (oe && !isValidEmail(oe)) errors.oldEmail = 'Ingresa un email válido';
    else if (oe && ne && oe === ne) errors.oldEmail = 'La nueva dirección de email es igual a la anterior';
    setFieldErrors(errors);
  };

  const validate = (): boolean => {
    const errors = { oldEmail: '', newEmail: '' };
    if (!properties.newEmail) errors.newEmail = 'Ingresa el nuevo email';
    else if (!isValidEmail(properties.newEmail)) errors.newEmail = 'Ingresa un email válido';
    if (!properties.oldEmail) errors.oldEmail = 'Ingresa el email actual';
    else if (!isValidEmail(properties.oldEmail)) errors.oldEmail = 'Ingresa un email válido';
    else if (properties.oldEmail === properties.newEmail) errors.oldEmail = 'La nueva dirección de email es igual a la anterior';
    setFieldErrors(errors);
    return !errors.newEmail && !errors.oldEmail;
  };

  const hasErrors = !!(fieldErrors.newEmail || fieldErrors.oldEmail);
  const isFormEmpty = !properties.newEmail && !properties.oldEmail;

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    updateUserMutation.mutate(properties);
  };
 
  return (
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
          <Button label={updateUserMutation.isPending ? 'Guardando...' : 'Guardar cambios'} className="professional-profile-save-button-header" onClick={handleSave} disabled={updateUserMutation.isPending || hasErrors || isFormEmpty} />         
        </div>

        {/* Main Content */}
        <div className={`professional-profile-content is-editing`}>
          {/* Section */}
          <section className="professional-profile-section">                     
            <div className="professional-profile-fields">
              <InputField
                type="email"
                placeholder="Email actual"
                value={properties.oldEmail}
                onChange={(e) => handleInputChange('oldEmail', e.target.value)}
                label="Email actual"
                error={fieldErrors.oldEmail}
              />
              <InputField
                type="email"
                placeholder="Nuevo Email"
                value={properties.newEmail}
                onChange={(e) => handleInputChange('newEmail', e.target.value)}
                label="Nuevo Email"
                error={fieldErrors.newEmail}
              />
            </div>
          </section>

          <div className="professional-profile-save-button-mobile-container">              
            <Button label={updateUserMutation.isPending ? 'Guardando...' : 'Guardar cambios'} className="w-full" onClick={handleSave} disabled={updateUserMutation.isPending || hasErrors || isFormEmpty} />
          </div>

          {successMessage && (
            <div className="profile-feedback profile-feedback--success">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="profile-feedback profile-feedback--error">{errorMessage}</div>
          )}
        </div>
        {showConfirm && (
          <AreYouSureModal
            title="Cambiar email"
            subTitle="¿Estás seguro que deseas cambiar tu dirección de email?"
            icon="/icons/envelope_w.svg"
            iconBackgroundColor="#FFD700"
            onAccept={handleConfirm}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
  );
}
