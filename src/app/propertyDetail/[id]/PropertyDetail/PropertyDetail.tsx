'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import './PropertyDetail.scss';
import Header from '@/layout/User/Header/Header';
import Footer from '@/layout/User/Footer/Footer';
import Button from '@/ui/Button/Button';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import PropertyDetailSubmenu from './PropertyDetailSubmenu/PropertyDetailSubmenu';
import PhoneRevealModal from '@/components/PhoneRevealModal/PhoneRevealModal';
import WhatsappModal from '@/components/WhatsappModal/WhatsappModal';
import { useQuery } from '@tanstack/react-query';
import { AmenityGroup, AmenityTag, AmenityType, AMENITY_TYPE_LABELS, OperationType, OPERATION_TYPE_LABELS, ORIENTATION_LABELS, Orientation, CreateProperty, PROPERTY_TYPE_LABELS, PropertyType, PROPERTY_SUBTYPE_LABELS, PropertySubtype } from '@/types/propiedad';
import { API_BASE_URL } from '@/utils/utils';
import { APIProvider } from '@vis.gl/react-google-maps';
import PropertyMap from './PropertyMap/PropertyMap';
import GalleryModal, { GalleryTab, GalleryVideo } from './GalleryModal/GalleryModal';
import ContactForm from './ContactForm/ContactForm';
import { useLocations } from '@/lib/locations';
import { formatNumbers } from '@/utils/utils';
import { AWS_S3_BUCKET_URL } from '@/app/constants';
import { fetchProperties } from '@/lib/properties';
import { useRouter } from 'next/navigation';

interface PropertyDetailProps {
  propertyId: string;
}

const SIMILAR_SECTIONS = [
  { title: 'Propiedades similares', count: 5 },
  { title: 'Propiedades similares por m2', count: 5 },
];

const CONTACT_ACTIONS = [
  { id: 'whatsapp', label: 'Whatsapp', icon: '/icons/whatsapp.svg', variant: 'whatsapp' },
  { id: 'contact', label: 'Contactar', icon: '/icons/envelope.svg', variant: 'primary' },
];

