'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import './PropertyDetail.scss';
import Header from '@/layout/Header/Header';
import Footer from '@/layout/Footer/Footer';
import Button from '@/ui/Button/Button';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import PropertyDetailSubmenu from './PropertyDetailSubmenu/PropertyDetailSubmenu';
import PhoneRevealModal from '@/components/PhoneRevealModal/PhoneRevealModal';
import WhatsappModal from '@/components/WhatsappModal/WhatsappModal';
import { useQuery } from '@tanstack/react-query';
import { AmenityGroup, AmenityTag, AmenityType, AMENITY_TYPE_LABELS, OperationType, OPERATION_TYPE_LABELS, ORIENTATION_LABELS, Orientation, CreateProperty, PROPERTY_TYPE_LABELS, PropertyType, PROPERTY_SUBTYPE_LABELS, PropertySubtype } from '@/types/propiedad';
import { API_BASE_URL, saveVisitedProperty, setImagePath } from '@/utils/utils';
import { APIProvider } from '@vis.gl/react-google-maps';
import PropertyMap from './PropertyMap/PropertyMap';
import GalleryModal, { GalleryTab, GalleryVideo } from './GalleryModal/GalleryModal';
import ContactForm from '../../../../components/ContactForm/ContactForm';
import { useLocations } from '@/lib/locations';
import { formatNumbers, formatCurrency } from '@/utils/utils';
import { AWS_S3_BUCKET_URL, ORGANIZATION_NO_IMAGE } from '@/app/constants';
import { fetchProperties } from '@/lib/properties';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import { useFavoriteIds, useToggleFavorite } from '@/lib/useFavoriteIds';
import ShareModal from '@/components/ShareModal/ShareModal';
import Link from 'next/link';

interface PropertyDetailProps {
  propertyId: string;
}

const SIMILAR_SECTIONS = [
  { title: 'Propiedades similares', count: 5 },
  { title: 'Propiedades similares por m2', count: 5 },
];

