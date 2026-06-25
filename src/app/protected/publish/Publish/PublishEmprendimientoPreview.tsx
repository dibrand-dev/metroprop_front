'use client';

import { useState, useEffect, useMemo } from 'react';
import './PublishEmprendimientoPreview.scss';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, CreateProperty, CreatePropertyDraft, OPERATION_TYPE_LABELS, OperationType, ORIENTATION_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS, PropertyStatus, PropertySubtype, PropertyType } from '@/types/propiedad';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL, setImagePath, formatNumbers, formatCurrency, getInitials, formatStreetAddress } from '@/utils/utils';
import { useSession } from 'next-auth/react';
import { ORGANIZATION_NO_IMAGE } from '@/app/constants';
import { apiFetch } from '@/lib/apiFetch';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useLocations } from '@/lib/locations';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';
import GalleryModal, { GalleryTab, GalleryVideo } from '@/app/propertyDetail/[id]/PropertyDetail/GalleryModal/GalleryModal';
import Button from '@/ui/Button/Button';

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
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const countryLabel = locations.find(l => l.id === wizardData.country_id)?.name;
  const stateLabel = locations.find(l => l.id === wizardData.state_id)?.name;
  const locationLabel = locations.find(l => l.id === wizardData.location_id)?.name;
  const subLocationLabel = locations.find(l => l.id === wizardData.sub_location_id)?.name;
  const neighborhoodLabel = locations.find(l => l.id === wizardData.neighborhood_id)?.name;
  const addressParts = [formatStreetAddress(wizardData.street, wizardData.show_exact_location), neighborhoodLabel, subLocationLabel, locationLabel, stateLabel, countryLabel].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Dirección no especificada';
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialTab, setGalleryInitialTab] = useState<GalleryTab>('fotos');
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [disablePublish, setDisablePublish] = useState(false);
  const showSummaryToggle = (wizardData.description?.length ?? 0) > 300 || (wizardData.description?.split('\n').length ?? 0) > 2;
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
    return `${formatCurrency(currency)} ${Math.min(...prices).toLocaleString('es-AR')}`;
  };

   const devMinPrice = (() => {
      const prices = (wizardData.development_units ?? []).map(u => u.price ?? 0).filter(p => p > 0);
      if (prices.length === 0) return null;
      const min = Math.min(...prices);
      const currency = (wizardData.development_units ?? [])[0]?.currency ?? '';
      return `Venta desde ${formatCurrency(currency)} ${formatNumbers(min)}`;
    })();

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

  const uniqueRoomAmounts = [...new Set((wizardData.development_units ?? []).map(u => u.room_amount ?? 0))].sort((a, b) => a - b);
  const showUnitFilters = uniqueRoomAmounts.length > 1;

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
    return `${formatCurrency(currency)} ${amount}`;
  };

  // Gallery images (non-blueprint, completed uploads)
  const galleryImages = useMemo(() => {
    return (wizardData?.images ?? [])
      .filter(img => !img.is_blueprint && img.upload_status === 'completed')
      .map(img => setImagePath(img.url));
  }, [wizardData]);

  // Gallery videos (excluding 360)
  const galleryVideos = useMemo(() => {
    return ((wizardData?.videos ?? []) as unknown as (GalleryVideo & { is_360?: boolean })[]).filter(v => !v.is_360).sort((a, b) => a.order - b.order);
  }, [wizardData]);

  // Gallery plans (attached files)
  const galleryPlans = useMemo(() => {
    return (wizardData?.attached ?? []).filter(a => a.upload_status === 'completed');
  }, [wizardData]);

  // 360 videos (from videos array where is_360 === true)
  const gallery360 = useMemo(() => {
    return ((wizardData?.videos ?? []) as unknown as (GalleryVideo & { is_360?: boolean })[]).filter(v => v.is_360).sort((a, b) => a.order - b.order);
  }, [wizardData]);

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
  
  // Build property features from unit ranges
  const buildFeatures = () => {
    const units = wizardData.development_units ?? [];
    const features = [];

    const rangeLabel = (values: number[], singular: string, plural: string, suffix = '') => {
      const filtered = values.filter(v => v > 0);
      if (filtered.length === 0) return null;
      const min = Math.min(...filtered);
      const max = Math.max(...filtered);
      const noun = max === 1 ? singular : plural;
      return min === max ? `${min}${suffix} ${noun}` : `${min}${suffix} a ${max}${suffix} ${noun}`;
    };

    // Amount of units
    if (units.length > 0) {
      features.push({ label: `${units.length} unidad${units.length !== 1 ? 'es' : ''}`, icon: '/icons/door.svg' });
    }

    // total_surface range
    const totalSurfaces = units.map(u => Number(u.total_surface ?? 0));
    const meas = units[0]?.surface_measurement ?? 'm²';
    const totalSurfLabel = rangeLabel(totalSurfaces, meas, meas, '');
    if (totalSurfLabel) {
      const tMin = Math.min(...totalSurfaces.filter(v => v > 0));
      const tMax = Math.max(...totalSurfaces.filter(v => v > 0));
      const label = tMin === tMax ? `${tMin} ${meas} tot.` : `${tMin} a ${tMax} ${meas} tot.`;
      features.push({ label, icon: '/icons/regla.svg' });
    }

    // roofed_surface range
    const roofedSurfaces = units.map(u => Number(u.roofed_surface ?? 0));
    const roofedFiltered = roofedSurfaces.filter(v => v > 0);
    if (roofedFiltered.length > 0) {
      const rMin = Math.min(...roofedFiltered);
      const rMax = Math.max(...roofedFiltered);
      const label = rMin === rMax ? `${rMin} ${meas} cub.` : `${rMin} a ${rMax} ${meas} cub.`;
      features.push({ label, icon: '/icons/mcubiertos.svg' });
    }

    // room_amount range
    const rooms = units.map(u => u.room_amount ?? 0);
    const roomLabel = rangeLabel(rooms, 'amb.', 'amb.');
    if (roomLabel) features.push({ label: roomLabel, icon: '/icons/door.svg' });

    // bathroom_amount range
    const baths = units.map(u => u.bathroom_amount ?? 0);
    const bathLabel = rangeLabel(baths, 'baño', 'baños');
    if (bathLabel) features.push({ label: bathLabel, icon: '/icons/bano.svg' });

    // toilet_amount range
    const toilets = units.map(u => u.toilet_amount ?? 0);
    const toiletLabel = rangeLabel(toilets, 'toilette', 'toilettes');
    if (toiletLabel) features.push({ label: toiletLabel, icon: '/icons/toilete.svg' });

    return features;
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
    if (wizardData?.expenses && wizardData.expenses > 0)  result[4].push(`Expensas: ${formatNumbers(wizardData.expenses)} ${formatCurrency(wizardData.currency_expenses ?? '')}`);
    if (wizardData?.floors_amount && wizardData.floors_amount > 0)  result[4].push(`Pisos: ${wizardData.floors_amount}`);
    if (wizardData?.garage_coverage && wizardData.garage_coverage > 0)  result[4].push(`Cobertura cochera: ${wizardData.garage_coverage}`);
    if (wizardData?.postal_code)  result[4].push(`Código postal: ${wizardData.postal_code}`);
    if (wizardData?.semiroofed_surface && wizardData.semiroofed_surface > 0)  result[4].push(`Superficie semicubierta: ${formatNumbers(wizardData.semiroofed_surface)} ${wizardData.surface_measurement ?? ''}`);
    if (wizardData?.surface_front && wizardData.surface_front > 0)  result[4].push(`Frente: ${formatNumbers(wizardData.surface_front)} ${wizardData.surface_measurement ?? ''}`);
    if (wizardData?.surface_length  && wizardData.surface_length > 0)  result[4].push(`Fondo: ${formatNumbers(wizardData.surface_length)} ${wizardData.surface_measurement ?? ''}`);
    if (result[4].length === 0) delete result[4];
    
    return result;
  };

  const dynamicFeatures = buildFeatures();
  const dynamicAmenities = getAmenitiesByTab();
  
  const handlePublish = () => {
    setDisablePublish(true);
    const propertyPublishUpdate = { 
      status: PropertyStatus.DISPONIBLE
    }
    // redirect to myProperties
    onNext(propertyPublishUpdate);
  };

  const agentLogo: string | false = setImagePath((sessionData?.user as any)?.organization?.company_logo) || false;
  const agentName: string = (sessionData?.user as any)?.organization?.company_name || sessionData?.user?.name || '';

 const openGallery = (tab: GalleryTab = 'fotos', index = 0) => {
    setGalleryInitialTab(tab);
    setGalleryInitialIndex(index);
    setIsGalleryOpen(true);
  };



  return (
    <div className="publish-review">
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImages}
        videos={galleryVideos as unknown as GalleryVideo[]}
        plans={galleryPlans}
        gallery360={gallery360 as unknown as GalleryVideo[]}
        initialTab={galleryInitialTab}
        initialIndex={galleryInitialIndex}
      />

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
            <h1>Revisión final del aviso y datos de contacto</h1>
            <h2>Vista previa</h2>

            <div className="publish-review-preview">
              <h3>Así se verá tu publicación</h3>

              <div className="publish-review-preview-card">
                <div>
                  <div className="publish-review-preview-hero">
                    <span className="entrega">
                      <img src={iconCrane} alt="Crane Icon" />
                      En pozo - Entrega {wizardData.development_delivery_date}
                    </span>
                  </div>
                  <p className="previewTitle">{devMinPrice}</p>
                </div>

                <section className="property-detail-gallery">
                  {galleryImages[0] && <div className="property-detail-gallery-main" onClick={() => openGallery('fotos', 0)} style={{ cursor: 'pointer' }}>
                    <img
                      src={galleryImages[0]}
                      alt="Vista principal"
                    />            
                  </div>}
                  <div className="property-detail-gallery-grid">
                    {galleryImages.slice(1, 5).map((image, index) => (
                      <div key={image} className="property-detail-gallery-item" onClick={() => openGallery('fotos', index + 1)} style={{ cursor: 'pointer' }}>
                        <img src={image} alt={`Vista ${index + 2}`} className="property-detail-gallery-image" />
                        {index === 3 && (
                          <div className="property-detail-gallery-overlay-preview">
                            <span onClick={(e) => e.stopPropagation()}>
                              <Button label="Ver todas las fotos" variant="secondary" icon={<img src="/icons/verGaleria.svg" alt="" />} onClick={() => openGallery('fotos', 0)} />
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
                <div className="publish-review-summary">
                  <h4>{propertyTitle}</h4>
                </div>
                <div className="publish-review-address-1">
                  <span className="publish-review-address-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" stroke="currentColor" fill="#ffffff">
                      <path d="M8.80978 18.57C8.64658 18.6872 8.45071 18.7503 8.24978 18.7503C8.04885 18.7503 7.85298 18.6872 7.68978 18.57C2.86078 15.128 -2.26422 8.048 2.91678 2.932C4.33912 1.53285 6.25462 0.749124 8.24978 0.750001C10.2498 0.750001 12.1688 1.535 13.5828 2.931C18.7638 8.047 13.6388 15.126 8.80978 18.57Z" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.25 9.75C8.78043 9.75 9.28914 9.53929 9.66421 9.16421C10.0393 8.78914 10.25 8.28043 10.25 7.75C10.25 7.21957 10.0393 6.71086 9.66421 6.33579C9.28914 5.96071 8.78043 5.75 8.25 5.75C7.71957 5.75 7.21086 5.96071 6.83579 6.33579C6.46071 6.71086 6.25 7.21957 6.25 7.75C6.25 8.28043 6.46071 8.78914 6.83579 9.16421C7.21086 9.53929 7.71957 9.75 8.25 9.75Z" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <h4>Sobre el emprendimiento</h4>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" stroke="#1E1E1E" fill="#ffffff">
                        <path d="M8.80978 18.57C8.64658 18.6872 8.45071 18.7503 8.24978 18.7503C8.04885 18.7503 7.85298 18.6872 7.68978 18.57C2.86078 15.128 -2.26422 8.048 2.91678 2.932C4.33912 1.53285 6.25462 0.749124 8.24978 0.750001C10.2498 0.750001 12.1688 1.535 13.5828 2.931C18.7638 8.047 13.6388 15.126 8.80978 18.57Z" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.25 9.75C8.78043 9.75 9.28914 9.53929 9.66421 9.16421C10.0393 8.78914 10.25 8.28043 10.25 7.75C10.25 7.21957 10.0393 6.71086 9.66421 6.33579C9.28914 5.96071 8.78043 5.75 8.25 5.75C7.71957 5.75 7.21086 5.96071 6.83579 6.33579C6.46071 6.71086 6.25 7.21957 6.25 7.75C6.25 8.28043 6.46071 8.78914 6.83579 9.16421C7.21086 9.53929 7.71957 9.75 8.25 9.75Z" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#fff" />
                      </svg>
                    </span>
                    <span>{address}</span>
                  </div>
                  <div className="publish-review-map-image">
                    {wizardData.geo_lat && wizardData.geo_long ? (
                      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
                        <Map
                          center={{ lat: Number(wizardData.geo_lat), lng: Number(wizardData.geo_long) }}
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
                  {showUnitFilters && (
                  <div className="units-filters">
                    <button onClick={() => setSelectedUnitFilter('')} className={selectedUnitFilter === '' ? 'active' : ''}>
                      Todas
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                        <path d="M12.65 20.65H0.650024V3.65002C0.650024 1.16802 1.16802 0.650024 3.65002 0.650024H9.65002C12.132 0.650024 12.65 1.16802 12.65 3.65002V20.65ZM12.65 20.65V6.65002H15.65C18.132 6.65002 18.65 7.16802 18.65 9.65002V20.65H12.65Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                        <path d="M5.65002 4.65002H7.65002H5.65002ZM5.65002 7.65002H7.65002H5.65002ZM5.65002 10.65H7.65002H5.65002Z" fill="currentColor"/>
                        <path d="M5.65002 4.65002H7.65002M5.65002 7.65002H7.65002M5.65002 10.65H7.65002" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.15002 20.65V16.65C9.15002 15.707 9.15002 15.236 8.85702 14.943C8.56402 14.65 8.09302 14.65 7.15002 14.65H6.15002C5.20702 14.65 4.73602 14.65 4.44302 14.943C4.15002 15.236 4.15002 15.707 4.15002 16.65V20.65" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {uniqueRoomAmounts.map(rooms => {
                      const filterValue = String(rooms);
                      const label = rooms === 0 ? 'Monoambiente' : rooms === 1 ? '1 Ambiente' : `${rooms} Ambientes`;
                      return (
                        <button key={filterValue} onClick={() => setSelectedUnitFilter(filterValue)} className={selectedUnitFilter === filterValue ? 'active' : ''}>
                          {label}
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                            <path d="M14.75 18.7501C15.2804 18.7501 15.7891 18.5394 16.1642 18.1644C16.5393 17.7893 16.75 17.2806 16.75 16.7501V4.75014C16.75 4.21971 16.5393 3.711 16.1642 3.33593C15.7891 2.96085 15.2804 2.75014 14.75 2.75014M0.75 5.59814V15.9021C0.75 17.4951 0.75 18.2921 1.215 18.8481C1.679 19.4031 2.465 19.5461 4.035 19.8311L7.035 20.3751C9.22 20.7721 10.313 20.9701 11.031 20.3721C11.75 19.7731 11.75 18.6641 11.75 16.4471V5.05314C11.75 2.83614 11.75 1.72714 11.031 1.12814C10.313 0.53014 9.221 0.72814 7.034 1.12514L4.034 1.66914C2.464 1.95414 1.679 2.09714 1.214 2.65214C0.75 3.20814 0.75 4.00514 0.75 5.59814Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                  )}
                  {Object.entries(unidadesPorTipo)
                    .filter(([tipo]) => {
                      if (selectedUnitFilter === '') return true;
                      const rooms = parseInt(selectedUnitFilter);
                      const expectedKey = rooms === 0 ? 'Monoambiente' : rooms === 1 ? '1 ambiente' : `${rooms} ambientes`;
                      return tipo === expectedKey;
                    }).map(([tipo, unidades]) => (
                  <div key={tipo} className="unit-type-group">
                    {/* Unit Type Header */}
                    <div className="unit-type-header">
                      <div className="unit-type-info">
                        <img src={'/icons/blueDoor.svg'} alt={`${tipo} icono`} className="unit-type-icon" />
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
                          ? `${formatCurrency(unit.currency ?? '')} ${Math.round(unit.price / Number(unit.total_surface)).toLocaleString('es-AR')}`
                          : '-';
                        const priceTotal = unit.price
                          ? `${formatCurrency(unit.currency ?? '')} ${unit.price.toLocaleString('es-AR')}`
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
                    <div>{sessionData?.user?.phone ?? sessionData?.user?.phone_whatsapp ?? ''}</div>
                  </div>}
                </div>
              </div>
            </div>
          </div>

          <div className="publish-review-footer">
            <Button variant="primary" label={isEditMode ? 'Guardar cambios' : 'Publicar'} onClick={handlePublish} disabled={disablePublish || (wizardData.development_delivery_date?.trim() === '') || wizardData.development_units_total === null || wizardData.development_type === null || wizardData.publication_title?.trim() === '' || wizardData.development_units?.length === 0 || wizardData.hired_plan_id === null} />
          </div>
        </div>
      </div>
    </div>
  );
}

