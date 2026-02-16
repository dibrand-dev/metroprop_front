'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishPropertyDescription.scss';

const iconBack = '/icons/arrow.svg';

const titleMax = 100;
const descriptionMax = 10000;
const descriptionMin = 150;

const tooltipTextPrimary =
  'Inclui tipo de propiedad, operacion, m2, ubicacion y un dato clave que destaque tu publicacion.';
const tooltipTextSecondary =
  'Detalla los ambientes, las caracteristicas destacadas y los alrededores. Separa la informacion en parrafos. Los emojis no se mostraran en el aviso.';

export default function PublishPropertyDescription() {
  const router = useRouter();
  const [title, setTitle] = useState('Departamento en alquiler de 100 m2 en Palermo');
  const [description, setDescription] = useState('Hermosa propiedad de 100m2');
  const [showTooltip, setShowTooltip] = useState(true);

  const titleCount = useMemo(() => title.length, [title]);
  const descriptionCount = useMemo(() => description.length, [description]);
  const showDescriptionError = descriptionCount > 0 && descriptionCount < descriptionMin;

  const handleBack = () => {
    router.push('/protected/publish/property-content');
  };

  const handleContinue = () => {
    router.push('/protected/publish/price');
  };

  return (
    <div className="publish-property-description">
      <div className="publish-property-description-inner">
        <div className="publish-property-description-card">
          <div className="publish-property-description-top">
            <div className="publish-property-description-route">
              <p>Venta - Casa Duplex</p>
              <p>Juncal 2345</p>
            </div>
            <button className="publish-property-description-link" type="button">
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
                <h1>Describi tu propiedad para atraer mas interesados</h1>
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
              <label>Titulo*</label>
              <input
                type="text"
                value={title}
                maxLength={titleMax}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Departamento en alquiler de 100 m2 en Palermo"
                className={title ? 'is-active' : ''}
              />
              <span className="publish-property-description-count">
                {titleCount}/{titleMax}
              </span>
            </div>

            <div className="publish-property-description-field">
              <label>Descripcion*</label>
              <textarea
                value={description}
                maxLength={descriptionMax}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Escribi una descripcion que detalle los ambientes de tu propiedad y sus principales beneficios"
                className={showDescriptionError ? 'is-error' : ''}
              />
              <div
                className={`publish-property-description-meta ${
                  showDescriptionError ? 'is-error' : ''
                }`}
              >
                <span>
                  La descripcion debe tener al menos {descriptionMin} caracteres
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
              <img src={iconBack} alt="" />
              Volver
            </button>
            <button
              className="publish-property-description-continue"
              type="button"
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
