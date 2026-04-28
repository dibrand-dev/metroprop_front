'use client';

import { useEffect, useState } from 'react';
import './DeleteAccount.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession, signOut } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import InputField from '@/ui/InputField/InputField';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';

const iconArrowBack = "/icons/arrow.svg";

export default function DeleteAccount() {
  const { data: sessionData } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ password: '' });
  const [properties, setProperties] = useState<any>({
    password: ''
  });

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      const userId = (sessionData?.user as any)?.id;
      if (!userId) throw new Error('No user id');
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar la cuenta');
      return null;
    },
    onSuccess: () => {
      setSuccessMessage('Tu cuenta ha sido eliminada correctamente. Serás desconectado en 5 segundos...');
      setErrorMessage('');
      setTimeout(() => signOut({ callbackUrl: '/' }), 5000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Error al eliminar la cuenta. Por favor intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const handleInputChange = (field: string, value: string) => {
    const nextValue = value;
    const next = { ...properties, [field]: nextValue };
    setProperties(next);

    // Revalidate on change
    const errors = { password: '' };
    if (field === 'password' || next.password) {
      const pw = field === 'password' ? nextValue : next.password;
      if (pw && pw.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    setFieldErrors(errors);
  };

  const validate = (): boolean => {
    const errors = { password: '', newPassword: '', confirmPassword: '' };
    if (!properties.password) errors.password = 'Ingresa tu contraseña actual';
    else if (properties.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    setFieldErrors(errors);
    return !errors.password;
  };

  const hasErrors = !!fieldErrors.password;
  const isFormEmpty = !properties.password;

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    updateUserMutation.mutate();
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
          <span className='professional-profile-title'>Eliminar cuenta</span>
        </div>
        <div className="profile-header">
          <div>
            <h1>Eliminar cuenta</h1>
          </div>
          <button className="professional-profile-save-button-header" onClick={handleSave} disabled={updateUserMutation.isPending || hasErrors || isFormEmpty}>
            {updateUserMutation.isPending ? 'Eliminando...' : 'Eliminar cuenta'}
          </button>
        </div>

        {/* Main Content */}
        <div className={`professional-profile-content is-editing`}>
          <section className='section-warning'>
            <h2>Esta acción eliminará tus datos de forma permanente</h2>
            <ul>
              <li>Se perderán publicaciones activas</li>
              <li>Se eliminarán datos guardados (favoritos, borradores, historial)</li>
            </ul>
          </section>
          <section className="professional-profile-section">                     
            <div className="professional-profile-fields">
              <InputField
                type="password"
                placeholder="Contraseña"
                value={properties.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                label="Si deseas eliminar tu cuenta, ingresa tu contraseña actual"
                error={fieldErrors.password}
              />
            </div>
          </section>

          {/* Save Button */}          
          <button className="professional-profile-save-button" onClick={handleSave} disabled={updateUserMutation.isPending || hasErrors || isFormEmpty}>
            {updateUserMutation.isPending ? 'Eliminando...' : 'Eliminar cuenta'}
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
          title="Eliminar cuenta"
          text="¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
          icon="/icons/trash.svg"
          onAccept={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