export default function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const router = useRouter();
  const { data: locations = [] } = useLocations();
  const [activeTab, setActiveTab] = useState<string>('');
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [similarCanScrollLeft, setSimilarCanScrollLeft] = useState<boolean[]>([]);
  const [similarCanScrollRight, setSimilarCanScrollRight] = useState<boolean[]>([]);
  const similarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [isSubmenuVisible, setIsSubmenuVisible] = useState(false);
  const [submenuOffset, setSubmenuOffset] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialTab, setGalleryInitialTab] = useState<GalleryTab>('fotos');
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  const openGallery = (tab: GalleryTab = 'fotos', index = 0) => {
    setGalleryInitialTab(tab);
    setGalleryInitialIndex(index);
    setIsGalleryOpen(true);
  };

  // Fetch property detail
  const { data: property, isLoading, isError } = useQuery<CreateProperty>({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/properties/${propertyId}`);
      if (!res.ok) throw new Error('Error fetching property');
      return res.json();
    },
    enabled: !!propertyId,
  });

  // Fetch tags for amenity tab names
  const { data: tagsData = [] } = useQuery<AmenityTag[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/tags`);
      if (!res.ok) throw new Error('Error fetching tags');
      return res.json();
    },
  });

  // Fetch similar properties by price
  const { data: similarByPrice } = useQuery({
    queryKey: ['similar-by-price', property?.id],
    queryFn: () => fetchProperties({
      property_type: String(property!.property_type),
      ...(property!.property_subtype ? { property_subtype: String(property!.property_subtype) } : {}),
      operation_type: String(property!.operation_type),
      price_min: Math.max(0, property!.price - 10000),
      price_max: property!.price + 10000,
      limit: 20,
      page: 1,
    }),
    enabled: !!property,
    staleTime: 60_000,
  });

  // Fetch similar properties by surface
  const { data: similarBySurface } = useQuery({
    queryKey: ['similar-by-surface', property?.id],
    queryFn: () => fetchProperties({
      total_surface_min: Math.max(0, (property!.total_surface ?? 0) - 50),
      total_surface_max: (property!.total_surface ?? 0) + 50,
      limit: 20,
      page: 1,
    }),
    enabled: !!property && !!property.total_surface,
    staleTime: 60_000,
  });

  const similarPropertiesData = useMemo(() => {
    const exclude = (items: CreateProperty[]) => items.filter(p => p.id !== property?.id);
    return [exclude(similarByPrice?.data ?? []), exclude(similarBySurface?.data ?? [])];
  }, [similarByPrice?.data, similarBySurface?.data, property?.id]);

  // Build amenity groups from loaded tags
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
      if (groups.length > 0) {
        setActiveTab(prev => prev === '4' ? prev : groups[0].type.toString());
      }
    }
  }, [tagsData]);

  const amenityTabs = amenityGroups.map(group => ({
    key: group.type.toString(),
    label: group.title,
  }));

  useEffect(() => {
    if (!property) return;
    const hasDetails = !!(
      property.expenses ||
      property.floors_amount ||
      property.garage_coverage ||
      property.postal_code ||
      property.semiroofed_surface ||
      property.surface_front ||
      property.surface_length
    );
    if (hasDetails) setActiveTab('4');
  }, [property]);

  const getAmenitiesByTab = (): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    const selectedTagIds = (property?.tags ?? []).map(t => t.tag_id);
    amenityGroups.forEach(group => {
      const groupKey = group.type.toString();
      result[groupKey] = group.options
        .filter((option: AmenityTag) => selectedTagIds.includes(option.id))
        .map((option: AmenityTag) => option.name);
    });
    result[4] = [];
    if (property?.expenses)  result[4].push(`Expensas: ${formatNumbers(property.expenses)} ${property.currency_expenses ?? ''}`);
    if (property?.floors_amount)  result[4].push(`Pisos: ${property.floors_amount}`);
    if (property?.garage_coverage)  result[4].push(`Cobertura cochera: ${property.garage_coverage}`);
    if (property?.postal_code)  result[4].push(`Código postal: ${property.postal_code}`);
    if (property?.semiroofed_surface)  result[4].push(`Superficie semicubierta: ${formatNumbers(property.semiroofed_surface)} ${property.surface_measurement ?? ''}`);
    if (property?.surface_front)  result[4].push(`Frente: ${formatNumbers(property.surface_front)} ${property.surface_measurement ?? ''}`);
    if (property?.surface_length)  result[4].push(`Fondo: ${formatNumbers(property.surface_length)} ${property.surface_measurement ?? ''}`);
    if (result[4].length === 0) delete result[4];
    return result;
  };

  const dynamicAmenities = getAmenitiesByTab();
  // Gallery images (non-blueprint, completed uploads)
  const galleryImages = useMemo(() => {
    return (property?.images ?? [])
      .filter(img => !img.is_blueprint && img.upload_status === 'completed')
      .map(img => img.url.includes('http') ? img.url : `${AWS_S3_BUCKET_URL}/${img.url}`);
  }, [property]);

  // Gallery videos (excluding 360)
  const galleryVideos = useMemo(() => {
    return ((property?.videos ?? []) as unknown as (GalleryVideo & { is_360?: boolean })[]).filter(v => !v.is_360).sort((a, b) => a.order - b.order);
  }, [property]);

  // Gallery plans (attached files)
  const galleryPlans = useMemo(() => {
    return (property?.attached ?? []).filter(a => a.upload_status === 'completed');
  }, [property]);

  // 360 videos (from videos array where is_360 === true)
  const gallery360 = useMemo(() => {
    return ((property?.videos ?? []) as unknown as (GalleryVideo & { is_360?: boolean })[]).filter(v => v.is_360).sort((a, b) => a.order - b.order);
  }, [property]);

  const dynamicFeatures = useMemo(() => {
    if (!property) return [];
    const features: { label: string; icon: string }[] = [];

    if (property.age === 0) features.push({ label: 'A estrenar', icon: '/icons/calendar.svg' });
    else if (property.age === -1) features.push({ label: 'En construcción', icon: '/icons/calendar.svg' });
    else if (property.age! > 0) features.push({ label: `${property.age} años`, icon: '/icons/calendar.svg' });

    if (property.orientation) features.push({ label: ORIENTATION_LABELS[property.orientation as Orientation] ?? String(property.orientation), icon: '/icons/orientacion.svg' });
    if (property.total_surface && property.total_surface > 0 && property.surface_measurement) features.push({ label: `${formatNumbers(property.total_surface)} ${property.surface_measurement} tot.`, icon: '/icons/regla.svg' });
    if (property.roofed_surface && property.roofed_surface > 0 && property.roofed_surface_measurement) features.push({ label: `${formatNumbers(property.roofed_surface)} ${property.roofed_surface_measurement} cub`, icon: '/icons/mcubiertos.svg' });
    if (property.room_amount) features.push({ label: `${formatNumbers(property.room_amount)} amb.`, icon: '/icons/door.svg' });
    if (property.parking_lot_amount) features.push({ label: `${formatNumbers(property.parking_lot_amount)} cochera${property.parking_lot_amount > 1 ? 's' : ''}`, icon: '/icons/cochera.svg' });
    if (property.suite_amount) features.push({ label: `${formatNumbers(property.suite_amount)} dorm.`, icon: '/icons/cama.svg' });
    if (property.bathroom_amount) features.push({ label: `${formatNumbers(property.bathroom_amount)} baño${property.bathroom_amount > 1 ? 's' : ''}`, icon: '/icons/bano.svg' });
    if (property.toilet_amount) features.push({ label: `${formatNumbers(property.toilet_amount)} toilette${property.toilet_amount > 1 ? 's' : ''}`, icon: '/icons/toilete.svg' });
    
    return features;
  }, [property]);
  const showFeaturesToggle = dynamicFeatures?.length > 6;
  const showSummaryToggle = (property?.description?.length ?? 0) > 140;

  // Derived display values
  
  const priceDisplay = property?.price_square_meter ? `${property.currency} ${formatNumbers(property.price_square_meter)}  /m²` : '';
  const statusDisplay = `${property?.property_type ? `${PROPERTY_TYPE_LABELS[property.property_type as PropertyType]} ` : ''}${property?.property_subtype ? `${PROPERTY_SUBTYPE_LABELS[property.property_subtype as PropertySubtype]} ` : ''}${property?.operation_type ? `En ${OPERATION_TYPE_LABELS[property.operation_type as OperationType]}` : ''}`;
  const agentName = property?.organization?.name ?? 'Metroprop';
  const agentLogoText = agentName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  
  const countryLabel = locations.find(l => l.id === property?.country_id)?.name;
  const stateLabel = locations.find(l => l.id === property?.state_id)?.name;
  const locationLabel = locations.find(l => l.id === property?.location_id)?.name;
  const subLocationLabel = locations.find(l => l.id === property?.sub_location_id)?.name;
  const addressParts = [property?.street, subLocationLabel, locationLabel, stateLabel, countryLabel].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Dirección no especificada';

  const updateSimilarScrollState = (index: number) => {
    const container = similarRefs.current[index];
    if (!container) return;
    const { scrollLeft, scrollWidth, offsetWidth } = container;
    setSimilarCanScrollLeft((prev) => {
      const next = [...prev];
      next[index] = scrollLeft > 0;
      return next;
    });
    setSimilarCanScrollRight((prev) => {
      const next = [...prev];
      next[index] = scrollLeft + offsetWidth < scrollWidth;
      return next;
    });
  };

  const handleSimilarScroll = (index: number) => {
    updateSimilarScrollState(index);
  };

  const scrollSimilar = (index: number, direction: 'left' | 'right') => {
    const container = similarRefs.current[index];
    if (!container) return;
    const scrollAmount = 300;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    setTimeout(() => updateSimilarScrollState(index), 300);
  };

  useEffect(() => {
    // Recalculate after DOM updates when similar data changes
    requestAnimationFrame(() => {
      SIMILAR_SECTIONS.forEach((_, index) => {
        updateSimilarScrollState(index);
      });
    });
  }, [similarPropertiesData]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSubmenuVisible(window.scrollY > 120);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateOffset = () => {
      const header = document.querySelector('.header-container') as HTMLElement | null;
      if (!header) return;
      setSubmenuOffset(header.offsetHeight);
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);


  const handleSubmenuItemClick = (itemId: string) => {
    console.log("Submenu item clicked:", itemId);
    const target = document.getElementById(`property-detail-${itemId}`);
    if (!target) return;
    const offset = 180;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
    <div className="property-detail-page">
			<Header />
      <PropertyDetailSubmenu
        className={isSubmenuVisible ? 'is-visible' : ''}
        style={{ top: submenuOffset }}
        onItemClick={handleSubmenuItemClick}
      />
      <PhoneRevealModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
      <WhatsappModal
        isOpen={isWhatsappModalOpen}
        onClose={() => setIsWhatsappModalOpen(false)}
      />
      <button className="detail-back" onClick={() => router.back()} aria-label="Go back">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={24} height={24}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Atrás
      </button>  
      <main className="property-detail-content">
        
        <section className="property-detail-hero" id="property-detail-fotos">
          <div className="property-detail-hero-row">
            <p className="property-detail-status"><span className='status-icon'></span>{statusDisplay}</p>
            <div className="property-detail-price">
              <span>{priceDisplay}</span>
              <button
                type="button"
                className="property-detail-info"
                aria-label="Mas informacion"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M11 11h2v6h-2z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
          <h1 className="property-detail-title">{property ? `${property.currency} ${formatNumbers(property.price)}` : ''}</h1>
        </section>

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
                  <div className="property-detail-gallery-overlay">
                    <span onClick={(e) => e.stopPropagation()}>
                      <Button label="Ver todas las fotos" variant="secondary" icon={<img src="/icons/verGaleria.svg" alt="" />} onClick={() => openGallery('fotos', 0)} />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section
          className={`property-detail-features ${
            showFeaturesToggle ? 'is-toggleable' : ''
          } ${featuresExpanded ? 'is-expanded' : 'is-collapsed'}`}
          id="property-detail-informacion"
        >
          <div className="property-detail-features-grid">
            {dynamicFeatures.map((item, index) => (
              <div key={`${item.label}-${index}`} className="property-detail-feature">
                <img src={item.icon} alt="" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          {showFeaturesToggle && (
            <button
              type="button"
              className="property-detail-features-toggle"
              onClick={() => setFeaturesExpanded((prev) => !prev)}
              aria-expanded={featuresExpanded}
            >
              {featuresExpanded ? 'Ver menos' : 'Ver mas'}
              <img
                src="/icons/chevron-up.svg"
                alt=""
                aria-hidden="true"
                className={featuresExpanded ? 'expanded' : ''}
              />
            </button>
          )}
        </section>

        <div className="property-detail-body">
          <div className="property-detail-left">
            <section className="property-detail-summary" id="property-detail-descripcion">
              <h2>{property?.publication_title}</h2>
              <div className="property-detail-summary-grid">
                <p className={summaryExpanded ? 'summary-expanded' : 'summary-collapsed'}>
                  {property?.description ?? ''}
                </p>
              </div>
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
                </button>
              )}
            </section>

            <section className="property-detail-map" id="property-detail-direccion">
              <div className="property-detail-address">
                <span className="property-detail-address-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 2c-4.4 0-8 3.6-8 8 0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span>{address}</span>
              </div>
              <div className="property-detail-map-image">
                <PropertyMap address={property?.street ?? ''} lat={property?.geo_lat} lng={property?.geo_long} />
              </div>
            </section>

            {Object.values(dynamicAmenities).some(arr => arr.length > 0) && (
            <section className="property-detail-amenities" id="property-detail-amenities">
              <h2>Conoce mas sobre esta propiedad</h2>
              <div className="property-detail-amenities-tabs">
                {dynamicAmenities[4] && dynamicAmenities[4].length > 0 && (
                  <button
                    key="detalles"
                    type="button"
                    className={`property-detail-amenities-tab ${activeTab === "4" ? 'active' : ''}`}
                    onClick={() => setActiveTab("4")}
                  >
                    Detalles
                  </button>
                )}
                {amenityTabs.filter(tab => dynamicAmenities[tab.key]?.length > 0).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`property-detail-amenities-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="property-detail-amenities-content">
                {dynamicAmenities[activeTab]?.length > 0 ? (
                  dynamicAmenities[activeTab].map((item, index) => (
                    <span key={`${item}-${index}`}>{item}</span>
                  ))
                ) : (
                  <span>-</span>
                )}
              </div>
            </section>
            )}

            {/*<section className="property-detail-issues">
              <div className="property-detail-issues-title">
                <span className="property-detail-warning" aria-hidden="true">
                  <img src="/icons/warning.svg" alt="" />
                </span>
                <h3>{propertyDetailData.labels.issuesTitle}</h3>
              </div>
              <div className="property-detail-issues-actions">
                {propertyDetailData.issues.map((issue) => (
                  <Button key={issue} label={issue} variant="outline" buttonType="2" />
                ))}
              </div>
            </section>*/}
          </div>

          <aside className="property-detail-right">
            <ContactForm />

            <div className="property-detail-agent">
              <div className="property-detail-agent-header">
                <div className="property-detail-agent-logo">{agentLogoText}</div>
                <div>
                  <h4>{agentName}</h4>
                  <span>{property?.organization?.name ? 'Inmobiliaria' : 'Inmobiliaria'}</span>
                </div>
              </div>
              <div className="property-detail-agent-details">
                <button type="button" onClick={() => setIsPhoneModalOpen(true)}>
                  Ver telefono
                </button>
              </div>
            </div>
          </aside>
        </div>

        {SIMILAR_SECTIONS.map((section, index) => (
          <section key={section.title} className="property-detail-similar">
            <h2>{section.title}</h2>
            <div className="property-detail-similar-wrapper">
              {similarCanScrollLeft[index] && (
                <button
                  type="button"
                  className="property-detail-gallery-arrow property-detail-gallery-arrow-left"
                  aria-label="Scroll left"
                  onClick={() => scrollSimilar(index, 'left')}
                >
                  <img src="/icons/chevron-up.svg" alt="" />
                </button>
              )}
              <div
                className="property-detail-cards"
                ref={(el) => {
                  similarRefs.current[index] = el;
                }}
                onScroll={() => handleSimilarScroll(index)}
              >
                {(similarPropertiesData[index] ?? []).map((item) => {
                  const firstImage = (item.images ?? []).find(img => !img.is_blueprint && img.upload_status === 'completed');
                  const imageUrl = firstImage ? (firstImage.url.includes('http') ? firstImage.url : `${AWS_S3_BUCKET_URL}/${firstImage.url}`) : '/images/property-placeholder.png';
                  return (
                    <a href={`/propertyDetail/${item.id}`} key={item.id} style={{ textDecoration: 'none' }}>
                      <PropertyCard
                        property={{
                          id: String(item.id ?? ''),
                          price: item.price ?? 0,
                          expenses: item.expenses ?? 0,
                          currency: (item.currency as 'USD' | 'ARS' | 'EUR') ?? 'USD',
                          currencyRent: item.currency_expenses ?? item.currency ?? '',
                          pricePerSqm: item.price_square_meter,
                          title: item.publication_title ?? '',
                          address: item.street ?? '',
                          rooms: item.room_amount ?? 0,
                          bathrooms: item.bathroom_amount ?? 0,
                          area: item.total_surface ?? 0,
                          image: imageUrl,
                          isFavorite: false,
                        }}
                      />
                    </a>
                  );
                })}
              </div>
              {similarCanScrollRight[index] && (
                <button
                  type="button"
                  className="property-detail-gallery-arrow property-detail-gallery-arrow-right"
                  aria-label="Scroll right"
                  onClick={() => scrollSimilar(index, 'right')}
                >
                  <img src="/icons/chevron-up.svg" alt="" />
                </button>
              )}
            </div>
          </section>
        ))}
      </main>

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

      <div
        className={`property-detail-contact-modal ${isContactModalOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Contacta al anunciante"
      >
        <div
          className="property-detail-contact-modal-backdrop"
          onClick={() => setIsContactModalOpen(false)}
        />
        <div className="property-detail-contact-modal-panel">
          <div className="property-detail-contact-modal-header">
            <h2>Contacta al anunciante</h2>
            <button
              type="button"
              className="property-detail-gallery-modal-close"
              aria-label="Cerrar"
              onClick={() => setIsContactModalOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6l-12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="property-detail-contact-modal-body">
            <ContactForm isModal />
          </div>
        </div>
      </div>

      <div className="property-detail-mobile-actions">
        {CONTACT_ACTIONS.map((action) => (
          <Button
            key={`mobile-${action.id}`}
            label={action.label}
            variant={action.variant === 'primary' ? 'primary' : 'secondary'}
            className={`property-detail-mobile-action property-detail-mobile-action-${action.variant}`}
            icon={<img src={action.icon} alt="" aria-hidden="true" />}
            iconPosition="left"
            onClick={() => {
              if (action.id === 'whatsapp') {
                setIsWhatsappModalOpen(true);
                return;
              }
              setIsContactModalOpen(true);
            }}
          />
        ))}
      </div>

      <Footer />
    </div>
    </APIProvider>
  );
}
