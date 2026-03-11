'use client';

import { useState, useEffect } from 'react';
import './PublishFinalReview.scss';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, CreatePropertyDraft, OPERATION_TYPE_LABELS, ORIENTATION_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import { AWS_S3_BUCKET_URL } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';

const iconChevron = '/icons/chevron-up.svg';

interface PublishFinalReviewProps {
  wizardData: CreatePropertyDraft;
  onNext: (data: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: () => void;
}

const previewImage = 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&h=800&fit=crop';

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

export default function PublishFinalReview({
  wizardData,
  onNext,
  onBack,
  onSaveAndExit
}: PublishFinalReviewProps) {
const [activeTab, setActiveTab] = useState<string>('');
  const address = wizardData.street || 'Dirección no especificada';
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
  
  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/tags`);
      if (!res.ok) throw new Error('Error fetching tags');
      return res.json();
    },
  });
  
  useEffect(() => {
    if (tagsData.length > 0) {
      const groups: AmenityGroup[] = Object.values(AmenityType).filter(v => typeof v === 'number').map(type => {
        const options = tagsData.filter((tag: AmenityTag) => tag.type === type);
        return {
          type: type as AmenityType,
          title: AMENITY_TYPE_LABELS[type as AmenityType],
          options,
        };
      });
      setAmenityGroups(groups);
      // Set activeTab to first group's type if available
      if (groups.length > 0) {
        setActiveTab(groups[0].type.toString());
      }
    }
  }, [tagsData]);


  // Format price display
  const formatPrice = (amount: string, currency: string) => {
    if (!amount) return '';
    return `${currency}${amount}`;
  };

  // Build amenity tabs from amenityGroups
  const amenityTabs = amenityGroups.map(group => ({
    key: group.type.toString(),
    label: group.title
  }));

  // Build property title
  const propertyTitle = wizardData.publication_title || `${wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - ${wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} ${wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}`;
  
  // Build property features from wizard data
  const buildFeatures = () => {
    const features = [];
    
    if (wizardData.property_condition) {
      if (wizardData.property_condition === 'new') features.push({ label: 'A estrenar', icon: '/icons/calendar.svg' });
      if (wizardData.property_condition === 'construction') features.push({ label: 'En construcción', icon: '/icons/calendar.svg' });
      if (wizardData.property_condition === 'years' && wizardData.age) {
        features.push({ label: `${wizardData.age} años`, icon: '/icons/calendar.svg' });
      }
    }
    
    if (wizardData.orientation) {
      features.push({ label: ORIENTATION_LABELS[wizardData.orientation], icon: '/icons/orientacion.svg' });
    }
    
    if (wizardData.total_surface && wizardData.surface_measurement) {
      features.push({ label: `${wizardData.total_surface} ${wizardData.surface_measurement} tot.`, icon: '/icons/regla.svg' });
    }
    
    if (wizardData.roofed_surface && wizardData.roofed_surface_measurement) {
      features.push({ label: `${wizardData.roofed_surface} ${wizardData.roofed_surface_measurement} cub`, icon: '/icons/mcubiertos.svg' });
    }
    
    if (wizardData.room_amount) {
      features.push({ label: `${wizardData.room_amount} amb.`, icon: '/icons/door.svg' });
    }
    
    if (wizardData.parking_lot_amount) {
      features.push({ label: `${wizardData.parking_lot_amount} cochera${wizardData.parking_lot_amount > 1 ? 's' : ''}`, icon: '/icons/cochera.svg' });
    }
    
    if (wizardData.suite_amount) {
      features.push({ label: `${wizardData.suite_amount} dorm.`, icon: '/icons/cama.svg' });
    }
    
    if (wizardData.bathroom_amount) {
      features.push({ label: `${wizardData.bathroom_amount} baño${wizardData.bathroom_amount > 1 ? 's' : ''}`, icon: '/icons/bano.svg' });
    }
    
    if (wizardData.toilet_amount) {
      features.push({ label: `${wizardData.toilet_amount} toilette${wizardData.toilet_amount > 1 ? 's' : ''}`, icon: '/icons/toilet.svg' });
    }

    return features.length > 0 ? features : featureItems; // fallback to default
  };

  // Get selected amenities by group, using amenityGroups and wizardData.tags
  const getAmenitiesByTab = () => {
    const result: Record<string, string[]> = {};
    
    
    
    // Build result for each amenity group
    amenityGroups.forEach(group => {
      const groupKey = group.type.toString();
      result[groupKey] = [];
      
      // Filter tags in this group that are selected
      const selectedTags = group.options
        .filter((option: AmenityTag) => wizardData?.tags?.includes(option.id))
        .map((option: AmenityTag) => option.name);
      
      result[groupKey] = selectedTags;
    });
    
    return result;
  };

  const dynamicFeatures = buildFeatures();
  const dynamicAmenities = getAmenitiesByTab();
  
  const handleBack = () => {
    onBack();
  };

  const handlePublish = () => {
    const propertyPublishUpdate = { 
      status: 1
    }
    onNext(propertyPublishUpdate);
  };

  return (
    <div className="publish-review">
      <div className="publish-review-inner">
        <div className="publish-review-card">
          <div className="publish-review-top">
            <div className="publish-review-route">              
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} {wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-review-link" type="button" onClick={onSaveAndExit}>
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
                      <span className='operacion'>En {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'}</span>
                    </div>
                    <div className="publish-review-preview-meta">
                      {wizardData.price && wizardData.total_surface && (
                      <span>{wizardData.currency}/m2 {(wizardData.price / wizardData.total_surface).toFixed(2)}</span>
                      )}
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
                      {formatPrice(wizardData?.price?.toString() ?? '', wizardData.currency || '$')}
                    </strong>
                    {!wizardData.expenses && (
                      <span>
                        {formatPrice(wizardData?.expenses?.toString() ?? '', wizardData.currency_expenses || '$')} expensas
                      </span>
                    )}
                  </div>
                </div>

                <div className="publish-review-gallery">
                  <div className="publish-review-gallery-main">
                    <img src={wizardData?.images?.[0]?.url ? `${AWS_S3_BUCKET_URL}/${wizardData.images[0].url}` : previewImage} alt="Vista principal" />
                  </div>
                  <div className="publish-review-gallery-grid">
                    {wizardData?.images?.slice(1).map((image, index) => (
                      <div key={image.url} className="publish-review-gallery-item">
                        <img src={`${AWS_S3_BUCKET_URL}/${image.url}`} alt={`Vista ${index + 2}`} />
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
                    {wizardData.description || `En ${wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} ${wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} en ${wizardData.sub_location_id || 'zona exclusiva'}. Esta propiedad cuenta con una superficie total de ${wizardData.total_surface || ''} ${wizardData.surface_measurement || 'm2'}.`}
                  </p>
                  {(wizardData.description && wizardData.description.length > 1200) && (
                  <button type="button" className="publish-review-summary-toggle">
                    Leer descripcion completa
                    <img src="/icons/chevron-up.svg" alt="" />
                  </button>)}
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
                      <span>-</span>
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
