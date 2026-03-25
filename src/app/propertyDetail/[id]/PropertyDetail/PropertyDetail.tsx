'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import './PropertyDetail.scss';
import Header from '@/layout/User/Header/Header';
import Footer from '@/layout/User/Footer/Footer';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import PropertyDetailSubmenu from './PropertyDetailSubmenu/PropertyDetailSubmenu';
import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';
import PhoneRevealModal from '@/components/PhoneRevealModal/PhoneRevealModal';
import WhatsappModal from '@/components/WhatsappModal/WhatsappModal';
import { useQuery } from '@tanstack/react-query';
import { AmenityGroup, AmenityTag, AmenityType, AMENITY_TYPE_LABELS, OperationType, OPERATION_TYPE_LABELS, ORIENTATION_LABELS, Orientation } from '@/types/propiedad';
import { API_BASE_URL } from '@/utils/utils';
import { AWS_S3_BUCKET_URL } from '@/constants';
import { APIProvider } from '@vis.gl/react-google-maps';
import PropertyMap from './PropertyMap/PropertyMap';

interface PropertyDetailProps {
  propertyId: string;
}

interface ApiProperty {
  id: number;
  publication_title: string;
  description?: string;
  operation_type: number;
  property_type: number;
  price: number;
  currency: string;
  expenses?: number;
  currency_expenses?: string;
  street?: string;
  room_amount?: number;
  bathroom_amount?: number;
  toilet_amount?: number;
  suite_amount?: number;
  parking_lot_amount?: number;
  total_surface?: number;
  roofed_surface?: number;
  surface_measurement?: string;
  roofed_surface_measurement?: string;
  property_condition?: string;
  age?: number;
  orientation?: number;
  images?: Array<{ id: number; url: string; is_blueprint: boolean; upload_status?: string }>;
  attached?: Array<{ id: number; file_url: string; upload_status?: string }>;
  tags?: Array<{ id: number; tag_id: number }>;
  organization?: { name?: string; logo_url?: string };
  user?: { id: number; name?: string; phone?: string };
  videos?: Array<{ id: number; url: string; is_360: boolean; order: number }>;
  multimedia360?: string[];
}

const QUESTION_CHIPS = [
  'Se puede visitar hoy',
  'Aceptan permuta',
  'El edificio tiene amenities',
  'Tiene baulera',
];

const SIMILAR_SECTIONS = [
  { title: 'Propiedades similares', count: 5 },
  { title: 'Propiedades similares por m2', count: 5 },
];

const CONTACT_ACTIONS = [
  { id: 'whatsapp', label: 'Whatsapp', icon: '/icons/whatsapp.svg', variant: 'whatsapp' },
  { id: 'contact', label: 'Contactar', icon: '/icons/envelope.svg', variant: 'primary' },
];

const flagIcon = '/icons/flag.svg'
const formatNumbers = (price: number) => Math.ceil(price).toLocaleString('en-US');

const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};
const getYouTubeThumbnail = (videoId: string) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
const getYouTubeEmbed = (videoId: string) => `https://www.youtube.com/embed/${videoId}?autoplay=1`;

