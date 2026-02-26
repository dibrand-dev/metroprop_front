'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishLocation.scss';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';

const iconChevron = '/icons/chevron-up.svg';
const iconBack = '/icons/arrow.svg';
const iconClose = '/icons/close.svg';
const mapImage = '/images/mapa_google.png';

interface PublishLocationProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PublishLocation({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishLocationProps) {
  const [address, setAddress] = useState(wizardData.location?.address || '');
  const [province, setProvince] = useState<string | null>(wizardData.location?.province || null);
  const [city, setCity] = useState<string | null>(wizardData.location?.city || null);
  const [district, setDistrict] = useState<string | null>(wizardData.location?.district || null);
  const [zone, setZone] = useState<string | null>(wizardData.location?.zone || null);
  const [postalCode, setPostalCode] = useState(wizardData.location?.postalCode || '');
  const [showExactLocation, setShowExactLocation] = useState(
    wizardData.location?.showExactLocation !== undefined ? wizardData.location.showExactLocation : true
  );

  const hasAddress = useMemo(() => address.trim().length > 0, [address]);
  const showMapPreview = hasAddress;

  // Update wizard data when location data changes
  useEffect(() => {
    updateWizardData({
      location: {
        address,
        province,
        city,
        district,
        zone,
        postalCode,
        showExactLocation,
      },
    });
  }, [address, province, city, district, zone, postalCode, showExactLocation, updateWizardData]);

  const handleSelectDemo = () => {
    setProvince('Capital Federal');
    setCity('CABA');
    setDistrict('Palermo');
    setZone('Zona Norte');
  };

  const handleClearSelect = (setter: (value: string | null) => void) => {
    setter(null);
  };

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="publish-location">
      <div className="publish-location-inner">
        <div className="publish-location-card">
          <div className="publish-location-top">
            <p className="publish-location-label">Venta - Casa Duplex</p>
            <button className="publish-location-link" type="button">
              Country y wifi
            </button>
          </div>

          <div className="publish-location-status">
            <div className="publish-location-track">
              <span className="publish-location-segment" />
              <span className="publish-location-segment" />
              <span className="publish-location-segment" />
              <span className="publish-location-fill" />
            </div>
          </div>

          <div className={`publish-location-section ${showMapPreview ? 'with-divider' : ''}`}>
            <div className="publish-location-title">
              <h1>Ingresa la ubicacion de la propiedad</h1>
              <span className={showMapPreview ? 'hide-desktop' : ''}>Datos obligatorios(*)</span>
            </div>

            <div className="publish-location-fields">
              <div className="publish-location-field">
                <label>Calle y numero*</label>
                <input
                  type="text"
                  placeholder="Escribi la calle y numero"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className={address ? 'is-active' : ''}
                />
              </div>

              <div className="publish-location-row">
                <div className="publish-location-field">
                  <label className={hasAddress ? '' : 'is-muted'}>Provincia*</label>
                  <button
                    type="button"
                    className={`publish-location-select ${province ? 'is-selected' : ''} ${
                      hasAddress ? '' : 'is-disabled'
                    }`}
                    onClick={hasAddress ? handleSelectDemo : undefined}
                  >
                    {province ? (
                      <span className="publish-location-chip">
                        {province}
                        <button
                          type="button"
                          className="publish-location-chip-close"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClearSelect(setProvince);
                          }}
                        >
                          <img src={iconClose} alt="" />
                        </button>
                      </span>
                    ) : (
                      'Seleccionar'
                    )}
                    <img src={iconChevron} alt="" />
                  </button>
                </div>

                <div className="publish-location-field">
                  <label className={hasAddress ? '' : 'is-muted'}>Ciudad*</label>
                  <button
                    type="button"
                    className={`publish-location-select ${city ? 'is-selected' : ''} ${
                      hasAddress ? '' : 'is-disabled'
                    }`}
                    onClick={hasAddress ? handleSelectDemo : undefined}
                  >
                    {city ? (
                      <span className="publish-location-chip">
                        {city}
                        <button
                          type="button"
                          className="publish-location-chip-close"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClearSelect(setCity);
                          }}
                        >
                          <img src={iconClose} alt="" />
                        </button>
                      </span>
                    ) : (
                      'Seleccionar'
                    )}
                    <img src={iconChevron} alt="" />
                  </button>
                </div>
              </div>

              <div className="publish-location-row">
                <div className="publish-location-field">
                  <label className={hasAddress ? '' : 'is-muted'}>Barrio</label>
                  <button
                    type="button"
                    className={`publish-location-select ${district ? 'is-selected' : ''} ${
                      hasAddress ? '' : 'is-disabled'
                    }`}
                    onClick={hasAddress ? handleSelectDemo : undefined}
                  >
                    {district ? (
                      <span className="publish-location-chip">
                        {district}
                        <button
                          type="button"
                          className="publish-location-chip-close"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClearSelect(setDistrict);
                          }}
                        >
                          <img src={iconClose} alt="" />
                        </button>
                      </span>
                    ) : (
                      'Seleccionar'
                    )}
                    <img src={iconChevron} alt="" />
                  </button>
                </div>

                <div className="publish-location-field">
                  <label className={hasAddress ? '' : 'is-muted'}>Zona</label>
                  <button
                    type="button"
                    className={`publish-location-select ${zone ? 'is-selected' : ''} ${
                      hasAddress ? '' : 'is-disabled'
                    }`}
                    onClick={hasAddress ? handleSelectDemo : undefined}
                  >
                    {zone ? (
                      <span className="publish-location-chip">
                        {zone}
                        <button
                          type="button"
                          className="publish-location-chip-close"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleClearSelect(setZone);
                          }}
                        >
                          <img src={iconClose} alt="" />
                        </button>
                      </span>
                    ) : (
                      'Seleccionar'
                    )}
                    <img src={iconChevron} alt="" />
                  </button>
                </div>
              </div>

              {showMapPreview ? (
                <div className="publish-location-field publish-location-postal">
                  <label>Codigo postal</label>
                  <input
                    type="text"
                    placeholder="Escribi el codigo postal"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {showMapPreview ? (
            <div className="publish-location-preview">
              <div className="publish-location-preview-header">
                <h2>Vista previa del aviso</h2>
                <div className="publish-location-toggle">
                  <span>Mostrar la ubicacion exacta</span>
                  <SwitchToggle
                    checked={showExactLocation}
                    onChange={setShowExactLocation}
                    ariaLabel="Mostrar ubicacion exacta"
                  />
                </div>
              </div>

              <div className="publish-location-map">
                <img src={mapImage} alt="Mapa" />
                <div className="publish-location-map-note">
                  <p>Arrastra el marcador para ajustar la ubicacion</p>
                  <button type="button" aria-label="Cerrar">
                    <img src={iconClose} alt="" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="publish-location-footer">
            <button className="publish-location-back" type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
              Volver
            </button>
            <button className="publish-location-continue" type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
