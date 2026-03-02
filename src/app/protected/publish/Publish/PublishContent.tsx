'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishContent.scss';
import Button from '@/ui/Button/Button';
import InputField from '@/ui/InputField/InputField';

const iconChevron = '/icons/chevron-up.svg';
const iconTrash = '/icons/trash.svg';
const iconUpload = '/icons/upload.svg';

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

interface PublishContentProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PublishContent({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishContentProps) {
  const [openAccordions, setOpenAccordions] = useState<string[]>(wizardData.content?.openAccordions || []);
  const [hasMedia, setHasMedia] = useState(wizardData.content?.hasMedia || false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [videoUrl, setVideoUrl] = useState(wizardData.content?.videoUrl || '');
  const [recorridoUrl, setRecorridoUrl] = useState(wizardData.content?.recorridoUrl || '');

  const uploadedImages = useMemo(() => (hasMedia ? sampleImages : []), [hasMedia]);

  // Update wizard data when content data changes
  useEffect(() => {
    updateWizardData({
      content: {
        hasMedia,
        videoUrl,
        recorridoUrl,
        openAccordions,
      },
    });
  }, [hasMedia, videoUrl, recorridoUrl, openAccordions, updateWizardData]);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((accordionId) => accordionId !== id);
      } else {
        return [...prev, id];
      }
    });
    setShowTooltip(true);
  };

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext();
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
              {wizardData.operation} - {wizardData.propertyType} {wizardData.propertySubtype}<br />{wizardData.location?.address}
            </div>
            <Button
              label="Guardar y salir"
              variant="text"
              onClick={() => {}}
            />
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
                    <img src={iconUpload} alt="" />
                    <span>Agregar fotos</span>
                  </button>
                ) : (
                  <div className="publish-content-upload-grid">
                    <button
                      type="button"
                      className="publish-content-upload-card"
                      onClick={handleMockUpload}
                    >
                      <img src={iconUpload} alt="" />
                      <span>Agregar fotos</span>
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
                      openAccordions.includes(item.id) ? 'is-open' : ''
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
                    {openAccordions.includes(item.id) ? (
                      <div className="publish-content-accordion-body">
                        <p>{item.description}</p>
                        {item.id === 'videos' ? (
                          <div className="publish-content-input-row">
                            <InputField                              
                              placeholder="Pega el link de YouTube"
                              value={videoUrl}
                              onChange={(event) => setVideoUrl(event.target.value)}
                            />
                            <Button
                              label="Agregar"
                              variant="primary"
                              buttonType="1"
                              onClick={handleMockUpload}
                            />
                          </div>
                        ) : null}
                        {item.id === 'recorrido' ? (
                          <div className="publish-content-input-row">
                            <InputField
                              placeholder="Copiá y pegá la URL del recorrido acá"
                              value={recorridoUrl}
                              onChange={(event) => setRecorridoUrl(event.target.value)}
                            />
                            <Button
                              label="Agregar"
                              variant="primary"
                              buttonType="1"
                              onClick={handleMockUpload}
                            />
                          </div>
                        ) : null}
                        {item.id !== 'videos' && item.id !== 'recorrido' ? (
                          <div className="publish-content-upload-grid compact">
                            <button
                              type="button"
                              className="publish-content-upload-card"
                              onClick={handleMockUpload}
                            >
                              <img src={iconUpload} alt="" />
                              <span>Agregar planos</span>
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
            <Button
              label="Volver"
              variant="back"
              onClick={handleBack}
              icon={<img src={iconChevron} alt="" />}
              iconPosition="left"
              className="publish-content-back"
            />
            <Button
              label="Continuar"
              variant="primary"
              onClick={handleContinue}
              className="publish-content-continue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