export default function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const [activeTab, setActiveTab] = useState<string>('');
  const [amenityGroups, setAmenityGroups] = useState<AmenityGroup[]>([]);
	const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [similarCanScrollLeft, setSimilarCanScrollLeft] = useState<boolean[]>([]);
  const [similarCanScrollRight, setSimilarCanScrollRight] = useState<boolean[]>([]);
  const similarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [isSubmenuVisible, setIsSubmenuVisible] = useState(false);
  const [submenuOffset, setSubmenuOffset] = useState(0);
  const [formState, setFormState] = useState({
    name: '',
    country: '',
    email: '',
    phone: '',
    message: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'fotos' | 'videos' | 'planos' | '360'>('fotos');
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(0);
  const [videoActiveIndex, setVideoActiveIndex] = useState(0);
  const [planActiveIndex, setPlanActiveIndex] = useState(0);
  const galleryThumbsRef = useRef<HTMLDivElement>(null);

  // Fetch property detail
  const { data: property, isLoading, isError } = useQuery<ApiProperty>({
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

  // Build amenity groups from loaded tags (same pattern as PublishFinalReview)
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
        setActiveTab(groups[0].type.toString());
      }
    }
  }, [tagsData]);

  const amenityTabs = amenityGroups.map(group => ({
    key: group.type.toString(),
    label: group.title,
  }));

  const getAmenitiesByTab = (): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    const selectedTagIds = (property?.tags ?? []).map(t => t.tag_id);
    amenityGroups.forEach(group => {
      const groupKey = group.type.toString();
      result[groupKey] = group.options
        .filter((option: AmenityTag) => selectedTagIds.includes(option.id))
        .map((option: AmenityTag) => option.name);
    });
    return result;
  };

  const dynamicAmenities = getAmenitiesByTab();

  // Gallery images (non-blueprint, completed uploads)
  const galleryImages = useMemo(() => {
    return (property?.images ?? [])
      .filter(img => !img.is_blueprint && img.upload_status === 'completed')
      .map(img => `${AWS_S3_BUCKET_URL}/${img.url}`);
  }, [property]);

  // Gallery videos
  const galleryVideos = useMemo(() => {
    return (property?.videos ?? []).sort((a, b) => a.order - b.order);
  }, [property]);

  // Gallery plans (attached files)
  const galleryPlans = useMemo(() => {
    return (property?.attached ?? []).filter(a => a.upload_status === 'completed');
  }, [property]);

  const dynamicFeatures = useMemo(() => {
    if (!property) return [];
    const features: { label: string; icon: string }[] = [];

    if (property.property_condition === 'new') features.push({ label: 'A estrenar', icon: '/icons/calendar.svg' });
    else if (property.property_condition === 'construction') features.push({ label: 'En construcción', icon: '/icons/calendar.svg' });
    else if (property.property_condition === 'years' && property.age) features.push({ label: `${property.age} años`, icon: '/icons/calendar.svg' });

    if (property.orientation) features.push({ label: ORIENTATION_LABELS[property.orientation as Orientation] ?? String(property.orientation), icon: '/icons/orientacion.svg' });
    if (property.total_surface && property.surface_measurement) features.push({ label: `${formatNumbers(property.total_surface)} ${property.surface_measurement} tot.`, icon: '/icons/regla.svg' });
    if (property.roofed_surface && property.roofed_surface_measurement) features.push({ label: `${formatNumbers(property.roofed_surface)} ${property.roofed_surface_measurement} cub`, icon: '/icons/mcubiertos.svg' });
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
  
  const priceDisplay = property ? `${property.currency} ${formatNumbers(property.price)}` : '';
  const statusDisplay = property?.operation_type ? `En ${OPERATION_TYPE_LABELS[property.operation_type as OperationType]}` : '';
  const agentName = property?.organization?.name ?? 'Metroprop';
  const agentLogoText = agentName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

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
    const sectionCount = SIMILAR_SECTIONS.length;
    setSimilarCanScrollLeft((prev) => {
      if (prev.length === sectionCount) return prev;
      return Array.from({ length: sectionCount }, () => false);
    });
    setSimilarCanScrollRight((prev) => {
      if (prev.length === sectionCount) return prev;
      return Array.from({ length: sectionCount }, () => true);
    });

    SIMILAR_SECTIONS.forEach((_, index) => {
      updateSimilarScrollState(index);
    });
  }, []);

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

  const toggleQuestion = (question: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(question) ? prev.filter((item) => item !== question) : [...prev, question]
    );
  };

  const handleCountrySelect = (value: string) => {
    console.log("value", value)
    setFormState((prev) => ({ ...prev, country: value }));
  };

  const primaryContactAction = CONTACT_ACTIONS.find((action) => action.id === 'contact');

  useEffect(() => {
    if (!isContactModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsContactModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isContactModalOpen]);

  useEffect(() => {
    if (!isGalleryOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsGalleryOpen(false);
      if (e.key === 'ArrowRight') {
        if (galleryTab === 'fotos') setGalleryActiveIndex(prev => Math.min(prev + 1, galleryImages.length - 1));
        if (galleryTab === 'videos') setVideoActiveIndex(prev => Math.min(prev + 1, galleryVideos.length - 1));
        if (galleryTab === 'planos') setPlanActiveIndex(prev => Math.min(prev + 1, galleryPlans.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        if (galleryTab === 'fotos') setGalleryActiveIndex(prev => Math.max(prev - 1, 0));
        if (galleryTab === 'videos') setVideoActiveIndex(prev => Math.max(prev - 1, 0));
        if (galleryTab === 'planos') setPlanActiveIndex(prev => Math.max(prev - 1, 0));
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isGalleryOpen, galleryTab, galleryImages.length, galleryVideos.length, galleryPlans.length]);

  useEffect(() => {
    if (!isContactModalOpen) {
      document.body.style.overflow = '';
      return;
    }
    if (window.innerWidth > 768) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isContactModalOpen]);

  const renderContactForm = (options?: { isModal?: boolean }) => {
    const isModal = options?.isModal ?? false;
    const contactActions = isModal && primaryContactAction ? [primaryContactAction] : CONTACT_ACTIONS;

    return (
      <form
        className={`property-detail-contact ${isModal ? 'property-detail-contact-modal-form' : ''}`}
        onSubmit={(event) => event.preventDefault()}
      >
        {!isModal && (
          <div className="property-detail-contact-header">
            <h2>Contacta al anunciante</h2>
          </div>
        )}

        <div className="property-detail-contact-block">
          <h3>Preguntas para el anunciante</h3>
          <p>Selecciona una o mas preguntas, o escribi tu consulta.</p>
          <div className="property-detail-question-grid">
            {QUESTION_CHIPS.map((question) => (
              <button
                key={question}
                type="button"
                className={`property-detail-question ${
                  selectedQuestions.includes(question) ? 'selected' : ''
                }`}
                onClick={() => toggleQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="property-detail-contact-form">
          <div className="property-detail-input-row">
            <InputField2
              label="Nombre"
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
              id="contact_name"
            />
            <InputField2
              label="Email"
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
            />
          </div>
          <div className="property-detail-input-row">
            <InputField2
              label="País"
              value={formState.country}
              onFocus={() => setIsCountryModalOpen(true)}
              onChange={(event) => setFormState({ ...formState, country: event.target.value })}
              id="contact_pais"
              icon={<img src={flagIcon} />}
            />
            <InputField2
              label="Telefono"
              value={formState.phone}
              onChange={(event) => setFormState({ ...formState, phone: event.target.value })}
            />
          </div>
          <div className="property-detail-input-row single">
            <InputField2
              label="Consulta"
              value={formState.message}
              onChange={(event) => setFormState({ ...formState, message: event.target.value })}
              multiline={true}
              rows={4}
              id="contact_consulta"
            />
          </div>
        </div>

        <div className="property-detail-contact-terms">
          <Checkbox
            label="Acepto terminos y condiciones"
            checked={termsAccepted}
            onChange={setTermsAccepted}
          />
          <Checkbox
            label="Acepto politica de privacidad"
            checked={privacyAccepted}
            onChange={setPrivacyAccepted}
          />
        </div>

        <div
          className={`property-detail-contact-actions ${isModal ? 'property-detail-contact-actions-modal' : ''}`}
        >
          {contactActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`property-detail-contact-action property-detail-contact-action-${action.variant}`}
            >
              <img src={action.icon} alt="" aria-hidden="true" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </form>
    );
  };

  const handleSubmenuItemClick = (itemId: string) => {
    const target = document.getElementById(`property-detail-${itemId}`);
    if (!target) return;
    const offset = 80;
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
      <CountryCodeModal
        isOpen={isCountryModalOpen}
        selectedValue={formState.country}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={handleCountrySelect}
      />
      <PhoneRevealModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
      <WhatsappModal
        isOpen={isWhatsappModalOpen}
        onClose={() => setIsWhatsappModalOpen(false)}
      />
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
          <div className="property-detail-gallery-main" onClick={() => { setGalleryTab('fotos'); setGalleryActiveIndex(0); setIsGalleryOpen(true); }} style={{ cursor: 'pointer' }}>
            <img
              src={galleryImages[0] ?? ''}
              alt="Vista principal"
            />            
          </div>
          <div className="property-detail-gallery-grid">
            {galleryImages.slice(1, 5).map((image, index) => (
              <div key={image} className="property-detail-gallery-item" onClick={() => { setGalleryTab('fotos'); setGalleryActiveIndex(index + 1); setIsGalleryOpen(true); }} style={{ cursor: 'pointer' }}>
                <img src={image} alt={`Vista ${index + 2}`} className="property-detail-gallery-image" />
                {index === 3 && (
                  <div className="property-detail-gallery-overlay">
                    <span onClick={(e) => e.stopPropagation()}>
                      <Button label="Ver todas las fotos" variant="secondary" icon={<img src="/icons/verGaleria.svg" alt="" />} onClick={() => { setGalleryTab('fotos'); setGalleryActiveIndex(0); setIsGalleryOpen(true); }} />
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
                <span>{property?.street ?? 'Dirección no especificada'}</span>
              </div>
              <div className="property-detail-map-image">
                <PropertyMap address={property?.street ?? ''} />
              </div>
            </section>

            {Object.values(dynamicAmenities).some(arr => arr.length > 0) && (
            <section className="property-detail-amenities">
              <h2>Conoce mas sobre esta propiedad</h2>
              <div className="property-detail-amenities-tabs">
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
            {renderContactForm()}

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
                {Array.from({ length: section.count }).map((_, cardIndex) => (
                  <PropertyCard 
                    key={`${section.title}-${cardIndex}`} 
                    property={{
                      id: `similar-${section.title}-${cardIndex}`,
                      price: 180000,
                      rent: 0,
                      currency: 'USD',
                      currencyRent: 'USD',
                      pricePerSqm: 2000,
                      title: 'Propiedad similar',
                      address: 'Calle Principal 1234',
                      rooms: 3,
                      bathrooms: 2,
                      area: 90,
                      image: '/images/property-placeholder.png',
                      isFavorite: false,
                    }}
                  />
                ))}
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

      {isGalleryOpen && (
        <div className="property-gallery-lightbox" role="dialog" aria-modal="true" aria-label="Galería de fotos">
          <div className="property-gallery-lightbox-backdrop" onClick={() => setIsGalleryOpen(false)} />

          <button type="button" className="property-gallery-lightbox-close" aria-label="Cerrar galería" onClick={() => setIsGalleryOpen(false)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>

          {/* Tabs */}
          <div className="property-gallery-lightbox-tabs">
            <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'fotos' ? 'is-active' : ''}`} onClick={() => { setGalleryTab('fotos'); setGalleryActiveIndex(0); }}>Fotos</button>
            {galleryVideos.length > 0 && (
              <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'videos' ? 'is-active' : ''}`} onClick={() => { setGalleryTab('videos'); setVideoActiveIndex(0); }}>Videos</button>
            )}
            {galleryPlans.length > 0 && (
              <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === 'planos' ? 'is-active' : ''}`} onClick={() => { setGalleryTab('planos'); setPlanActiveIndex(0); }}>Planos</button>
            )}
            <button type="button" className={`property-gallery-lightbox-tab ${galleryTab === '360' ? 'is-active' : ''}`} onClick={() => setGalleryTab('360')}>360</button>
          </div>

          {/* ── FOTOS ── */}
          {galleryTab === 'fotos' && (
            <>
              <div className="property-gallery-lightbox-main">
                <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-prev" aria-label="Anterior" onClick={() => setGalleryActiveIndex(prev => Math.max(prev - 1, 0))} disabled={galleryActiveIndex === 0}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                </button>
                <img src={galleryImages[galleryActiveIndex]} alt={`Foto ${galleryActiveIndex + 1}`} className="property-gallery-lightbox-image" />
                <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-next" aria-label="Siguiente" onClick={() => setGalleryActiveIndex(prev => Math.min(prev + 1, galleryImages.length - 1))} disabled={galleryActiveIndex === galleryImages.length - 1}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                </button>
              </div>
              <div className="property-gallery-lightbox-counter">{galleryActiveIndex + 1} / {galleryImages.length}</div>
              <div className="property-gallery-lightbox-thumbs" ref={galleryThumbsRef}>
                {galleryImages.map((img, idx) => (
                  <button key={img} type="button" className={`property-gallery-lightbox-thumb ${idx === galleryActiveIndex ? 'is-active' : ''}`} onClick={() => setGalleryActiveIndex(idx)} aria-label={`Ver foto ${idx + 1}`}>
                    <img src={img} alt={`Miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── VIDEOS ── */}
          {galleryTab === 'videos' && (() => {
            const vid = galleryVideos[videoActiveIndex];
            const videoId = vid ? extractYouTubeId(vid.url) : null;
            return (
              <>
                <div className="property-gallery-lightbox-main">
                  <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-prev" aria-label="Anterior" onClick={() => setVideoActiveIndex(prev => Math.max(prev - 1, 0))} disabled={videoActiveIndex === 0}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                  </button>
                  {videoId ? (
                    <iframe
                      key={videoId}
                      src={getYouTubeEmbed(videoId)}
                      className="property-gallery-lightbox-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Video ${videoActiveIndex + 1}`}
                    />
                  ) : (
                    <div className="property-gallery-lightbox-placeholder">Video no disponible</div>
                  )}
                  <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-next" aria-label="Siguiente" onClick={() => setVideoActiveIndex(prev => Math.min(prev + 1, galleryVideos.length - 1))} disabled={videoActiveIndex === galleryVideos.length - 1}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                  </button>
                </div>
                <div className="property-gallery-lightbox-counter">{videoActiveIndex + 1} / {galleryVideos.length}</div>
                <div className="property-gallery-lightbox-thumbs">
                  {galleryVideos.map((v, idx) => {
                    const vId = extractYouTubeId(v.url);
                    return (
                      <button key={v.id} type="button" className={`property-gallery-lightbox-thumb ${idx === videoActiveIndex ? 'is-active' : ''}`} onClick={() => setVideoActiveIndex(idx)} aria-label={`Ver video ${idx + 1}`}>
                        {vId ? <img src={getYouTubeThumbnail(vId)} alt={`Video ${idx + 1}`} /> : <div className="property-gallery-lightbox-thumb-placeholder">▶</div>}
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}

          {/* ── PLANOS ── */}
          {galleryTab === 'planos' && (() => {
            const plan = galleryPlans[planActiveIndex];
            const isPdf = plan?.file_url?.toLowerCase().endsWith('.pdf');
            return (
              <>
                <div className="property-gallery-lightbox-main">
                  <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-prev" aria-label="Anterior" onClick={() => setPlanActiveIndex(prev => Math.max(prev - 1, 0))} disabled={planActiveIndex === 0}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                  </button>
                  {isPdf ? (
                    <div className="property-gallery-lightbox-pdf">
                      <span>PDF</span>
                      <small>{plan.file_url.split('/').pop()}</small>
                      <a href={`${AWS_S3_BUCKET_URL}/${plan.file_url}`} target="_blank" rel="noopener noreferrer">Abrir PDF</a>
                    </div>
                  ) : (
                    <img src={`${AWS_S3_BUCKET_URL}/${plan?.file_url}`} alt={`Plano ${planActiveIndex + 1}`} className="property-gallery-lightbox-image" />
                  )}
                  <button type="button" className="property-gallery-lightbox-nav property-gallery-lightbox-nav-next" aria-label="Siguiente" onClick={() => setPlanActiveIndex(prev => Math.min(prev + 1, galleryPlans.length - 1))} disabled={planActiveIndex === galleryPlans.length - 1}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                  </button>
                </div>
                <div className="property-gallery-lightbox-counter">{planActiveIndex + 1} / {galleryPlans.length}</div>
                <div className="property-gallery-lightbox-thumbs">
                  {galleryPlans.map((p, idx) => {
                    const isPdfThumb = p.file_url?.toLowerCase().endsWith('.pdf');
                    return (
                      <button key={p.id} type="button" className={`property-gallery-lightbox-thumb ${idx === planActiveIndex ? 'is-active' : ''}`} onClick={() => setPlanActiveIndex(idx)} aria-label={`Ver plano ${idx + 1}`}>
                        {isPdfThumb ? <div className="property-gallery-lightbox-thumb-placeholder">PDF</div> : <img src={`${AWS_S3_BUCKET_URL}/${p.file_url}`} alt={`Plano ${idx + 1}`} />}
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}

          {/* ── 360 ── */}
          {galleryTab === '360' && (
            <div className="property-gallery-lightbox-empty">
              <p>Contenido 360° próximamente</p>
            </div>
          )}
        </div>
      )}

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
              className="property-detail-contact-modal-close"
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
            {renderContactForm({ isModal: true })}
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
