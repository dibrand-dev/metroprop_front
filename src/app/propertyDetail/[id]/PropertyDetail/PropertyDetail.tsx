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

interface PropertyDetailProps {
  propertyId: string;
}

const propertyDetailData = {
  status: 'En venta',
  price: 'USD 320.000',
  title: 'Departamento - 167 m2 - 5 amb. - 1 cochera',
  galleryStartIndex: 1,
  galleryImages: [
    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=400&fit=crop&sat=-50',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&h=400&fit=crop',
  ],
  summaryTitle: 'Alquiler inmediato Cerviño 5 ambientes, Palermo.',
  summaryDescription:
    'Se vende departamento 2 Ambientes con BALCON al frente en Recoleta.\nRECICLADO EN SU TOTALIDAD. PISO 7º AL FRENTE.\n\nEste departamento cuenta con una superficie total de 41 m2.',
  featureItems: [
    { label: 'A estrenar', icon: '/icons/calendar.svg' },
    { label: 'Contrafrente', icon: '/icons/contrafrente.svg' },
    { label: 'N', icon: '/icons/orientacion.svg' },
    { label: '177 m2 tot.', icon: '/icons/regla.svg' },
    { label: '167 m2 cub', icon: '/icons/mcubiertos.svg' },
    { label: '5 amb.', icon: '/icons/door.svg' },
    { label: '1 cochera', icon: '/icons/cochera.svg' },
    { label: '4 dorm.', icon: '/icons/cama.svg' },
    { label: '3 baños', icon: '/icons/bano.svg' },
  ],
  questionChips: [
    'Se puede visitar hoy',
    'Aceptan permuta',
    'El edificio tiene amenities',
    'Tiene baulera',
  ],
  amenitiesByTab: {
    caracteristicas: ['Ascensor', 'Balcon', 'Lavadero', 'Vestidor', 'Parrilla', 'Piso de madera'],
    servicios: ['Agua corriente', 'Gas natural', 'Electricidad', 'Internet'],
    descripcion: [
      'Departamento luminoso con vista abierta.',
      'Cocina integrada, living comedor amplio.',
      'Dormitorio principal en suite con vestidor.',
    ],
  },
  address: 'Avenida Cevino 4046, Palermo Chico, Palermo',
  mapImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=600&fit=crop',
  issues: ['Publicacion incorrecta', 'No responde', 'Ya fue vendida'],
  agent: {
    logoText: 'MP',
    name: 'Metroprop Premium',
    type: 'Inmobiliaria',
    stats: ['Propiedades publicadas: 128', 'Respuesta promedio: 2 horas'],
  },
  similarSections: [
    { title: 'Propiedades similares', count: 5 },
    { title: 'Propiedades similares por m2', count: 5 },
  ],
  labels: {
    infoAria: 'Mas informacion',
    galleryAltPrimary: 'Vista principal',
    galleryAltPrefix: 'Vista',
    galleryViewAll: 'Ver todas',
    featuresMore: 'Ver mas',
    featuresLess: 'Ver menos',
    amenitiesTitle: 'Conoce mas sobre esta propiedad',
    amenityTabs: [
      { key: 'caracteristicas', label: 'Caracteristicas' },
      { key: 'servicios', label: 'Servicios' },
      { key: 'descripcion', label: 'Descripcion' },
    ] as const,
    issuesTitle: 'Tengo un problema con...',
    contactTitle: 'Contacta al anunciante',
    contactQuestionsTitle: 'Preguntas para el anunciante',
    contactQuestionsDescription: 'Selecciona una o mas preguntas, o escribi tu consulta.',
    form: {
      name: 'Nombre',
      country: 'País',
      phone: 'Telefono',
      email: 'Email',
      message: 'Consulta',
    },
    terms: {
      conditions: 'Acepto terminos y condiciones',
      privacy: 'Acepto politica de privacidad',
    },
    actions: {
      send: 'Enviar',
      contact: 'Contactar',
    },
    contactActions: [
      {
        id: 'whatsapp',
        label: 'Whatsapp',
        icon: '/icons/whatsapp.svg',
        variant: 'whatsapp',
      },
      {
        id: 'contact',
        label: 'Contactar',
        icon: '/icons/envelope.svg',
        variant: 'primary',
      },
    ],
    galleryActions: {
      favorite: 'Favorito',
      share: 'Compartir',
    },
    summaryToggle: {
      more: 'Leer descripcion completa',
      less: 'Leer descripcion completa',
    },
  },
};

