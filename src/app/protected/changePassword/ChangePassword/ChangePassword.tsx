'use client';

import { useEffect, useState } from 'react';
import './ChangePassword.scss';
import InputField2 from '@/ui/InputField2/InputField2';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession } from 'next-auth/react';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import InputField from '@/ui/InputField/InputField';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import { apiFetch } from '@/lib/apiFetch';

const iconEditPencil = "/icons/pencil.svg";
const iconArrowBack = "/icons/arrow.svg";

interface PropertyData {
  [key: string]: string;
}

const formatNumeric = (value: string): string => value.replace(/\D/g, '');

export default function ChangePassword() {
  const { data: sessionData } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ password: '', newPassword: '', confirmPassword: '' });
  const [properties, setProperties] = useState<any>({
    // Generales
    newPassword: '',
    confirmPassword: ''
  });
  useEffect(() => {  
    if (sessionData?.user) {
      const data = sessionData.user;
      setProperties({
        ...data,
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [sessionData]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const userId:number = (sessionData?.user as any)?.id;
      if (!userId) throw new Error('No user id');
      const result = await apiFetch<any>(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        body: {
          id: parseInt(userId.toString()),
          oldPassword: data.password,
          newPassword: data.newPassword,
        },
      });
      if (!result.success) throw new Error(result.message || 'Error al cambiar la contraseña');
      return result;
    },
    onSuccess: (result) => {
      setSuccessMessage(result.message || 'Contraseña cambiada correctamente');
      setErrorMessage('');
      setProperties((prev: any) => ({ ...prev, password: '', newPassword: '', confirmPassword: '' }));
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Error al guardar los cambios. Por favor intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const handleInputChange = (field: string, value: string) => {
    const nextValue = value;
    const next = { ...properties, [field]: nextValue };
    setProperties(next);

    // Revalidate on change
    const errors = { password: '', newPassword: '', confirmPassword: '' };
    if (field === 'password' || next.password) {
      const pw = field === 'password' ? nextValue : next.password;
      if (pw && pw.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (field === 'newPassword' || next.newPassword) {
      const npw = field === 'newPassword' ? nextValue : next.newPassword;
      if (npw && npw.length < 6) errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (field === 'confirmPassword' || next.confirmPassword) {
      const cpw = field === 'confirmPassword' ? nextValue : next.confirmPassword;
      const npw = field === 'newPassword' ? nextValue : next.newPassword;
      if (cpw && npw && cpw !== npw) errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setFieldErrors(errors);
  };

  const validate = (): boolean => {
    const errors = { password: '', newPassword: '', confirmPassword: '' };
    if (!properties.password) errors.password = 'Ingresa tu contraseña actual';
    else if (properties.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (!properties.newPassword) errors.newPassword = 'Ingresa la nueva contraseña';
    else if (properties.newPassword.length < 6) errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    if (!properties.confirmPassword) errors.confirmPassword = 'Repite la nueva contraseña';
    else if (properties.newPassword !== properties.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    setFieldErrors(errors);
    return !errors.password && !errors.newPassword && !errors.confirmPassword;
  };

  const hasErrors = !!(fieldErrors.password || fieldErrors.newPassword || fieldErrors.confirmPassword);
  const isFormEmpty = !properties.password && !properties.newPassword && !properties.confirmPassword;

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
          <span className='professional-profile-title'>Cambiar Contraseña</span>
        </div>
        <div className="profile-header">
          <div>
            <h1>Cambiar Contraseña</h1>
          </div>
          <button className="professional-profile-save-button-header" onClick={handleSave} disabled={updateUserMutation.isPending || hasErrors || isFormEmpty}>
            {updateUserMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Main Content */}
        <div className={`professional-profile-content is-editing`}>
          {/* Generales Section */}
          <section className="professional-profile-section">                     
            <div className="professional-profile-fields">
              <InputField
                type="password"
                placeholder="Contraseña Actual"
                value={properties.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                label="Contraseña Actual"
                error={fieldErrors.password}
              />
            </div>
            <div className="professional-profile-fields">
              <InputField
                type="password"
                placeholder="Contraseña Nueva"
                value={properties.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                label="Contraseña Nueva"
                error={fieldErrors.newPassword}
              />
              <InputField
                type="password"
                placeholder="Repetir Contraseña Nueva"
                value={properties.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                label={"\u00A0"}
                error={fieldErrors.confirmPassword}
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
          title="Cambiar contraseña"
          text="¿Estás seguro que deseas cambiar tu contraseña?"
          icon="/icons/lock.svg"
          onAccept={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
