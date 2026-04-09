'use client';

import { useState, useMemo, useEffect } from 'react';
import './PublishPropertyDescription.scss';
import InputField from '@/ui/InputField/InputField';
import { CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';

const iconChevron = '/icons/chevron-up.svg';

const titleMax = 100;
const descriptionMax = 10000;
const descriptionMin = 150;

const tooltipTextPrimary =
  'Inclui tipo de propiedad, operacion, m2, ubicacion y un dato clave que destaque tu publicacion.';
const tooltipTextSecondary =
  'Detalla los ambientes, las caracteristicas destacadas y los alrededores. Separa la informacion en parrafos. Los emojis no se mostraran en el aviso.';

interface PublishPropertyDescriptionProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (descriptionData: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: (descriptionData: Partial<CreatePropertyDraft>) => void;
}

export default function PublishPropertyDescription({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit
}: PublishPropertyDescriptionProps) {
  const [title, setTitle] = useState(wizardData.publication_title || '');
  const [description, setDescription] = useState(wizardData.description || '');
  const [showTooltip, setShowTooltip] = useState(true);

  const titleCount = useMemo(() => title.length, [title]);
  const descriptionCount = useMemo(() => description.length, [description]);
  const showDescriptionError = descriptionCount >= 0 && descriptionCount < descriptionMin && descriptionCount > 0;

  // Update wizard data when description data changes
  useEffect(() => {
    updateWizardData({
      publication_title: title,
      description: description,
    });
  }, [title, description, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext({
      publication_title: title,
      description: description,
    });
  };

  return (
    <div className="publish-property-description">
      <div className="publish-property-description-inner">
        <div className="publish-property-description-card">
          <div className="publish-property-description-top">
            <div className="publish-property-description-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} {wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-property-description-link" type="button" onClick={onSaveAndExit}>
              Guardar y salir
            </button>
          </div>

          <div className="publish-property-description-status">
            <span className="publish-property-description-segment is-filled" />
            <span className="publish-property-description-segment is-filled" />
            <span className="publish-property-description-segment" />
          </div>

          <div className="publish-property-description-section">
            <div className="publish-property-description-header">
              <div className="publish-property-description-title">
                <h1>Describí tu propiedad para atraer mas interesados</h1>
                <span>Datos obligatorios(*)</span>
              </div>
              <button
                className={`publish-property-description-idea ${showTooltip ? 'is-active' : ''}`}
                type="button"
                onClick={() => setShowTooltip((prev) => !prev)}
                aria-label="Idea"
              >
                ?
              </button>
              {showTooltip ? (
                <div className="publish-property-description-tooltip">
                  <p>{tooltipTextPrimary}</p>
                  <p>{tooltipTextSecondary}</p>
                </div>
              ) : null}
            </div>

            <div className="publish-property-description-field">
              <InputField
                label="Título*"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Departamento en alquiler de 100 m2 en Palermo"
                maxLength={titleMax}
                required
              />
              <span className="publish-property-description-count">
                {titleCount}/{titleMax}
              </span>
            </div>

            <div className="publish-property-description-field">
              <InputField
                label="Descripción*"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Escribí una descripción que detalle los ambientes de tu propiedad y sus principales beneficios"
                maxLength={descriptionMax}
                multiline
                rows={6}
                error={showDescriptionError ? `La descripción debe tener al menos ${descriptionMin} caracteres` : undefined}
                required
              />
              <div className="publish-property-description-meta" >
                <span style={{ display: showDescriptionError ? 'none' : 'block' }}>
                  La descripción debe tener al menos {descriptionMin} caracteres
                </span>
                <span>
                  {descriptionCount}/{descriptionMax}
                </span>
              </div>
            </div>
          </div>

          <div className="publish-property-description-footer">
            <button
              className="publish-property-description-back"
              type="button"
              onClick={handleBack}
            >
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <button
              className="publish-property-description-continue"
              type="button"
              onClick={handleContinue}
              disabled={!title.trim()}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
