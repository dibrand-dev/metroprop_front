'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishFinalReview.scss';

const iconBack = '/icons/arrow.svg';

const previewImages = [
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=400&fit=crop&sat=-50',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&h=400&fit=crop',
];

const featureItems = [
  { label: 'A estrenar', icon: '/icons/calendar.svg' },
  { label: 'Contrafrente', icon: '/icons/contrafrente.svg' },
  { label: 'N', icon: '/icons/orientacion.svg' },
  { label: '177 m2 tot.', icon: '/icons/regla.svg' },
  { label: '167 m2 cub', icon: '/icons/mcubiertos.svg' },
  { label: '5 amb.', icon: '/icons/door.svg' },
  { label: '1 cochera', icon: '/icons/cochera.svg' },
  { label: '4 dorm.', icon: '/icons/cama.svg' },
  { label: '3 banos', icon: '/icons/bano.svg' },
];

const amenityTabs = [
  { key: 'servicios', label: 'Servicios' },
  { key: 'ambientes', label: 'Ambientes' },
  { key: 'caracteristicas', label: 'Caracteristicas' },
];

const amenitiesByTab: Record<string, string[]> = {
  servicios: ['Ascensor', 'Balcon', 'Lavadero'],
  ambientes: ['Living comedor', 'Cocina integrada', 'Dormitorio principal'],
  caracteristicas: ['Piso de madera', 'Placares empotrados', 'Calefaccion'],
};

export default function PublishFinalReview() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('servicios');

  const handleBack = () => {
    router.push('/protected/publish/plans/post-purchase');
  };

  const handlePublish = () => {
    router.push('/protected/publish');
  };

  return (
    <div className="publish-review">
      <div className="publish-review-inner">
        <div className="publish-review-card">
          <div className="publish-review-top">
            <div className="publish-review-route">
              <p>Venta - Casa Duplex</p>
              <p>Juncal 2345</p>
            </div>
            <button className="publish-review-link" type="button">
              Guardar y salir
            </button>
          </div>

          <div className="publish-review-status">
            <span className="publish-review-segment is-filled" />
            <span className="publish-review-segment is-filled" />
            <span className="publish-review-segment is-filled" />
          </div>

          <div className="publish-review-section">
            <h1>Revision final del aviso y datos de contacto</h1>
            <h2>Vista previa</h2>

            <div className="publish-review-preview">
              <h3>Asi se vera tu publicacion</h3>

              <div className="publish-review-preview-card">
                <div className="publish-review-preview-hero">
                  <div className="publish-review-preview-status">
                    <span className="publish-review-status-dot" />
                    <span>En alquiler</span>
                  </div>
                  <div className="publish-review-preview-price">
                    <strong>$700.000</strong>
                    <span>$100.000 expensas</span>
                  </div>
                  <div className="publish-review-preview-meta">
                    <span>USD/m2 2500</span>
                    <span className="publish-review-info" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M11 11h2v6h-2z" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="publish-review-gallery">
                  <div className="publish-review-gallery-main">
                    <img src={previewImages[0]} alt="Vista principal" />
                  </div>
                  <div className="publish-review-gallery-grid">
                    {previewImages.slice(1).map((image, index) => (
                      <div key={image} className="publish-review-gallery-item">
                        <img src={image} alt={`Vista ${index + 2}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="publish-review-features">
                  {featureItems.map((item) => (
                    <div key={item.label} className="publish-review-feature">
                      <img src={item.icon} alt="" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="publish-review-summary">
                  <h4>Venta inmediata Cervino 5 ambientes, Palermo.</h4>
                  <p>
                    Se vende departamento 2 Ambientes con balcon al frente en Recoleta.
                    RECICLADO EN SU TOTALIDAD. PISO 7o AL FRENTE.
                    <br />
                    <br />
                    Este departamento cuenta con una superficie total de 41 m2.
                  </p>
                  <button type="button" className="publish-review-summary-toggle">
                    Leer descripcion completa
                    <img src="/icons/chevron-up.svg" alt="" />
                  </button>
                </div>

                <div className="publish-review-map">
                  <div className="publish-review-address">
                    <span className="publish-review-address-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M12 2c-4.4 0-8 3.6-8 8 0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <span>Avenida Cervino 4046, Palermo Chico, Palermo</span>
                  </div>
                  <div className="publish-review-map-image">
                    <img src="/images/mapa_google.png" alt="Mapa de ubicacion" />
                    <div className="publish-review-map-pin" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M12 2c-4.4 0-8 3.6-8 8 0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="publish-review-amenities">
                  <h4>Conoce mas sobre esta propiedad</h4>
                  <div className="publish-review-amenities-tabs">
                    {amenityTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`publish-review-amenities-tab ${
                          activeTab === tab.key ? 'is-active' : ''
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="publish-review-amenities-content">
                    {amenitiesByTab[activeTab].map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="publish-review-contact">
                <h3>Datos de contacto</h3>
                <p>Estos son los datos que veran los interesados</p>
                <div className="publish-review-contact-card">
                  <div className="publish-review-contact-logo">
                    <img src="/images/metropropLogo.png" alt="Metroprop" />
                  </div>
                  <div className="publish-review-contact-info">
                    <div className="publish-review-contact-name">Juan Perez</div>
                    <div className="publish-review-contact-phone">1159959324</div>
                    <div className="publish-review-contact-phone">4532-4871</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="publish-review-footer">
            <button className="publish-review-back" type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
              Volver
            </button>
            <button className="publish-review-continue" type="button" onClick={handlePublish}>
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
