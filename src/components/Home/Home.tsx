'use client';
import './Home.scss';
import { useState, useRef, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import Button from '@/ui/Button/Button';
import { useRouter } from 'next/navigation';
import LocationAutocompleteInput from '@/components/LocationAutocompleteInput/LocationAutocompleteInput';
import { getVisitedProperties, type VisitedProperty } from '@/utils/utils';

export default function Home() {
  const services = [
    {
      title: 'Comprá la propiedad que estás buscando.',
      desc: 'Accedé a oportunidades reales con datos claros y actualizados.',
      icon: '/images/home_comprar.svg',
      boton: 'Comprar'
    },
    {
      title: 'Encontrá el espacio ideal para alquilar.',
      desc: 'Filtrá, compará y encontrá tu próximo alquiler sin complicaciones.',
      icon: '/images/home_alquilar.svg',
      boton: 'Alquilar'
    },
    {
      title: 'Viví donde quieras, por el tiempo que necesites',
      desc: 'Espacios equipados y listos para acompañar tu viaje, trabajo o descanso.',
      icon: '/images/home_temporal.svg',
      boton: 'Temporal'
    },
    {
      title: 'Invertí en proyectos en desarrollo.',
      desc: 'Invertí con previsibilidad y descubrí oportunidades de crecimiento a largo plazo.',
      icon: '/images/home_emprendimientos.svg',
      boton: 'Emprendimientos'
    }
  ];

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState<'1' | '2' | '3' | '4'>('1');
  const [visitedProperties, setVisitedProperties] = useState<VisitedProperty[]>([]);
  const visitedPropertiesRef = useRef<HTMLDivElement>(null);
  const featuredPropertiesRef = useRef<HTMLDivElement>(null);
  
  const [visitedCanScrollLeft, setVisitedCanScrollLeft] = useState(false);
  const [visitedCanScrollRight, setVisitedCanScrollRight] = useState(true);
  const [featuredCanScrollLeft, setFeaturedCanScrollLeft] = useState(false);
  const [featuredCanScrollRight, setFeaturedCanScrollRight] = useState(true);

  const updateScrollState = (
    ref: React.RefObject<HTMLDivElement>,
    setCanLeft: (val: boolean) => void,
    setCanRight: (val: boolean) => void
  ) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, offsetWidth } = ref.current;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + offsetWidth < scrollWidth);
  };

  useEffect(() => {
    // Check initial state
    updateScrollState(visitedPropertiesRef, setVisitedCanScrollLeft, setVisitedCanScrollRight);
    updateScrollState(featuredPropertiesRef, setFeaturedCanScrollLeft, setFeaturedCanScrollRight);
    // Load visited properties from localStorage
    setVisitedProperties(getVisitedProperties());
  }, []);

  const handleVisitedScroll = () => {
    updateScrollState(visitedPropertiesRef, setVisitedCanScrollLeft, setVisitedCanScrollRight);
  };

  const handleFeaturedScroll = () => {
    updateScrollState(featuredPropertiesRef, setFeaturedCanScrollLeft, setFeaturedCanScrollRight);
  };

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const scrollAmount = 300;
    const targetScroll = ref.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    ref.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });

    // Update scroll state after animation completes
    setTimeout(() => {
      if (ref.current === visitedPropertiesRef.current) {
        updateScrollState(visitedPropertiesRef, setVisitedCanScrollLeft, setVisitedCanScrollRight);
      } else {
        updateScrollState(featuredPropertiesRef, setFeaturedCanScrollLeft, setFeaturedCanScrollRight);
      }
    }, 300);
  };
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <div className="bg-white w-full overflow-x-hidden">
        {/* Hero Section */}
        <div className="hero-section hero-background bg-cover bg-center">
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 md:px-6 py-8 md:py-0">
            
            <div>
              <h1 className="hero-title font-extrabold drop-shadow-lg">
                <span className="h1-first">Encontrá</span> tu espacio ideal.
              </h1>
              {/* Search and Filters Card */}
              <div className="search-card bg-white rounded-lg p-4 shadow-lg w-full">
                {/* Filter Tabs */}
                <div className="filter-tabs flex gap-1 md:gap-4 mb-4">
                  <button className={`filter-button px-3 md:px-4 py-1.5 md:py-2 rounded  font-semibold text-[#1e1e1e] hover:bg-gray-50 ${searchActive === "1" ? "active" : ""}`} onClick={() => setSearchActive("1")}>
                    Comprar
                  </button>
                  <button className={`filter-button px-3 md:px-4 py-1.5 md:py-2 rounded font-semibold text-[#1e1e1e] hover:bg-gray-50 ${searchActive === "2" ? "active" : ""}`} onClick={() => setSearchActive("2")}>
                    Alquilar
                  </button>
                  <button className={`filter-button px-3 md:px-4 py-1.5 md:py-2 rounded  font-semibold text-[#1e1e1e] hover:bg-gray-50 ${searchActive === "4" ? "active" : ""}`} onClick={() => setSearchActive("4")}>
                    Emprendimientos
                  </button>
                </div>
                {/* Search Input */}
                <div className="search-input-wrapper">
                  <LocationAutocompleteInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Escribí una ubicación o alguna característica"
                    onSubmit={(value, locationId) => router.replace(`/results?${value ? `q=${encodeURIComponent(value)}&` : ''}${locationId != null ? `location_id=${locationId}&` : ''}page=1&limit=20`)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="homeSections">
          {/* Services Section */}
          <section className="services-section bg-white">
            <div className="services-grid">
              {services.map((service, idx) => (
                <div key={idx} className="service-card">
                  <div className="service-icon"><img src={service.icon} alt={service.title} /></div>
                  <h3 className="service-title font-extrabold text-[#1e1e1e] leading-[30px] md:leading-[30px] tracking-[-0.22px]">
                    {service.title}
                  </h3>
                  <p className="service-description text-[#1e1e1e] leading-[20px]">
                    {service.desc}
                  </p>
                  <Button
                    label={service.boton}
                    type="button"
                    variant="secondary"
                    buttonType="2"
                    state="default"                 
                    fullWidth={false}
                    size="medium"
                  />               
                </div>
              ))}
            </div>
          </section>

          {/* Properties Visited Section */}
          {visitedProperties.length > 0 && (
          <section className="properties-section bg-white">
            <h2 className="properties-title font-bold text-[#1e1e1e] tracking-[-0.24px] md:tracking-[-0.055px]">
              Propiedades visitadas
            </h2>
            <div className="properties-gallery-wrapper">
              {visitedCanScrollLeft && (
                <button 
                  onClick={() => scroll(visitedPropertiesRef, 'left')}
                  className="gallery-arrow gallery-arrow-left"
                  aria-label="Scroll left"
                >
                  <img src="/icons/chevron-up.svg" alt="Scroll left" width={24} />
                </button>
              )}
              <div className="properties-container" ref={visitedPropertiesRef} onScroll={handleVisitedScroll}>
                {visitedProperties.map((property) => (
                  <a href={`/propertyDetail/${property.id}`} key={property.id} style={{ textDecoration: 'none' }}>
                    <PropertyCard property={property} />
                  </a>
                ))}
              </div>
              {visitedCanScrollRight && (
                <button 
                  onClick={() => scroll(visitedPropertiesRef, 'right')}
                  className="gallery-arrow gallery-arrow-right"
                  aria-label="Scroll right"
                >
                  <img src="/icons/chevron-up.svg" alt="Scroll right"  width={24} />
                </button>
              )}
            </div>
          </section>
          )}

          {/* Properties Featured Section */}
          <section className="properties-section bg-white">
            <h2 className="properties-title font-bold text-[#1e1e1e] tracking-[-0.24px] md:tracking-[-0.055px]">
              Propiedades destacadas
            </h2>
            <div className="properties-gallery-wrapper">
              {featuredCanScrollLeft && (
                <button 
                  onClick={() => scroll(featuredPropertiesRef, 'left')}
                  className="gallery-arrow gallery-arrow-left"
                  aria-label="Scroll left"
                >
                  <img src="/icons/chevron-up.svg" alt="Scroll left" width={24} />
                </button>
              )}
            
              <div className="properties-container" ref={featuredPropertiesRef} onScroll={handleFeaturedScroll}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((property) => (
                  <PropertyCard 
                    key={property} 
                    property={{
                      id: `featured-${property}`,
                      rent: 2345,
                      price: 250000,
                      currency: 'USD',
                      currencyRent: '$',
                      pricePerSqm: 2500,
                      title: 'Propiedad destacada',
                      address: 'Av. Libertador 5000',
                      rooms: 3,
                      bathrooms: 2,
                      area: 100,
                      image: '/images/property-placeholder.png',
                      isFavorite: false,
                    }}
                  />
                ))}
              </div>
              {featuredCanScrollRight && (
                <button 
                  onClick={() => scroll(featuredPropertiesRef, 'right')}
                  className="gallery-arrow gallery-arrow-right"
                  aria-label="Scroll right"
                >
                  <img src="/icons/chevron-up.svg" alt="Scroll right"  width={24} />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </APIProvider>
  );
}
