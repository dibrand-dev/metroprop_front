'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishContent.scss';

const iconChevron = '/icons/chevron-up.svg';
const iconBack = '/icons/arrow.svg';
const iconTrash = '/icons/trash.svg';

const sampleImages = [
  '/images/home_comprar.png',
  '/images/home_alquilar.png',
  '/images/home_temporal.png',
  '/images/home_emprendimientos.png',
];

const accordionItems = [
  {
    id: 'videos',
    title: 'Videos',
    description: 'Agrega hasta 10 videos de la propiedad desde YouTube.',
  },
  {
    id: 'planos',
    title: 'Planos',
    description: 'Formato HEIC, JFIF, PNG, JPG, JPEG, WEBP, maximo 20 MB.',
  },
  {
    id: 'recorrido',
    title: 'Recorrido 360',
    description: 'Agrega un recorrido 360 para mostrar los detalles de la propiedad.',
  },
];

export default function PublishContent() {
  const router = useRouter();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [hasMedia, setHasMedia] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const uploadedImages = useMemo(() => (hasMedia ? sampleImages : []), [hasMedia]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
    setShowTooltip(true);
  };

  const handleBack = () => {
    router.push('/protected/publish/location');
  };

  const handleContinue = () => {
    router.push('/protected/publish/main-info');
  };

  const handleMockUpload = () => {
    setHasMedia(true);
  };

  return (
    <div className="publish-content">
      <div className="publish-content-inner">
        <div className="publish-content-card">
          <div className="publish-content-top">
            <div className="publish-content-route">
              <p>Venta - Casa Duplex</p>
              <p>Juncal 2345</p>
            </div>
            <button className="publish-content-link" type="button">
              Country y wifi
            </button>
          </div>

          <div className="publish-content-status">
            <span className="publish-content-segment is-filled" />
            <span className="publish-content-segment is-partial" />
            <span className="publish-content-segment" />
          </div>

          <div className="publish-content-section">
            <div className="publish-content-header">
              <h1>Carga las fotos y videos de la propiedad</h1>
              <div className="publish-content-required">
                <span>Datos obligatorios(*)</span>
                <button
                  type="button"
                  className={`publish-content-idea ${showTooltip ? 'is-active' : ''}`}
                  onClick={() => setShowTooltip((prev) => !prev)}
                  aria-label="Ver recomendacion"
                >
                  ?
                </button>
              </div>
              {showTooltip ? (
                <div className="publish-content-tooltip">
                  <p>
                    Recomendacion: subi fotos claras y horizontales. No incluyas
                    datos personales en las imagenes.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="publish-content-field">
              <div className="publish-content-field-title">
                <h2>Fotos*</h2>
                <p>Formato JPG, JPEG, WEBP, maximo 20 MB.</p>
              </div>

              <div className="publish-content-upload">
                {uploadedImages.length === 0 ? (
                  <button
                    type="button"
                    className="publish-content-upload-card"
                    onClick={handleMockUpload}
                  >
                    <span className="publish-content-upload-icon">+</span>
                    <span>Agregar foto</span>
                  </button>
                ) : (
                  <div className="publish-content-upload-grid">
                    <button
                      type="button"
                      className="publish-content-upload-card"
                      onClick={handleMockUpload}
                    >
                      <span className="publish-content-upload-icon">+</span>
                      <span>Agregar foto</span>
                    </button>
                    {uploadedImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="publish-content-thumb">
                        <img src={image} alt="Foto" />
                        <button type="button" className="publish-content-thumb-action">
                          <img src={iconTrash} alt="" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="publish-content-field">
              <div className="publish-content-field-title">
                <h2>Agrega mas contenido</h2>
              </div>
              <div className="publish-content-accordion">
                {accordionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`publish-content-accordion-item ${
                      openAccordion === item.id ? 'is-open' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="publish-content-accordion-header"
                      onClick={() => toggleAccordion(item.id)}
                    >
                      <span>{item.title}</span>
                      <img src={iconChevron} alt="" />
                    </button>
                    {openAccordion === item.id ? (
                      <div className="publish-content-accordion-body">
                        <p>{item.description}</p>
                        {item.id === 'videos' ? (
                          <div className="publish-content-input-row">
                            <input
                              type="text"
                              placeholder="Pega el link de YouTube"
                              value={videoUrl}
                              onChange={(event) => setVideoUrl(event.target.value)}
                            />
                            <button type="button" onClick={handleMockUpload}>
                              Agregar
                            </button>
                          </div>
                        ) : null}
                        {item.id !== 'videos' ? (
                          <div className="publish-content-upload-grid compact">
                            <button
                              type="button"
                              className="publish-content-upload-card"
                              onClick={handleMockUpload}
                            >
                              <span className="publish-content-upload-icon">+</span>
                              <span>Agregar</span>
                            </button>
                            {uploadedImages.slice(0, 2).map((image, index) => (
                              <div
                                key={`${item.id}-${index}`}
                                className="publish-content-thumb"
                              >
                                <img src={image} alt="Contenido" />
                                <button
                                  type="button"
                                  className="publish-content-thumb-action"
                                >
                                  <img src={iconTrash} alt="" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="publish-content-footer">
            <button className="publish-content-back" type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
              Volver
            </button>
            <button className="publish-content-continue" type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
