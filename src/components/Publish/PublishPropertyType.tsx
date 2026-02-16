'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishPropertyType.scss';

const iconChevron = '/icons/chevron-up.svg';
const iconBack = '/icons/arrow.svg';
const iconClose = '/icons/close.svg';

const propertyOptions = ['Casa', 'Departamento', 'Terreno', 'PH'];

const subtypeOptions = [
  'Barrio con acceso...',
  'Bungalow',
  'Cabana',
  'Casa de playa',
  'Chalet',
  'Condominio',
  'Duplex',
  'PH',
  'Prefabricada',
  'Triplex',
];

export default function PublishPropertyType() {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>('Duplex');
  const [showError, setShowError] = useState(false);

  const showSubtypes = useMemo(() => Boolean(selectedProperty), [selectedProperty]);

  const handleContinue = () => {
    if (!selectedProperty) {
      setShowError(true);
      return;
    }

    setShowError(false);
    router.push('/protected/publish/location');
  };

  const handleBack = () => {
    router.push('/protected/publish');
  };

  return (
    <div className="publish-step">
      <div className="publish-step-inner">
        {showError ? (
          <div className="publish-error">
            <span>Selecciona una propiedad para continuar</span>
            <button
              type="button"
              className="publish-error-close"
              aria-label="Cerrar"
              onClick={() => setShowError(false)}
            >
              <img src={iconClose} alt="" />
            </button>
          </div>
        ) : null}

        <div className="publish-step-card">
          <p className="publish-step-label">Venta</p>
          <div className="publish-status-bar">
            <div className="publish-status-track">
              <span className="publish-status-segment" />
              <span className="publish-status-segment" />
              <span className="publish-status-segment" />
              <span className="publish-status-fill" />
            </div>
          </div>

          <div className="publish-step-section">
            <div className="publish-step-title">
              <h1>Selecciona que tipo de propiedad deseas publicar</h1>
              <span>Datos obligatorios(*)</span>
            </div>

            <div className="publish-step-field">
              <p className="publish-step-field-label">Propiedad*</p>
              <div className="publish-chip-grid">
                {propertyOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`publish-chip ${
                      selectedProperty === option ? 'publish-chip-active' : ''
                    }`}
                    onClick={() => {
                      setSelectedProperty(option);
                      setShowError(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button className="publish-more" type="button">
                Ver mas
                <img src={iconChevron} alt="" />
              </button>
            </div>
          </div>

          {showSubtypes ? (
            <div className="publish-step-section">
              <p className="publish-step-field-label">Subtipo de propiedad</p>
              <div className="publish-subtype-grid">
                {subtypeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`publish-chip ${
                      selectedSubtype === option ? 'publish-chip-active' : ''
                    }`}
                    onClick={() => setSelectedSubtype(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="publish-step-footer">
            <button className="publish-back" type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
              Volver
            </button>
            <button className="publish-continue" type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