const CONTACT_ACTIONS = [
  { id: 'whatsapp', label: 'Whatsapp', icon: '/icons/whatsapp.svg', variant: 'whatsapp' },
  { id: 'contact', label: 'Contactar', icon: '/icons/envelope_w.svg', variant: 'primary' },
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
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('');
  const [openUnitGroups, setOpenUnitGroups] = useState<Record<string, boolean>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const toggleUnitGroup = (tipo: string) => {
    setOpenUnitGroups(prev => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  const openGallery = (tab: GalleryTab = 'fotos', index = 0) => {
    setGalleryInitialTab(tab);
    setGalleryInitialIndex(index);
    setIsGalleryOpen(true);
  };

  // Fetch property detail
  const { data: property, isLoading, isError } = useQuery<CreateProperty>({
    queryKey: ['property', propertyId],
    queryFn: async () => apiFetch<CreateProperty>(`${API_BASE_URL}/properties/${propertyId}`),
    enabled: !!propertyId,
  });

  // Fetch tags for amenity tab names
  const { data: tagsData = [] } = useQuery<AmenityTag[]>({
    queryKey: ['tags'],
    queryFn: async () => apiFetch<AmenityTag[]>(`${API_BASE_URL}/tags`),
  });

  // Fetch similar properties by price
  const { data: similarByPrice } = useQuery({
    queryKey: ['similar-by-price', property?.id],
    queryFn: () => fetchProperties({
      ...(property?.is_development ? { is_development: 1 } : {}),
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
      ...(property?.is_development ? { is_development: 1 } : {}),
      state_id: property?.state_id ? property.state_id : undefined,
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
    if (property?.expenses)  result[4].push(`Expensas: ${formatNumbers(property.expenses)} ${formatCurrency(property.currency_expenses ?? '')}`);
    if (property?.floors_amount)  result[4].push(`Pisos: ${property.floors_amount}`);
    if (property?.garage_coverage)  result[4].push(`Cobertura cochera: ${property.garage_coverage}`);
    if (property?.postal_code)  result[4].push(`Código postal: ${property.postal_code}`);
    if (property?.semiroofed_surface && property?.semiroofed_surface > 0)  result[4].push(`Superficie semicubierta: ${formatNumbers(property.semiroofed_surface)} ${property.surface_measurement ?? ''}`);
    if (property?.surface_front && property?.surface_front > 0)  result[4].push(`Frente: ${formatNumbers(property.surface_front)} ${property.surface_measurement ?? ''}`);
    if (property?.surface_length && property?.surface_length > 0)  result[4].push(`Fondo: ${formatNumbers(property.surface_length)} ${property.surface_measurement ?? ''}`);
    if (result[4].length === 0) delete result[4];
    return result;
  };

  const dynamicAmenities = getAmenitiesByTab();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  // Gallery images (non-blueprint, completed uploads)
  const galleryImages = useMemo(() => {
    return (property?.images ?? [])
      .filter(img => !img.is_blueprint && img.upload_status === 'completed')
      .map(img => setImagePath(img.url));
  }, [property]);

  // Register a view on the backend
  useEffect(() => {
    if (!property?.id) return;
    apiFetch(`${API_BASE_URL}/properties/${property.id}/view`, { method: 'POST' }).catch(() => {});
  }, [property?.id]);

  // Save this property to visited history in localStorage
  useEffect(() => {
    if (!property) return;
    saveVisitedProperty(property as any);
  }, [property, galleryImages, propertyId]);

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
  const priceDisplay = property?.price_square_meter ? `${formatCurrency(property.currency)} ${formatNumbers(property.price_square_meter)}  /m²` : '';
  const statusDisplay = `${property?.property_type ? `${PROPERTY_TYPE_LABELS[property.property_type as PropertyType]} ` : ''}${property?.property_subtype ? `- ${PROPERTY_SUBTYPE_LABELS[property.property_subtype as PropertySubtype]} ` : ''}${property?.operation_type ? `En ${OPERATION_TYPE_LABELS[property.operation_type as OperationType]}` : ''}`;

  const devMinPrice = (() => {
    const prices = (property?.units ?? []).map(u => u.price ?? 0).filter(p => p > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const currency = (property?.units ?? [])[0]?.currency ?? property?.currency ?? '';
    return `Venta desde ${formatCurrency(currency)} ${formatNumbers(min)}`;
  })();
  const uniqueRoomAmounts = [...new Set((property?.units ?? []).map(u => u.room_amount ?? 0))].sort((a, b) => a - b);
  const showUnitFilters = uniqueRoomAmounts.length > 1;

  const agentName = property?.organization ? property.organization.company_name : property?.user?.name ?? 'USER COMUN';
  const agentLogo = property?.organization?.company_logo 
    ? property.organization.company_logo.includes('http') 
      ? property.organization.company_logo
      : `${AWS_S3_BUCKET_URL}/${property.organization.company_logo}`
    : ORGANIZATION_NO_IMAGE;
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

  const rangeLabel = (values: number[], singular: string, plural: string, suffix = '') => {
    const filtered = values.filter(v => v > 0);
    if (filtered.length === 0) return null;
    const min = Math.min(...filtered);
    const max = Math.max(...filtered);
    const noun = max === 1 ? singular : plural;
    return min === max ? `${min}${suffix} ${noun}` : `${min}${suffix} a ${max}${suffix} ${noun}`;
  };

  // Build property features from unit ranges
  const buildFeaturesDevelopment = () => {
    const units = property?.units ?? [];
    const features = [];

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
  
  const unidadesPorTipo = (property?.units ?? []).reduce<Record<string, CreateProperty[]>>((acc, unit) => {
    const rooms = unit.room_amount ?? 0;
    const key = rooms === 0 ? 'Monoambiente' : rooms === 1 ? '1 ambiente' : `${rooms} ambientes`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(unit);
    return acc;
  }, {});

  const getUnidadCount = (units: CreateProperty[]) => units.reduce((acc, unit) => acc + (unit.development_available_unit_count ?? 0), 0);

  const getPrecioDesde = (units: CreateProperty[]) => {
    const prices = units.map(u => u.price ?? 0).filter(p => p > 0);
    if (prices.length === 0) return '-';
    const currency = units[0]?.currency ?? '';
    return `${formatCurrency(currency)} ${Math.min(...prices).toLocaleString('es-AR')}`;
  };
  const getSupDesde = (units: CreateProperty[]) => {
    const sups = units.map(u => Number(u.total_surface)).filter(s => s > 0);
    if (sups.length === 0) return '-';
    const meas = units[0]?.surface_measurement ?? 'm²';
    return `${Math.min(...sups)} ${meas}`;
  };

  const getRoomsRange = (units: CreateProperty[]) => {
    const rooms = units.map(u => u.room_amount ?? 0);
    return rangeLabel(rooms, 'amb.', 'amb.');
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
    const target = document.getElementById(`property-detail-${itemId}`);
    if (!target) return;
    const offset = 180;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const openUnitDetailInNewTab = (unitId?: number) => {
    if (!unitId) return;
    window.open(`/propertyDetail/${unitId}`, '_blank', 'noopener,noreferrer');
  };

  const dynamicFeaturesDevelopment = property?.is_development ? buildFeaturesDevelopment() : [];

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
    <div className="property-detail-page">
      <PropertyDetailSubmenu
        className={isSubmenuVisible ? 'is-visible' : ''}
        style={{ top: submenuOffset }}
        onItemClick={handleSubmenuItemClick}
        isFavorite={property?.id != null && favoriteIds.has(property.id)}
        onToggleFavorite={() => property?.id != null && toggleFavorite(property.id)}
        openShareModal={() => setIsShareModalOpen(true)}
      />
      {isPhoneModalOpen && <PhoneRevealModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        propertyId={property?.id}
        userId={property?.user_id}
        organizationId={(property as any)?.user?.organization_id ?? property?.organization_id}
        ownerName={property?.owner_name}
        ownerEmail={property?.owner_email}
        ownerPhone={property?.owner_phone}
        user={(property as any)?.user}
      />}
      {isWhatsappModalOpen && <WhatsappModal
        isOpen={isWhatsappModalOpen}
        onClose={() => setIsWhatsappModalOpen(false)}
        phoneNumber={property?.user ? property.user.phone : property?.owner_phone ?? ''}
        propertyId={property?.id ?? 0}
        userId={property?.user_id}
        organizationId={(property as any)?.user?.organization_id ?? property?.organization_id}
      />}
      {isShareModalOpen && <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        property={property}
      />}
      <button className="detail-back" onClick={() => router.back()} aria-label="Go back">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={24} height={24}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Atrás
      </button>  
      <main className="property-detail-content">
        {isLoading && (
          <div className="property-detail-skeleton">
            <div className="skeleton-hero">
              <div className="skeleton-line w-40" />
              <div className="skeleton-line w-24 skeleton-title" />
            </div>
            <div className="skeleton-gallery">
              <div className="skeleton-gallery-main skeleton-block" />
              <div className="skeleton-gallery-grid">
                <div className="skeleton-block" />
                <div className="skeleton-block" />
                <div className="skeleton-block" />
                <div className="skeleton-block" />
              </div>
            </div>
            <div className="skeleton-features">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-feature">
                  <div className="skeleton-block skeleton-icon" />
                  <div className="skeleton-line w-16" />
                </div>
              ))}
            </div>
            <div className="skeleton-body">
              <div className="skeleton-main">
                <div className="skeleton-line w-80" />
                <div className="skeleton-line w-full" />
                <div className="skeleton-line w-full" />
                <div className="skeleton-line w-3/4" />
                <div className="skeleton-map skeleton-block" />
                <div className="skeleton-line w-48 skeleton-section-title" />
                <div className="skeleton-tabs">
                  <div className="skeleton-tab skeleton-block" />
                  <div className="skeleton-tab skeleton-block" />
                  <div className="skeleton-tab skeleton-block" />
                </div>
              </div>
              <div className="skeleton-sidebar skeleton-block" />
            </div>
          </div>
        )}
        {!isLoading && !property ? (
          <div className="property-detail-not-found">
            <h1>Propiedad no encontrada</h1>
          </div>
        ) : (<>
        <section className="property-detail-hero" id="property-detail-fotos">
           {property?.is_development
           ? <div className="property-detail-hero-row">
            <div className="publish-review-preview-hero">
              <span className="entrega">
                <img src={'/icons/crane.svg'} alt="Crane Icon" />
                En pozo - Entrega {new Date(property?.development_delivery_date).toLocaleDateString("es-ES")}
              </span>
            </div>
          </div>
          : !property?.development_id && <div className="property-detail-hero-row">
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
          </div>}

          <h1 className="property-detail-title">{property 
            ? property.is_development 
              ? (devMinPrice ?? 'Venta desde -')
              : `${ property.development_id !== null ? 'Venta desde ' : ''}${formatCurrency(property.currency)} ${formatNumbers(property.price)}`
            : ''}</h1>
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

        {property?.development_id !== null && !property?.is_development && 
        <section className="property-unit-details property-detail-summary">
          <div className="property-unit-delivery"><img src={'/icons/crane.svg'} alt="Crane Icon" />En pozo - entrega estimada: {new Date(property?.development?.development_delivery_date).toLocaleDateString("es-ES")}</div>
          <h2>{property?.publication_title}</h2>
          <div className="publish-review-address-1">
            <span className="publish-review-address-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" stroke="currentColor" fill="#ffffff">
                <path d="M8.80978 18.57C8.64658 18.6872 8.45071 18.7503 8.24978 18.7503C8.04885 18.7503 7.85298 18.6872 7.68978 18.57C2.86078 15.128 -2.26422 8.048 2.91678 2.932C4.33912 1.53285 6.25462 0.749124 8.24978 0.750001C10.2498 0.750001 12.1688 1.535 13.5828 2.931C18.7638 8.047 13.6388 15.126 8.80978 18.57Z" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.25 9.75C8.78043 9.75 9.28914 9.53929 9.66421 9.16421C10.0393 8.78914 10.25 8.28043 10.25 7.75C10.25 7.21957 10.0393 6.71086 9.66421 6.33579C9.28914 5.96071 8.78043 5.75 8.25 5.75C7.71957 5.75 7.21086 5.96071 6.83579 6.33579C6.46071 6.71086 6.25 7.21957 6.25 7.75C6.25 8.28043 6.46071 8.78914 6.83579 9.16421C7.21086 9.53929 7.71957 9.75 8.25 9.75Z" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>{address}</span>
          </div>
        </section>
        }

        <section
          className={`property-detail-features ${
            showFeaturesToggle ? 'is-toggleable' : ''
          } ${featuresExpanded ? 'is-expanded' : 'is-collapsed'}
          ${property?.development_id ? 'unit-features' : ''}`}
          id="property-detail-informacion"
        >
          <div className="property-detail-features-grid">
            {dynamicFeatures?.map((item, index) => (
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
              {!(property?.development_id !== null && !property?.is_development) && <h2>{property?.publication_title}</h2>}
              {property?.is_development && <> 
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
                {dynamicFeaturesDevelopment?.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="publish-review-feature">
                    <img src={item.icon} alt="" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              </>}

              <div className="property-detail-summary-grid">
                {property?.is_development && <h4>Sobre el emprendimiento</h4>}
                {property?.development_id && <h4>Sobre la unidad</h4>}
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

            {property?.is_development &&  
            <section className="units-section">
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
                })
                .map(([tipo, unidades]) => (
                <div key={tipo} className={`unit-type-group${openUnitGroups[tipo] ? ' is-open' : ''}`}>
                  {/* Unit Type Header */}
                  <div 
                    className="unit-type-header" 
                    onClick={() => toggleUnitGroup(tipo)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleUnitGroup(tipo);
                      }
                    }}
                  >
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
                    <div className="unit-type-count-and-toggle">
                      <div className="unit-type-count">
                        <span className="count-number">{getUnidadCount(unidades)}</span>
                        <span className="count-label">unidades disponibles</span>
                      </div>
                      <svg 
                        className={`unit-type-chevron ${openUnitGroups[tipo] ? 'expanded' : ''}`}
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none"
                      >
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Units Table/List */}
                  <div className="unit-type-content">
                    {/* Desktop Table View */}
                      <div className="units-table units-table-desktop">
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
                          const canOpenUnit = !!unit.id;
                          return (
                            <div
                              key={unit.id ?? index}
                              className="table-row"
                              onClick={() => openUnitDetailInNewTab(unit.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  openUnitDetailInNewTab(unit.id);
                                }
                              }}
                              role={canOpenUnit ? 'link' : undefined}
                              tabIndex={canOpenUnit ? 0 : undefined}
                              style={{ cursor: canOpenUnit ? 'pointer' : 'default' }}
                            >
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

                      {/* Mobile List View */}
                      <div className="units-list units-list-mobile">
                        {unidades.map((unit, index) => {
                          const pricePerM2 = unit.price && Number(unit.total_surface) > 0
                            ? `${formatCurrency(unit.currency ?? '')} ${Math.round(unit.price / Number(unit.total_surface)).toLocaleString('es-AR')}`
                            : '-';
                          const priceTotal = unit.price
                            ? `${formatCurrency(unit.currency ?? '')} ${unit.price.toLocaleString('es-AR')}`
                            : '-';
                          const canOpenUnit = !!unit.id;
                          return (
                            <div
                              key={unit.id ?? index}
                              className="unit-item"
                              onClick={() => canOpenUnit && openUnitDetailInNewTab(unit.id)}
                              onKeyDown={(event) => {
                                if (canOpenUnit && (event.key === 'Enter' || event.key === ' ')) {
                                  event.preventDefault();
                                  openUnitDetailInNewTab(unit.id);
                                }
                              }}
                              role={canOpenUnit ? 'link' : undefined}
                              tabIndex={canOpenUnit ? 0 : undefined}
                              style={{ cursor: canOpenUnit ? 'pointer' : 'default' }}
                            >
                              <div className="unit-field">
                                <span className="unit-label">Unidad:</span>
                                <span className="unit-value">{unit.publication_title ?? '-'}</span>
                              </div>
                              <div className="unit-field">
                                <span className="unit-label">Sup. Total:</span>
                                <span className="unit-value">{unit.total_surface ? `${unit.total_surface} ${unit.surface_measurement ?? ''}` : '-'}</span>
                              </div>
                              <div className="unit-field">
                                <span className="unit-label">Sup. Cubierta:</span>
                                <span className="unit-value">{unit.roofed_surface ? `${unit.roofed_surface} ${unit.roofed_surface_measurement ?? ''}` : '-'}</span>
                              </div>
                              <div className="unit-field">
                                <span className="unit-label">Baños:</span>
                                <span className="unit-value">{unit.bathroom_amount ?? '-'}</span>
                              </div>
                              <div className="unit-field">
                                <span className="unit-label">Precio m²:</span>
                                <span className="unit-value">{pricePerM2}</span>
                              </div>
                              <div className="unit-field">
                                <span className="unit-label">Precio total:</span>
                                <span className="unit-value">{priceTotal}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  </div>
                </div>
              ))}
            </section>}

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
                <PropertyMap address={property?.street ?? ''} lat={isNaN(Number(property?.geo_lat)) ? undefined : Number(property?.geo_lat)} lng={isNaN(Number(property?.geo_long)) ? undefined : Number(property?.geo_long)} />
              </div>
            </section>

            {(property?.is_development || (!property?.development_id && !property?.is_development)) 
            ? Object.values(dynamicAmenities).some(arr => arr.length > 0) && (
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
            ): property?.development && (
            <section className="unit-details-development">
              <h4>Esta unidad pertenece al emprendimiento</h4>
              <Link prefetch={false}  href={`/propertyDetail/${property?.development?.id}`} target="_blank" rel="noopener noreferrer">
                <div className="unit-details-development-info">
                  {property?.development?.images?.[0] ? <img src={setImagePath(property?.development?.images?.[0]?.url) ?? ''} alt="Imagen del emprendimiento" className="unit-details-development-image" /> : null}
                  <div className="unit-details-development-text">
                    <h5>{property?.development?.publication_title ?? ''}</h5>
                    <p className="development-delivery">{property?.development?.development_delivery_date ? `Fecha de entrega: ${new Date(property?.development?.development_delivery_date).toLocaleDateString("es-ES")}` : ''}</p>
                    <p className="development-rooms"><img src="/icons/door.svg" alt="Rooms" /> {getRoomsRange(property?.development?.units ?? [])}</p>
                  </div>
                </div>
              </Link>
            </section>)}
          </div>

          <aside className="property-detail-right">
            <ContactForm
              propertyId={property?.id}
              userId={property?.user_id}
              organizationId={(property as any)?.user?.organization_id ?? property?.organization_id}
              phoneNumber={property?.user ? property.user.phone : property?.owner_phone ?? ''}
            />

            <div className="property-detail-agent">
              <div className="property-detail-agent-header">
                <img src={agentLogo} alt={`${agentName} logo`} className="property-detail-agent-logo" />
                <div>
                  <h4>{agentName}</h4>
                  <span>{property?.organization?.name ?? ''}</span>
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
            {(similarPropertiesData[index] ?? []).length > 0 && <h2>{section.title}</h2>}
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
                {(similarPropertiesData[index] ?? []).map((item) => <PropertyCard
                  key={item.id}
                  property={{ ...item, isFavorite: false } as any}
                  cardType="home"
                />)}
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
        </>)}
      </main>

      {isGalleryOpen && <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImages}
        videos={galleryVideos as unknown as GalleryVideo[]}
        plans={galleryPlans}
        gallery360={gallery360 as unknown as GalleryVideo[]}
        initialTab={galleryInitialTab}
        initialIndex={galleryInitialIndex}
      />}
      {isContactModalOpen && (
        <ContactForm
          isModal
          propertyId={property?.id}
          userId={property?.user_id}
          organizationId={(property as any)?.user?.organization_id ?? property?.organization_id}
          onClose={() => setIsContactModalOpen(false)}
      />)}
      <div className="property-detail-mobile-actions">
        {CONTACT_ACTIONS.map((action) => (
          <Button
            key={`mobile-${action.id}`}
            label={action.label}
            variant={action.variant === 'primary' ? 'primary' : 'secondary'}
            className={`property-detail-mobile-action property-detail-contact-action-${action.variant}`}
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
    </div>
    </APIProvider>
  );
}
