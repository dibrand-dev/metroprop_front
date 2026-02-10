'use client';

import { useState } from 'react';
import Image from 'next/image';
import './ProfessionalProfile.scss';
import InputField from '@/ui/InputField/InputField';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';

const iconEditPencil = "/icons/pencil.svg";
const iconArrowBack = "/icons/arrow.svg";

interface PropertyData {
  [key: string]: string;
}

export default function ProfessionalProfile() {
  const [activeSection, setActiveSection] = useState<'generales' | 'ubicacion' | 'descripcion'>('generales');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [properties, setProperties] = useState<PropertyData>({
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

  const handleInputChange = (field: string, value: string) => {
    setProperties(prev => ({
      ...prev,
      [field]: value
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
    <div className="professionalContainer" style={!showMenu ? { background: 'white' } : {}}>
      <Submenu active={showMenu} />
      <div className={`professional-profile-container ${showMenu ? 'mobile-hidden' : ''}`}>
        {/* Header */}
        <div className="professional-profile-header">
          <button className="professional-profile-back-button" onClick={() => setShowMenu(true)}>
            <img src={iconArrowBack} alt="Back"  />
            <span>Datos de inmobiliaria</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="professional-profile-content">
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
              <div className="professional-profile-identifier-logo">
                <div className="professional-profile-logo-placeholder"></div>
              </div>
            </div>

            <div className="professional-profile-fields">
              <InputField
                type="email"
                placeholder="Correo electrónico"
                value={properties.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                label=""
              />
              <InputField
                type="text"
                placeholder="Nombre"
                value={properties.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                disabled={!isEditing}
                label=""
              />
              <InputField
                type="text"
                placeholder="Apellido"
                value={properties.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                disabled={!isEditing}
                label=""
              />
              <InputField
                type="tel"
                placeholder="Teléfono"
                value={properties.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                disabled={!isEditing}
                label=""
              />
              <InputField
                type="tel"
                placeholder="Teléfono adicional"
                value={properties.telefonoAdicional}
                onChange={(e) => handleInputChange('telefonoAdicional', e.target.value)}
                disabled={!isEditing}
                label=""
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
              <InputField
                type="text"
                placeholder="Provincia"
                value={properties.provincia}
                onChange={(e) => handleInputChange('provincia', e.target.value)}
                disabled={!isEditing}
                label=""
              />
              <InputField
                type="text"
                placeholder="Ciudad"
                value={properties.ciudad}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                disabled={!isEditing}
                label=""
              />
              <InputField
                type="text"
                placeholder="Calle"
                value={properties.calle}
                onChange={(e) => handleInputChange('calle', e.target.value)}
                disabled={!isEditing}
                label=""
              />
              <InputField
                type="text"
                placeholder="Número"
                value={properties.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                disabled={!isEditing}
                label=""
              />
            </div>
          </section>

          <hr className="professional-profile-divider" />

          {/* Descripción Section */}
          <section className="professional-profile-section">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Descripción</h2>
              <button
                className="professional-profile-edit-button"
                onClick={() => handleEditSection('descripcion')}
              >
                <img src={iconEditPencil} alt="Edit" />
              </button>
            </div>

            <textarea
              className="professional-profile-textarea"
              placeholder="Descripción"
              value={properties.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              disabled={!isEditing}
            ></textarea>
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
