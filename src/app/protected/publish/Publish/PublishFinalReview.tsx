'use client';

import { useState, useEffect } from 'react';
import './PublishFinalReview.scss';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, CreatePropertyDraft, GARAGE_COVERAGE_LABELS, OPERATION_TYPE_LABELS, OperationType, ORIENTATION_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS, PropertyStatus, PropertySubtype, PropertyType } from '@/types/propiedad';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL, setImagePath, formatNumbers, formatCurrency, getInitials, formatStreetAddress } from '@/utils/utils';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiFetch';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useLocations } from '@/lib/locations';
import Button from '@/ui/Button/Button';

const iconChevron = '/icons/chevron-up.svg';

interface PublishFinalReviewProps {
  wizardData: CreatePropertyDraft;
  onNext: (data: Partial<CreatePropertyDraft>) => void;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<CreatePropertyDraft>) => void;
  isEditMode?: boolean;
}

export default function PublishFinalReview({
  wizardData,
  onNext,
  onBack,
  onSaveAndExit,
  updateWizardData,
  isEditMode = false,
}: PublishFinalReviewProps) {
  const { data: locations = [] } = useLocations();
  const { data: sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<string>('');
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const formattedStreet = formatStreetAddress(wizardData.street, wizardData.show_exact_location);
  console.log("locations",locations)
  const countryLabel = locations.find(l => l.id === wizardData.country_id)?.name;
  const stateLabel = locations.find(l => l.id === wizardData.state_id)?.name;
  const locationLabel = locations.find(l => l.id === wizardData.location_id)?.name;
  const subLocationLabel = locations.find(l => l.id === wizardData.sub_location_id)?.name;
  const neighborhoodLabel = locations.find(l => l.id === wizardData.neighborhood_id)?.name;
  console.log("wizardData", wizardData)
  console.log(neighborhoodLabel, subLocationLabel, locationLabel, stateLabel, countryLabel)
  const addressParts = [formattedStreet, neighborhoodLabel, subLocationLabel, locationLabel, stateLabel, countryLabel].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Dirección no especificada';
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
  const showSummaryToggle = (wizardData.description?.length ?? 0) > 300 || (wizardData.description?.split('\n').length ?? 0) > 2;
  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/tags`),
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
  
  useEffect(() => {
    if (wizardData.draft_id) {
      apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}/multimedia`)
        .then(data => {
          const _wizardData = {...wizardData};
          _wizardData.images = (data as any)?.images || wizardData.images;
          _wizardData.attached = (data as any)?.attached || wizardData.attached;
          updateWizardData(_wizardData);
        })
        .catch(error => console.error('Error loading multimedia:', error));
    }
  }, []) 

  // Build amenity tabs from amenityGroups
  const amenityTabs = amenityGroups.map(group => ({
    key: group.type.toString(),
    label: group.title
  }));
  
  useEffect(() => {
    if (!wizardData) return;
    const hasDetails = !!(
      wizardData.expenses ||
      wizardData.floors_amount ||
      wizardData.garage_coverage ||
      wizardData.postal_code ||
      wizardData.semiroofed_surface ||
      wizardData.surface_front ||
      wizardData.surface_length
    );
    if (hasDetails) setActiveTab('4');
  }, [wizardData]);


  // Build property title
  const propertyTitle = wizardData.publication_title || `${wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - ${wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} ${wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}`;
  
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
      features.push({ label: `${formatNumbers(wizardData.total_surface)} ${wizardData.surface_measurement} tot.`, icon: '/icons/regla.svg' });
    }
    
    if (wizardData.roofed_surface && wizardData.roofed_surface_measurement) {
      features.push({ label: `${formatNumbers(wizardData.roofed_surface)} ${wizardData.roofed_surface_measurement} cub`, icon: '/icons/mcubiertos.svg' });
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
      features.push({ label: `${wizardData.toilet_amount} toilette${wizardData.toilet_amount > 1 ? 's' : ''}`, icon: '/icons/toilete.svg' });
    }

    return features.length > 0 ? features : []; // fallback to default
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
    console.log("wizardDataAA", wizardData)
    result[4] = [];
    if (wizardData?.expenses && wizardData.expenses > 0)  result[4].push(`Expensas: ${formatNumbers(wizardData.expenses)} ${formatCurrency(wizardData.currency_expenses ?? '')}`);
    if (wizardData?.floors_amount && wizardData.floors_amount > 0)  result[4].push(`Pisos: ${wizardData.floors_amount}`);
    if (wizardData?.garage_coverage && wizardData.garage_coverage > 0)  result[4].push(`Cobertura cochera: ${GARAGE_COVERAGE_LABELS[wizardData.garage_coverage]}`);
    if (wizardData?.postal_code)  result[4].push(`Código postal: ${wizardData.postal_code}`);
    if (wizardData?.semiroofed_surface && wizardData.semiroofed_surface > 0)  result[4].push(`Superficie semicubierta: ${formatNumbers(wizardData.semiroofed_surface)} ${wizardData.surface_measurement ?? ''}`);
    if (wizardData?.surface_front && wizardData.surface_front > 0)  result[4].push(`Frente: ${formatNumbers(wizardData.surface_front)} ${wizardData.surface_measurement ?? ''}`);
    if (wizardData?.surface_length)  result[4].push(`Fondo: ${formatNumbers(wizardData.surface_length)} ${wizardData.surface_measurement ?? ''}`);
    if (wizardData?.disposition)  result[4].push(`Orientación: ${wizardData.disposition}`);
    if (wizardData?.floors_in_building)  result[4].push(`Cantidad de pisos en edificio: ${wizardData.floors_in_building}`);
    if (wizardData?.business_type)  result[4].push(`Tipo de rubro: ${wizardData.business_type}`);
    if (wizardData?.number_of_guests)  result[4].push(`Cantidad de huéspedes: ${wizardData.number_of_guests}`);
    if (wizardData?.fot)  result[4].push(`F.O.T: ${wizardData.fot}`);
    if (wizardData?.apartments_per_floor)  result[4].push(`Cantidad de departamentos por piso: ${wizardData.apartments_per_floor}`);
    console.log("RESULT 4", result[4]);
    if (result[4].length === 0) delete result[4];
    
    return result;
  };

  const dynamicFeatures = buildFeatures();
  const dynamicAmenities = getAmenitiesByTab();
  console.log("dynamicAmenities", dynamicAmenities)
  const statusDisplay = <><span className="property-type">{`${wizardData?.property_type ? `${PROPERTY_TYPE_LABELS[wizardData.property_type as PropertyType]} ` : ''}${wizardData?.property_subtype ? `${PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype as PropertySubtype]} ` : ''}`}</span>{wizardData?.operation_type ? `En ${OPERATION_TYPE_LABELS[wizardData.operation_type as OperationType]}` : ''}</>;
  
  const handleBack = () => {
    onBack();
  };

  const handlePublish = () => {
    const propertyPublishUpdate = { 
      status: PropertyStatus.DISPONIBLE
    }
    // redirect to myProperties
    onNext(propertyPublishUpdate);
  };

  const agentLogo: string | false = setImagePath((sessionData?.user as any)?.organization?.company_logo) || false;
  const agentName: string = (sessionData?.user as any)?.organization?.company_name || sessionData?.user?.name || '';

  return (
    <div className="publish-review">
      <div className="publish-review-inner">
        <div className="publish-review-card">
          <div className="publish-review-top">
            <div className="publish-review-route">              
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} {wizardData.property_subtype ?  '- ' + PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
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
            <h1>Revisión final del aviso y datos de contacto</h1>
            <h2>Vista previa</h2>

            <div className="publish-review-preview">
              <h3>Así se verá tu publicación</h3>

              <div className="publish-review-preview-card">
                <div>
                  <div className="publish-review-preview-hero">
                    <div className="publish-review-preview-status">
                      <span className="publish-review-status-dot" />
                      <span className='operacion'>{statusDisplay}</span>
                    </div>
                    <div className="publish-review-preview-meta">
                      {wizardData.price && wizardData.total_surface && (
                      <span>{formatCurrency(wizardData.currency)}/m2 {formatNumbers((wizardData.price / wizardData.total_surface))}</span>
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
                      {formatCurrency(wizardData.currency)} {formatNumbers(wizardData?.price?.toString() ?? '')}
                    </strong>
                    {wizardData.expenses! > 0 && (
                      <span>
                        {formatCurrency(wizardData.currency_expenses)} {formatNumbers(wizardData.expenses?.toString() ?? '')} expensas
                      </span>
                    )}
                  </div>
                </div>

                <div className="publish-review-gallery">
                  <div className="publish-review-gallery-main">
                    {wizardData?.images?.[0]?.url && <img src={setImagePath(wizardData?.images?.[0]?.url)} alt="Vista principal" />}
                  </div>
                  <div className="publish-review-gallery-grid">
                    {wizardData?.images?.slice(1, 5).map((image, index) => (
                      <div key={image.url} className="publish-review-gallery-item">
                        <img src={setImagePath(image.url)} alt={`Vista ${index + 2}`} />
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
                  <p className={`whitespace-pre-line ${summaryExpanded ? 'summary-expanded' : 'summary-collapsed'}`}>
                    {wizardData.description || `En ${wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} ${wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} en ${wizardData.sub_location_id || 'zona exclusiva'}. Esta propiedad cuenta con una superficie total de ${wizardData.total_surface || ''} ${wizardData.surface_measurement || 'm2'}.`}
                  </p>
                  {showSummaryToggle && (
                    <button
                    type="button"
                    className="property-detail-summary-toggle"
                    onClick={() => setSummaryExpanded((prev) => !prev)}
                    aria-expanded={summaryExpanded}
                  >
                    {summaryExpanded
                      ? 'Leer descripcion completa'
                      : 'Leer descripcion completa'}
                    <img
                      src="/icons/chevron-up.svg"
                      alt=""
                      aria-hidden="true"
                      className={summaryExpanded ? 'expanded' : ''}
                    />
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
                    {wizardData.geo_lat && wizardData.geo_long ? (
                      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
                        <Map
                          center={{ lat: wizardData.geo_lat, lng: wizardData.geo_long }}
                          zoom={15}
                          gestureHandling="none"
                          disableDefaultUI
                          style={{ width: '100%', height: '100%' }}
                        />
                        <div className="publish-review-map-pin" aria-hidden="true">
                          <svg viewBox="0 0 24 32" width="28" height="38">
                            <path
                              d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20S24 21 24 12C24 5.37 18.63 0 12 0zm0 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                              fill="#e53e3e"
                            />
                          </svg>
                        </div>
                      </APIProvider>
                    ) : (
                      <img src="/images/mapa_google.png" alt="Mapa de ubicacion" />
                    )}
                  </div>
                </div>

                <div className="publish-review-amenities">
                  <h4>Conocé más sobre esta propiedad</h4>
                  <div className="publish-review-amenities-tabs">
                    {dynamicAmenities[4] && dynamicAmenities[4].length > 0 && (
                      <button
                        key="detalles"
                        type="button"
                        className={`publish-review-amenities-tab ${activeTab === "4" ? 'is-active' : ''}`}
                        onClick={() => setActiveTab("4")}
                      >
                        Detalles
                      </button>
                    )}
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
                <p>Estos son los datos que verán los interesados</p>
                <div className="publish-review-contact-card">
                  <div className="publish-review-contact-logo">
                    {agentLogo
                      ? <img src={agentLogo} alt={`${agentName} logo`} className="property-detail-agent-logo" />
                      : <div className="header-avatar">
                        {/*sessionData?.user?.image ? <img src={sessionData.user.image} alt={sessionData.user.name ?? ''} /> : getInitials(sessionData?.user?.name || '')*/}
                        {getInitials(agentName)}
                      </div>}
                  </div>
                  {sessionData?.user && <div className="publish-review-contact-info">
                    {agentName !== sessionData?.user?.email && <div className="publish-review-contact-name">{agentName}</div>}
                    <div>{sessionData?.user?.email ?? ''}</div>
                    <div>{sessionData?.user?.phone ?? ''}</div>
                  </div>}
                </div>
              </div>
            </div>
          </div>

          <div className="publish-review-footer">
            <Button
              label="Volver"
              variant="back"
              onClick={handleBack}
              icon={<img src={iconChevron} alt="" />}
              iconPosition="left"
              className="publish-review-back"
            />
            <Button type="button" onClick={handlePublish} label={isEditMode ? 'Guardar cambios' : 'Publicar'} />
          </div>
        </div>
      </div>
    </div>
  );
}
