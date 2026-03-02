'use client';

import { useState, useEffect } from 'react';
import './PublishFinalReview.scss';

const iconChevron = '/icons/chevron-up.svg';

interface PublishFinalReviewProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

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

export default function PublishFinalReview({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishFinalReviewProps) {
  const [activeTab, setActiveTab] = useState(wizardData.finalReview?.activeTab || 'servicios');

  // Extract wizard data for display
  const operation = wizardData.operation || 'Operación';
  const propertyType = wizardData.propertyType || 'Tipo';
  const propertySubtype = wizardData.propertySubtype || '';
  const address = wizardData.location?.address || 'Dirección no especificada';
  const price = wizardData.price || {};
  const mainInfo = wizardData.mainInfo || {};
  const description = wizardData.description || {};
  const propertyContent = wizardData.propertyContent || {};

  // Format price display
  const formatPrice = (amount: string, currency: string) => {
    if (!amount) return '';
    return `${currency}${amount}`;
  };

  // Build property title
  const propertyTitle = description.title || `${operation} ${propertyType} ${propertySubtype} en ${wizardData.location?.district || 'zona'}`;
  
  // Build property features from wizard data
  const buildFeatures = () => {
    const features = [];
    
    if (mainInfo.antiquity) {
      if (mainInfo.antiquity === 'new') features.push({ label: 'A estrenar', icon: '/icons/calendar.svg' });
      if (mainInfo.antiquity === 'construction') features.push({ label: 'En construcción', icon: '/icons/calendar.svg' });
      if (mainInfo.antiquity === 'years' && mainInfo.antiquityYears) {
        features.push({ label: `${mainInfo.antiquityYears} años`, icon: '/icons/calendar.svg' });
      }
    }
    
    if (propertyContent.details?.orientation) {
      features.push({ label: propertyContent.details.orientation, icon: '/icons/orientacion.svg' });
    }
    
    if (mainInfo.surfaceTotal && mainInfo.totalUnit) {
      features.push({ label: `${mainInfo.surfaceTotal} ${mainInfo.totalUnit} tot.`, icon: '/icons/regla.svg' });
    }
    
    if (mainInfo.surfaceCovered && mainInfo.coveredUnit) {
      features.push({ label: `${mainInfo.surfaceCovered} ${mainInfo.coveredUnit} cub`, icon: '/icons/mcubiertos.svg' });
    }
    
    if (mainInfo.rooms?.ambientes) {
      features.push({ label: `${mainInfo.rooms.ambientes} amb.`, icon: '/icons/door.svg' });
    }
    
    if (mainInfo.rooms?.cocheras) {
      features.push({ label: `${mainInfo.rooms.cocheras} cochera${mainInfo.rooms.cocheras > 1 ? 's' : ''}`, icon: '/icons/cochera.svg' });
    }
    
    if (mainInfo.rooms?.dormitorios) {
      features.push({ label: `${mainInfo.rooms.dormitorios} dorm.`, icon: '/icons/cama.svg' });
    }
    
    if (mainInfo.rooms?.banos) {
      features.push({ label: `${mainInfo.rooms.banos} baño${mainInfo.rooms.banos > 1 ? 's' : ''}`, icon: '/icons/bano.svg' });
    }
    
    return features.length > 0 ? features : featureItems; // fallback to default
  };

  // Get amenities from wizard data
  const getAmenitiesByTab = () => {
    if (!propertyContent.selectedAmenities) return amenitiesByTab;
    
    const wizardAmenities: Record<string, string[]> = {
      servicios: [],
      ambientes: [],
      caracteristicas: [],
    };

    // Map wizard amenities to tabs
    Object.entries(propertyContent.selectedAmenities).forEach(([category, amenities]: [string, string[]]) => {
      if (category === 'services') {
        wizardAmenities.servicios = amenities || [];
      } else if (category === 'rooms') {
        wizardAmenities.ambientes = amenities || [];
      } else if (category === 'extras' || category === 'facilities') {
        wizardAmenities.caracteristicas = [...wizardAmenities.caracteristicas, ...(amenities || [])];
      }
    });

    // Fallback to default if no amenities
    Object.keys(wizardAmenities).forEach(key => {
      if (wizardAmenities[key].length === 0) {
        wizardAmenities[key] = amenitiesByTab[key] || [];
      }
    });

    return wizardAmenities;
  };

  const dynamicFeatures = buildFeatures();
  const dynamicAmenities = getAmenitiesByTab();

  // Update wizard data when final review data changes
  useEffect(() => {
    updateWizardData({
      finalReview: {
        activeTab,
      },
    });
  }, [activeTab, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handlePublish = () => {
    onNext();
  };

  return (
    <div className="publish-review">
      <div className="publish-review-inner">
        <div className="publish-review-card">
          <div className="publish-review-top">
            <div className="publish-review-route">
              {wizardData.operation} - {wizardData.propertyType} {wizardData.propertySubtype}<br />{wizardData.location?.address}
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
                <div>
                  <div className="publish-review-preview-hero">
                    <div className="publish-review-preview-status">
                      <span className="publish-review-status-dot" />
                      <span className='operacion'>En {operation.toLowerCase()}</span>
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
                  <div className="publish-review-preview-price">
                    <strong>
                      {formatPrice(price.rentAmount || '700.000', price.rentCurrency || '$')}
                    </strong>
                    {!price.withoutExpenses && (
                      <span>
                        {formatPrice(price.expenseAmount || '100.000', price.expenseCurrency || '$')} expensas
                      </span>
                    )}
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
                  {dynamicFeatures.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="publish-review-feature">
                      <img src={item.icon} alt="" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="publish-review-summary">
                  <h4>{propertyTitle}</h4>
                  <p>
                    {description.description || `Se ${operation.toLowerCase()} ${propertyType.toLowerCase()} de excelente calidad en ${wizardData.location?.district || 'zona exclusiva'}. Esta propiedad cuenta con una superficie total de ${mainInfo.surfaceTotal || '41'} ${mainInfo.totalUnit || 'm2'}.`}
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
                    <span>{address}</span>
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
                    {dynamicAmenities[activeTab]?.length > 0 ? (
                      dynamicAmenities[activeTab].map((item, index) => (
                        <span key={`${item}-${index}`}>{item}</span>
                      ))
                    ) : (
                      <span>No hay {activeTab} disponibles</span>
                    )}
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
              <img src={iconChevron} alt="" />
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
