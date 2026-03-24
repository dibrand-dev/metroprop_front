'use client';

import { useEffect, useState } from 'react';
import './ProfessionalProfile.scss';
import InputField2 from '@/ui/InputField2/InputField2';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession } from 'next-auth/react';

const iconEditPencil = "/icons/pencil.svg";
const iconArrowBack = "/icons/arrow.svg";

interface PropertyData {
  [key: string]: string;
}

const formatNumeric = (value: string): string => value.replace(/\D/g, '');

export default function ProfessionalProfile() {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [activeSection, setActiveSection] = useState<'generales' | 'ubicacion' | 'descripcion'>('generales');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [properties, setProperties] = useState<any>({
    // Generales
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    telefonoAdicional: '',
    // Ubicación
    provincia: '',
    ciudad: '',
    calle: '',
    numero: '',
    // Descripción
    descripcion: '',
  });
  useEffect(() => {   
    sessionData?.user && setProperties(sessionData);
  }, [sessionData]);

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
    console.log('Saving properties:', properties);
    setIsEditing(false);
  };

  const handleEditSection = (section: 'generales' | 'ubicacion' | 'descripcion') => {
    setActiveSection(section);
    setIsEditing(true);
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
          <span className='professional-profile-title'>Datos de inmobiliaria</span>
        </div>

        <h1 className='professional-profile-title'>Datos de inmobiliaria</h1>

        {/* Main Content */}
        <div className={`professional-profile-content ${isEditing ? 'is-editing' : ''}`}>
          {/* Generales Section */}
          <section className="professional-profile-section">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Generales</h2>
              <button
                className="professional-profile-edit-button"
                onClick={() => handleEditSection('generales')}
              >
                <img src={iconEditPencil} alt="Edit" />
              </button>
            </div>

            <div className="professional-profile-identifier">
              <div className="professional-profile-identifier-text">
                <p className="professional-profile-label">Identificador:</p>
                <p className="professional-profile-value">300090404</p>
              </div>
            </div>

            <div className="professional-profile-fields">
              <InputField2
                type="email"
                placeholder="Correo electrónico"
                value={properties.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Correo electrónico"
              />
              <InputField2
                type="text"
                placeholder="Nombre"
                value={properties.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Nombre"
              />
              <InputField2
                type="text"
                placeholder="Apellido"
                value={properties.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Apellido"
              />
              <InputField2
                type="tel"
                placeholder="Teléfono"
                value={properties.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Teléfono"
              />
              <InputField2
                type="tel"
                placeholder="Teléfono adicional"
                value={properties.telefonoAdicional}
                onChange={(e) => handleInputChange('telefonoAdicional', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Teléfono adicional"
              />
            </div>
          </section>

          <hr className="professional-profile-divider" />

          {/* Ubicación Section */}
          <section className="professional-profile-section">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Ubicación</h2>
              <button
                className="professional-profile-edit-button"
                onClick={() => handleEditSection('ubicacion')}
              >
                <img src={iconEditPencil} alt="Edit" />
              </button>
            </div>

            <div className="professional-profile-fields">
              <InputField2
                type="text"
                placeholder="Provincia"
                value={properties.provincia}
                onChange={(e) => handleInputChange('provincia', e.target.value)}
                disabled={!(isEditing && activeSection === 'ubicacion')}
                label="Provincia"
              />
              <InputField2
                type="text"
                placeholder="Ciudad"
                value={properties.ciudad}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                disabled={!(isEditing && activeSection === 'ubicacion')}
                label="Ciudad"
              />
              <InputField2
                type="text"
                placeholder="Calle"
                value={properties.calle}
                onChange={(e) => handleInputChange('calle', e.target.value)}
                disabled={!(isEditing && activeSection === 'ubicacion')}
                label="Calle"
              />
              <InputField2
                type="text"
                placeholder="Número"
                value={properties.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                disabled={!(isEditing && activeSection === 'ubicacion')}
                label="Número"
              />
            </div>
          </section>

          <hr className="professional-profile-divider" />

          {/* Descripción Section */}
          <section className="professional-profile-section descripcion">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Descripción</h2>
              <button
                className="professional-profile-edit-button"
                onClick={() => handleEditSection('descripcion')}
              >
                <img src={iconEditPencil} alt="Edit" />
              </button>
            </div>

            <InputField2
              multiline={true}
              rows={5}
              placeholder="Descripción"
              value={properties.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              disabled={!(isEditing && activeSection === 'descripcion')}
              label="Descripción"
            />
          </section>

          {/* Save Button */}
          {isEditing && (
            <button className="professional-profile-save-button" onClick={handleSave}>
              Guardar cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
