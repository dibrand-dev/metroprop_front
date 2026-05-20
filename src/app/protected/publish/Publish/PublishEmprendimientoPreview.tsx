'use client';

import { useState, useEffect } from 'react';
import './PublishEmprendimientoPreview.scss';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, CreateProperty, CreatePropertyDraft, OPERATION_TYPE_LABELS, OperationType, ORIENTATION_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS, PropertyStatus, PropertySubtype, PropertyType } from '@/types/propiedad';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import { useSession } from 'next-auth/react';
import { ORGANIZATION_NO_IMAGE } from '@/app/constants';
import { apiFetch } from '@/lib/apiFetch';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useLocations } from '@/lib/locations';
import { formatNumbers } from '@/utils/utils';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';

const iconDoor = '/icons/blueDoor.svg';
const iconCrane = '/icons/crane.svg';

interface PublishFinalReviewProps {  
  onNext: (data: Partial<CreatePropertyDraft>) => void;
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  goToStep: (step: EmprendimientoStep) => void;
  isEditMode?: boolean;
}

export default function PublishEmprendimientoFinalReview({
  wizardData,
  onNext,
  updateWizardData,
  isEditMode = false,
  goToStep,
}: PublishFinalReviewProps) {
  const { data: locations = [] } = useLocations();
  const { data: sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<string>('');
  const countryLabel = locations.find(l => l.id === wizardData.country_id)?.name;
  const stateLabel = locations.find(l => l.id === wizardData.state_id)?.name;
  const locationLabel = locations.find(l => l.id === wizardData.location_id)?.name;
  const subLocationLabel = locations.find(l => l.id === wizardData.sub_location_id)?.name;
  const addressParts = [wizardData.street, subLocationLabel, locationLabel, stateLabel, countryLabel].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Dirección no especificada';
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
  
  const unidadesPorTipo = (wizardData.development_units ?? []).reduce<Record<string, CreateProperty[]>>((acc, unit) => {
    const rooms = unit.room_amount ?? 0;
    const key = rooms === 0 ? 'Monoambiente' : rooms === 1 ? '1 ambiente' : `${rooms} ambientes`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(unit);
    return acc;
  }, {});

  const getUnidadCount = (units: CreateProperty[]) => units.length;
  const getPrecioDesde = (units: CreateProperty[]) => {
    const prices = units.map(u => u.price ?? 0).filter(p => p > 0);
    if (prices.length === 0) return '-';
    const currency = units[0]?.currency ?? '';
    return `${currency} ${Math.min(...prices).toLocaleString('es-AR')}`;
  };
  const getSupDesde = (units: CreateProperty[]) => {
    const sups = units.map(u => Number(u.total_surface)).filter(s => s > 0);
    if (sups.length === 0) return '-';
    const meas = units[0]?.surface_measurement ?? 'm²';
    return `${Math.min(...sups)} ${meas}`;
  };

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

  // Format price display
  const formatPrice = (amount: string, currency: string) => {
    if (!amount) return '';
    return `${currency} ${amount}`;
  };

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

    result[4] = [];
    if (wizardData?.expenses)  result[4].push(`Expensas: ${formatNumbers(wizardData.expenses)} ${wizardData.currency_expenses ?? ''}`);
    if (wizardData?.floors_amount)  result[4].push(`Pisos: ${wizardData.floors_amount}`);
    if (wizardData?.garage_coverage)  result[4].push(`Cobertura cochera: ${wizardData.garage_coverage}`);
    if (wizardData?.postal_code)  result[4].push(`Código postal: ${wizardData.postal_code}`);
    if (wizardData?.semiroofed_surface)  result[4].push(`Superficie semicubierta: ${formatNumbers(wizardData.semiroofed_surface)} ${wizardData.surface_measurement ?? ''}`);
    if (wizardData?.surface_front)  result[4].push(`Frente: ${formatNumbers(wizardData.surface_front)} ${wizardData.surface_measurement ?? ''}`);
    if (wizardData?.surface_length)  result[4].push(`Fondo: ${formatNumbers(wizardData.surface_length)} ${wizardData.surface_measurement ?? ''}`);
    if (result[4].length === 0) delete result[4];
    
    return result;
  };

  const dynamicFeatures = buildFeatures();
  const dynamicAmenities = getAmenitiesByTab();
  const statusDisplay = `${wizardData?.property_type ? `${PROPERTY_TYPE_LABELS[wizardData.property_type as PropertyType]} ` : ''}${wizardData?.property_subtype ? `${PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype as PropertySubtype]} ` : ''}${wizardData?.operation_type ? `En ${OPERATION_TYPE_LABELS[wizardData.operation_type as OperationType]}` : ''}`;
  
  const handlePublish = () => {
    const propertyPublishUpdate = { 
      status: PropertyStatus.DISPONIBLE
    }
    // redirect to myProperties
    onNext(propertyPublishUpdate);
  };

  const agentLogo: string = setImagePath((sessionData?.user as any)?.organization?.company_logo) || ORGANIZATION_NO_IMAGE;
  const agentName: string = (sessionData?.user as any)?.organization?.company_name || sessionData?.user?.name || '';

  return (
    <div className="publish-review">
      <div className="publish-review-inner">
        <div className="publish-review-card">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span className="breadcrumb-text">Emprendimientos</span>
          </div>
  
          {/* Header */}
          <div className="header">
            <h1 className="title">Publicar emprendimiento</h1>
          </div>
  
          {/* Secondary Menu / Tabs */}
          <EmprendimientoTabs currentStep="emprendimiento-preview" goToStep={goToStep} />

          <div className="publish-review-section">
            <h1>Revision final del aviso y datos de contacto</h1>
            <h2>Vista previa</h2>

            <div className="publish-review-preview">
              <h3>Asi se vera tu publicacion</h3>

              <div className="publish-review-preview-card">
                <div>
                  <div className="publish-review-preview-hero">
                    <span className="entrega">
                      <img src={iconCrane} alt="Crane Icon" />
                      En pozo - Entrega {wizardData.development_delivery_date}
                    </span>
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
                  <p className="previewTitle">Venta desde  ??????</p>
                </div>

                

                <div className="publish-review-gallery">
                  <div className="publish-review-gallery-main">
                    {wizardData?.images?.[0]?.url && <img src={setImagePath(wizardData?.images?.[0]?.url)} alt="Vista principal" />}
                  </div>
                  <div className="publish-review-gallery-grid">
                    {wizardData?.images?.slice(1).map((image, index) => (
                      <div key={image.url} className="publish-review-gallery-item">
                        <img src={setImagePath(image.url)} alt={`Vista ${index + 2}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="publish-review-summary">
                  <h4>{propertyTitle}</h4>
                </div>
                <div className="publish-review-address-1">
                  <span className="publish-review-address-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" stroke="currentColor" fill="#ffffff">
                      <path d="M8.80978 18.57C8.64658 18.6872 8.45071 18.7503 8.24978 18.7503C8.04885 18.7503 7.85298 18.6872 7.68978 18.57C2.86078 15.128 -2.26422 8.048 2.91678 2.932C4.33912 1.53285 6.25462 0.749124 8.24978 0.750001C10.2498 0.750001 12.1688 1.535 13.5828 2.931C18.7638 8.047 13.6388 15.126 8.80978 18.57Z" stroke="#7A7A7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8.25 9.75C8.78043 9.75 9.28914 9.53929 9.66421 9.16421C10.0393 8.78914 10.25 8.28043 10.25 7.75C10.25 7.21957 10.0393 6.71086 9.66421 6.33579C9.28914 5.96071 8.78043 5.75 8.25 5.75C7.71957 5.75 7.21086 5.96071 6.83579 6.33579C6.46071 6.71086 6.25 7.21957 6.25 7.75C6.25 8.28043 6.46071 8.78914 6.83579 9.16421C7.21086 9.53929 7.71957 9.75 8.25 9.75Z" stroke="#7A7A7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>{address}</span>
                </div>

                <div className="publish-review-features">
                  {dynamicFeatures.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="publish-review-feature">
                      <img src={item.icon} alt="" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                
                <div className="description-section">
                  <p>Sobre el emprendimiento</p>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" stroke="#1E1E1E" fill="#ffffff">
                        <path d="M8.80978 18.57C8.64658 18.6872 8.45071 18.7503 8.24978 18.7503C8.04885 18.7503 7.85298 18.6872 7.68978 18.57C2.86078 15.128 -2.26422 8.048 2.91678 2.932C4.33912 1.53285 6.25462 0.749124 8.24978 0.750001C10.2498 0.750001 12.1688 1.535 13.5828 2.931C18.7638 8.047 13.6388 15.126 8.80978 18.57Z" stroke="#1E1E1E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8.25 9.75C8.78043 9.75 9.28914 9.53929 9.66421 9.16421C10.0393 8.78914 10.25 8.28043 10.25 7.75C10.25 7.21957 10.0393 6.71086 9.66421 6.33579C9.28914 5.96071 8.78043 5.75 8.25 5.75C7.71957 5.75 7.21086 5.96071 6.83579 6.33579C6.46071 6.71086 6.25 7.21957 6.25 7.75C6.25 8.28043 6.46071 8.78914 6.83579 9.16421C7.21086 9.53929 7.71957 9.75 8.25 9.75Z" stroke="#1E1E1E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="#fff" />
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

                {/* Available Units Section */}
                <div className="units-section">
                  <h4 className="section-title">Unidades disponibles</h4>
                  
                  {Object.entries(unidadesPorTipo).map(([tipo, unidades]) => (
                    <div key={tipo} className="unit-type-group">
                      {/* Unit Type Header */}
                      <div className="unit-type-header">
                        <div className="unit-type-info">
                          <img src={iconDoor} alt={`${tipo} icono`} className="unit-type-icon" />
                          <div className="unit-type-details">
                            <div className="unit-type-title">
                              <span className="unit-type-name">{tipo}</span>
                              <span className="unit-type-desde">desde</span>
                              <span className="unit-type-price">{getPrecioDesde(unidades)}</span>
                            </div>
                            <div className="unit-type-superficie">
                              Superficie: desde {getSupDesde(unidades)}
                            </div>
                          </div>
                        </div>
                        <div className="unit-type-count">
                          <span className="count-number">{getUnidadCount(unidades)}</span>
                          <span className="count-label">unidades disponibles</span>
                        </div>
                      </div>

                      {/* Units Table */}
                      <div className="units-table">
                        <div className="table-header">
                          <div className="table-cell">Unidad</div>
                          <div className="table-cell">Sup. Total</div>
                          <div className="table-cell">Sup. Cubierta</div>
                          <div className="table-cell">Baños</div>
                          <div className="table-cell">Precio m²</div>
                          <div className="table-cell">Precio total</div>
                        </div>
                        {unidades.map((unit, index) => {
                          const pricePerM2 = unit.price && Number(unit.total_surface) > 0
                            ? `${unit.currency ?? ''} ${Math.round(unit.price / Number(unit.total_surface)).toLocaleString('es-AR')}`
                            : '-';
                          const priceTotal = unit.price
                            ? `${unit.currency ?? ''} ${unit.price.toLocaleString('es-AR')}`
                            : '-';
                          return (
                            <div key={unit.id ?? index} className="table-row">
                              <div className="table-cell">{unit.publication_title ?? '-'}</div>
                              <div className="table-cell">{unit.total_surface ? `${unit.total_surface} ${unit.surface_measurement ?? ''}` : '-'}</div>
                              <div className="table-cell">{unit.roofed_surface ? `${unit.roofed_surface} ${unit.roofed_surface_measurement ?? ''}` : '-'}</div>
                              <div className="table-cell">{unit.bathroom_amount ?? '-'}</div>
                              <div className="table-cell">{pricePerM2}</div>
                              <div className="table-cell">{priceTotal}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>


                <div className="publish-review-amenities">
                  <h4>Más sobre este emprendimiento</h4>
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
                <p>Estos son los datos que veran los interesados</p>
                <div className="publish-review-contact-card">
                  <div className="publish-review-contact-logo">
                    {agentLogo && <img src={agentLogo} alt={`${agentName} logo`} className="property-detail-agent-logo" />}
                  </div>
                  {sessionData?.user && <div className="publish-review-contact-info">
                    <div className="publish-review-contact-name">{agentName}</div>
                    <div className="publish-review-contact-name">{sessionData?.user?.email ?? ''}</div>
                    <div className="publish-review-contact-phone">{sessionData?.user?.phone ?? ''}</div>
                  </div>}
                </div>
              </div>
            </div>
          </div>

          <div className="publish-review-footer">           
            <button className="publish-review-continue" type="button" onClick={handlePublish}>
              {isEditMode ? 'Guardar cambios' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