export default function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const [activeTab, setActiveTab] = useState<'caracteristicas' | 'servicios' | 'descripcion'>('caracteristicas');
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

  const amenities = useMemo(() => propertyDetailData.amenitiesByTab[activeTab], [activeTab]);
  const showFeaturesToggle = propertyDetailData.featureItems.length > 6;
  const showSummaryToggle = propertyDetailData.summaryDescription.length > 140;
  const amenitiesText = useMemo(() => {
    return amenities.join('\n');
  }, [activeTab, amenities]);

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
    const sectionCount = propertyDetailData.similarSections.length;
    setSimilarCanScrollLeft((prev) => {
      if (prev.length === sectionCount) return prev;
      return Array.from({ length: sectionCount }, () => false);
    });
    setSimilarCanScrollRight((prev) => {
      if (prev.length === sectionCount) return prev;
      return Array.from({ length: sectionCount }, () => true);
    });

    propertyDetailData.similarSections.forEach((_, index) => {
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
    setFormState((prev) => ({ ...prev, country: value }));
  };

  const primaryContactAction = propertyDetailData.labels.contactActions.find((action) => action.id === 'contact');

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
    const contactActions = isModal && primaryContactAction ? [primaryContactAction] : propertyDetailData.labels.contactActions;

    return (
      <form
        className={`property-detail-contact ${isModal ? 'property-detail-contact-modal-form' : ''}`}
        onSubmit={(event) => event.preventDefault()}
      >
        {!isModal && (
          <div className="property-detail-contact-header">
            <h2>{propertyDetailData.labels.contactTitle}</h2>
          </div>
        )}

        <div className="property-detail-contact-block">
          <h3>{propertyDetailData.labels.contactQuestionsTitle}</h3>
          <p>{propertyDetailData.labels.contactQuestionsDescription}</p>
          <div className="property-detail-question-grid">
            {propertyDetailData.questionChips.map((question) => (
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
              label={propertyDetailData.labels.form.name}
              value={formState.name}
              onChange={(event) => setFormState({ ...formState, name: event.target.value })}
            />
            <InputField2
              label={propertyDetailData.labels.form.email}
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
            />
          </div>
          <div className="property-detail-input-row">
            <InputField2
              label={propertyDetailData.labels.form.country}
              value={formState.country}
              onFocus={() => setIsCountryModalOpen(true)}
              onChange={(event) => setFormState({ ...formState, country: event.target.value })}
            />
            <InputField2
              label={propertyDetailData.labels.form.phone}
              value={formState.phone}
              onChange={(event) => setFormState({ ...formState, phone: event.target.value })}
            />
          </div>
          <div className="property-detail-input-row single">
            <InputField2
              label={propertyDetailData.labels.form.message}
              value={formState.message}
              onChange={(event) => setFormState({ ...formState, message: event.target.value })}
            />
          </div>
        </div>

        <div className="property-detail-contact-terms">
          <Checkbox
            label={propertyDetailData.labels.terms.conditions}
            checked={termsAccepted}
            onChange={setTermsAccepted}
          />
          <Checkbox
            label={propertyDetailData.labels.terms.privacy}
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
            <p className="property-detail-status"><span className='status-icon'></span>{propertyDetailData.status}</p>
            <div className="property-detail-price">
              <span>{propertyDetailData.price}</span>
              <button
                type="button"
                className="property-detail-info"
                aria-label={propertyDetailData.labels.infoAria}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M11 11h2v6h-2z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
          <h1 className="property-detail-title">{propertyDetailData.title}</h1>
        </section>

        <section className="property-detail-gallery">
          <div className="property-detail-gallery-main">
            <img
              src={propertyDetailData.galleryImages[0]}
              alt={propertyDetailData.labels.galleryAltPrimary}
            />
            <div className="property-detail-gallery-main-overlay">
              <div className="property-detail-gallery-actions">
                <button type="button" aria-label={propertyDetailData.labels.galleryActions.favorite}>
                  <img src="/icons/heart.svg" alt="" />
                </button>
                <button type="button" aria-label={propertyDetailData.labels.galleryActions.share}>
                  <img src="/icons/message.svg" alt="" />
                </button>
              </div>
              <div className="property-detail-gallery-counter">
                {propertyDetailData.galleryStartIndex} / {propertyDetailData.galleryImages.length}
              </div>
            </div>
          </div>
          <div className="property-detail-gallery-grid">
            {propertyDetailData.galleryImages.slice(1, 5).map((image, index) => (
              <div key={image} className="property-detail-gallery-item">
                <img src={image} alt={`${propertyDetailData.labels.galleryAltPrefix} ${index + 2}`} />
                {index === 3 && (
                  <div className="property-detail-gallery-overlay">
                    <button type="button">{propertyDetailData.labels.galleryViewAll}</button>
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
            {propertyDetailData.featureItems.map((item) => (
              <div key={item.label} className="property-detail-feature">
                <div className="property-detail-feature-value">
                  <img src={item.icon} alt={item.label} />
                </div>
                <div className="property-detail-feature-label">{item.label}</div>
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
              {featuresExpanded ? propertyDetailData.labels.featuresLess : propertyDetailData.labels.featuresMore}
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
              <h2>{propertyDetailData.summaryTitle}</h2>
              <div className="property-detail-summary-grid">
                <p className={summaryExpanded ? 'summary-expanded' : 'summary-collapsed'}>
                  {propertyDetailData.summaryDescription}
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
                    ? propertyDetailData.labels.summaryToggle.less
                    : propertyDetailData.labels.summaryToggle.more}
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
                <span>{propertyDetailData.address}</span>
              </div>
              <div className="property-detail-map-image">
                <img
                  src={"/images/mapa_google.png"}
                  alt="Mapa de ubicacion"
                />
                <div className="property-detail-map-pin" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 2c-4.4 0-8 3.6-8 8 0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </section>

            <section className="property-detail-amenities">
              <h2>{propertyDetailData.labels.amenitiesTitle}</h2>
              <div className="property-detail-amenities-tabs">
                {propertyDetailData.labels.amenityTabs.map((tab) => (
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
                <p>{amenitiesText}</p>
              </div>
            </section>

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
                <div className="property-detail-agent-logo">{propertyDetailData.agent.logoText}</div>
                <div>
                  <h4>{propertyDetailData.agent.name}</h4>
                  <span>{propertyDetailData.agent.type}</span>
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

        {propertyDetailData.similarSections.map((section, index) => (
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
                      currency: 'USD',
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

      <div
        className={`property-detail-contact-modal ${isContactModalOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={propertyDetailData.labels.contactTitle}
      >
        <div
          className="property-detail-contact-modal-backdrop"
          onClick={() => setIsContactModalOpen(false)}
        />
        <div className="property-detail-contact-modal-panel">
          <div className="property-detail-contact-modal-header">
            <h2>{propertyDetailData.labels.contactTitle}</h2>
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
        {propertyDetailData.labels.contactActions.map((action) => (
          <button
            key={`mobile-${action.id}`}
            type="button"
            className={`property-detail-mobile-action property-detail-mobile-action-${action.variant}`}
            onClick={() => {
              if (action.id === 'whatsapp') {
                setIsWhatsappModalOpen(true);
                return;
              }
              setIsContactModalOpen(true);
            }}
          >
            <img src={action.icon} alt="" aria-hidden="true" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <Footer />
    </div>
  );
}
