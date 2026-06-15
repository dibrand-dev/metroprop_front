'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPropertyType.scss';
import { PropertyType, PropertySubtype, PROPERTY_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPES_BY_TYPE } from '@/types/propiedad';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';

const iconChevron = '/icons/chevron-up.svg';
const iconClose = '/icons/close.svg';

const propertyOptions: PropertyType[] = PROPERTY_TYPE_LABELS ? (Object.keys(PROPERTY_TYPE_LABELS) as unknown as PropertyType[]) : [];

interface PublishPropertyTypeProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PublishPropertyType({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishPropertyTypeProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyType | null>(
    wizardData.property_type || null
  );
  
  const [selectedSubtype, setSelectedSubtype] = useState<PropertySubtype | undefined>(
    wizardData.property_subtype || undefined
  );
  const [showError, setShowError] = useState(false);
  const showSubtypes = useMemo(() => Boolean(selectedProperty), [selectedProperty]);
  const subtypeOptions: PropertySubtype[] = PROPERTY_SUBTYPES_BY_TYPE[selectedProperty as PropertyType] || [];

  // Update wizard data when selections change
  useEffect(() => {
    if (selectedProperty) {
      updateWizardData({
        property_type: selectedProperty,
        property_subtype: selectedSubtype
      });
    }
  }, [selectedProperty, selectedSubtype, updateWizardData]);

  const handleContinue = () => {
    if (!selectedProperty) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onNext();
  };

  const handleBack = () => {
    onBack();
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
          <p className="publish-step-label">{wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''}</p>
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
              <h1>Seleccioná que tipo de propiedad deseás publicar</h1>
              <span>Datos obligatorios(*)</span>
            </div>

            <div className="publish-step-field">
              <p className="publish-step-field-label propiedad">Propiedad*</p>
              <div className="publish-chip-grid">
                {propertyOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`publish-chip ${
                      parseInt(selectedProperty as any)  === parseInt(option as any) ? 'publish-chip-active' : ''
                    }`}
                    onClick={() => {
                      setSelectedProperty(option);
                      setShowError(false);
                    }}
                  >
                    {PROPERTY_TYPE_LABELS[option]}
                  </button>
                ))}
              </div>             
            </div>
          </div>

          {showSubtypes && subtypeOptions.length ? (
            <div className="publish-step-section">
              <p className="publish-step-field-label">Subtipo de propiedad</p>
              <div className="publish-subtype-grid">
                {subtypeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`publish-chip ${
                      parseInt(selectedSubtype as any) === parseInt(option as any) ? 'publish-chip-active' : ''
                    }`}
                    onClick={() => setSelectedSubtype(option)}
                  >
                    {PROPERTY_SUBTYPE_LABELS[option]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="publish-step-footer">
            <button className="publish-back" type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <Button label="Continuar" variant="primary" onClick={handleContinue} disabled={!selectedProperty} />
          </div>
        </div>
      </div>
    </div>
  );
}