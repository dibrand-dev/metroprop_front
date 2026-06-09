'use client';

import { useEffect, useState } from 'react';
import './Profile.scss';
import InputField2 from '@/ui/InputField2/InputField2';
import { useAdminMenu } from '../../AdminLayoutClient';
import { useSession } from 'next-auth/react';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';

const iconEditPencil = "/icons/pencil.svg";
const iconArrowBack = "/icons/arrow.svg";

interface PropertyData {
  [key: string]: string;
}

const formatNumeric = (value: string): string => value.replace(/\D/g, '');

export default function Profile() {
  const { data: sessionData, update: updateSession } = useSession();
  const { showMenu, setShowMenu } = useAdminMenu();  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [properties, setProperties] = useState<any>({
    // Generales
    name: '',
    document: '',
    phone: '',
    phone_additional: '',
    phone_whatsapp: '',
    email: '',
    phone_whatsapp_available: ''
  });
  useEffect(() => {
    const userId = (sessionData?.user as any)?.id;
    if (!userId) return;

    apiFetch<any>(`${API_BASE_URL}/users/${userId}`)
      .then(data => {
        setProperties({
          ...data,
          phone_whatsapp_available: data.phone_whatsapp && data.phone_whatsapp !== '' ? "1" : "0",
        });
      })
      .catch(console.error);
  }, [sessionData]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const userId = (sessionData?.user as any)?.id;
      if (!userId) throw new Error('No user id');
      return apiFetch<any>(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        body: {
          name: data.name,
          phone: data.phone,
          phone_additional: data.phone_additional,
          phone_whatsapp: data.phone_whatsapp,
          document: data.document,
        },
      });
    },
    onSuccess: (data) => {
      updateSession({
        name: data.name,
        phone: data.phone,
        phone_additional: data.phone_additional,
        phone_whatsapp: data.phone_whatsapp,
        document: data.document,
      });
      setSuccessMessage('Usuario editado correctamente');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: () => {
      setErrorMessage('Error al guardar los cambios. Por favor intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const handleInputChange = (field: string, value: string) => {
    const nextValue = ['telefono', 'telefonoAdicional', 'numero'].includes(field)
      ? formatNumeric(value)
      : value;
    setProperties(prev => ({
      ...prev,
      [field]: nextValue
    }));
  };

  const handleSave = () => {
    updateUserMutation.mutate(properties);
  };
 console.log("sessionData", sessionData)
  return (
      <div className={`professional-profile-container ${showMenu ? 'mobile-hidden' : ''}`}>
        {/* Header */}
        <div className="professional-profile-header">
          <button className="professional-profile-back-button" onClick={() => setShowMenu(true)}>
            <img src={iconArrowBack} alt="Back"  />
          </button>
          <span className='professional-profile-title'>Datos</span>
        </div>
        <div className="profile-header">
          <div>
            <h1>Datos</h1>
          </div>
          <button className="professional-profile-save-button-header" onClick={handleSave} disabled={updateUserMutation.isPending}>
            {updateUserMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        {/* Main Content */}
        <div className={`professional-profile-content is-editing`}>
          {/* Generales Section */}
          <section className="professional-profile-section">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Personales</h2>              
            </div>

            {(sessionData?.user as any)?.role_id === 3 && (
              <div className="professional-profile-fields" >
                <InputField2
                  type="text"
                  placeholder="Identificador"
                  value={`Identificador: ${properties.id}`}
                  label="Id"
                  disabled={true}
                />
              </div>
            )}

            <div className="professional-profile-fields">
              <InputField2
                type="text"
                placeholder="Nombre"
                value={properties.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                label="Nombre"
              />
              <InputField2
                type="text"
                placeholder="Número de documento"
                value={properties.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                label="Número de documento"
              />               
            </div>
          </section>

          {/* Contacto Section */}
          <section className="professional-profile-section">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Contacto</h2>              
            </div>
            <div className="profile-section-description">
              Usamos estos datos para enviarte información y promociones, y para que puedan comunicarse con vos si publicás un aviso.
            </div>

            <div className="professional-profile-fields" >
              <InputField2
                type="email"
                placeholder="Email"
                value={properties.email}
                label="Email"
                disabled={true}
              />
            </div>
            <div className="professional-profile-fields">              
              <InputField2
                type="tel"
                placeholder="Número de teléfono"
                value={properties.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                label="Número de teléfono"
              />
              <InputField2
                type="tel"
                placeholder="Número de teléfono adicional"
                value={properties.phone_additional}
                onChange={(e) => handleInputChange('phone_additional', e.target.value)}
                label="Número de teléfono adicional"
              />       
            </div>
            <div className="professional-profile-fields">
              <div className="telefono-container">
                <InputField2
                  type="tel"
                  placeholder="Número de WhatsApp"
                  value={properties.phone_whatsapp}
                  onChange={(e) => handleInputChange('phone_whatsapp', e.target.value)}
                  label="Número de WhatsApp"
                  disabled={properties.phone_whatsapp_available === "0"}
                />
               <Checkbox label="Permitir contacto por WhatsApp" checked={properties.phone_whatsapp_available === "1"} onChange={(checked) => handleInputChange('phone_whatsapp_available', checked ? "1" : "0")} />
              </div> 
            </div>
          </section>
          {/* Save Button */}          
          <button className="professional-profile-save-button" onClick={handleSave} disabled={updateUserMutation.isPending}>
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
  );
}
