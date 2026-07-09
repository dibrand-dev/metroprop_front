'use client';

import { useState, useEffect } from 'react';
import './Header.scss';
import { useSession } from 'next-auth/react';
import TopUserMenu from '@/layout/Header/TopUserMenu/TopUserMenu';
import LocationAutocompleteInput from '@/components/LocationAutocompleteInput/LocationAutocompleteInput';
import { useRouter, useSearchParams } from 'next/navigation';
import { TemporalRentPeriod } from '@/types/propiedad';
import Link from 'next/link';
import { chevronUp } from '@/utils/icons';

const logoMetroprop = "/images/metroprop.svg";

interface DropdownSubItem {
  label: string;
  href: string;
}

interface DropdownColumn {
  title?: string;
  items: DropdownSubItem[];
  sections?: { title: string; items: DropdownSubItem[] }[];
}

interface DropdownSection {
  [key: string]: DropdownColumn[];
}

const dropdownItems: DropdownSection = {
  comprar: [
    {
      title: 'Ubicación',
      items: [
        { label: 'Capital Federal', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=1&page=1&limit=20' },
        { label: 'GBA Norte', href: '/results?q=Argentina+%7C+G.B.A.+Zona+Norte&location_id=147&operation_type=1&page=1&limit=20' },
        { label: 'GBA Sur', href: '/results?q=Argentina+%7C+G.B.A.+Zona+Sur&location_id=149&operation_type=1&page=1&limit=20' },
        { label: 'GBA Oeste', href: '/results?q=Argentina+%7C+G.B.A.+Zona+Oeste&location_id=148&operation_type=1&page=1&limit=20' },
        { label: 'Santa Fe', href: '/results?q=Argentina+%7C+Santa+Fe&location_id=170&operation_type=1&page=1&limit=20' },        
        { label: 'Buenos Aires Costa Atlántica', href: '/results?q=Argentina+%7C+Costa+Atlantica&location_id=150&operation_type=1&page=1&limit=20' },
        { label: 'Córdoba', href: '/results?q=Argentina+%7C+Cordoba&location_id=155&operation_type=1&page=1&limit=20' },
        // { label: 'Buenos Aires (fuera de GBA)', href: '/results?q=Argentina+%7C+Buenos+Aires+(fuera+de+GBA)&location_id=156&operation_type=1&page=1&limit=20' },
        { label: 'Mendoza', href: '/results?q=Argentina+%7C+Mendoza&location_id=162&operation_type=1&page=1&limit=20' },
        { label: 'Neuquén', href: '/results?q=Argentina+%7C+Neuquen&location_id=164&operation_type=1&page=1&limit=20' },
        { label: 'Río Negro', href: '/results?q=Argentina+%7C+Río+Negro&location_id=165&operation_type=1&page=1&limit=20' },
      ],
    },
    {
      title: 'Tipo de propiedad',
      items: [
        { label: 'Departamento', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=2&page=1&limit=20' },
        { label: 'Casa', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=1&page=1&limit=20' },
        { label: 'Terreno', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=3&page=1&limit=20' },
        { label: 'PH', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=4&page=1&limit=20' },
        { label: 'Local Comercial', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=15&page=1&limit=20' },
      ],
      sections: [
        {
          title: 'Otros',
          items: [
            { label: 'Emprendimientos', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=18&page=1&limit=20' },
          ],
        },
      ],
    },
    {items: [
      { label: 'Emprendimientos', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=18&page=1&limit=20' },
    ]}
  ],
  alquilar: [
    {
      title: 'Ubicación',
      items: [
        { label: 'Capital Federal', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=2&page=1&limit=20' },
        { label: 'GBA Norte', href: '/results?q=Argentina+%7C+G.B.A.+Zona+Norte&location_id=147&operation_type=2&page=1&limit=20' },
        { label: 'GBA Sur', href: '/results?q=Argentina+%7C+G.B.A.+Zona+Sur&location_id=149&operation_type=2&page=1&limit=20' },
        { label: 'GBA Oeste', href: '/results?q=Argentina+%7C+G.B.A.+Zona+Oeste&location_id=148&operation_type=2&page=1&limit=20' },
      ],
    },
    {
      title: 'Tipo de propiedad',
      items: [
        { label: 'Departamento', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=2&page=1&limit=20' },
        { label: 'Casa', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=1&page=1&limit=20' },
        { label: 'Oficina', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=16&page=1&limit=20' },
        { label: 'Local Comercial', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&property_type=15&page=1&limit=20' },
      ],
    },
  ],
  temporal: [
    {
      title: 'Duración',
      items: [
        { label: 'Por días', href: `/results?period=${TemporalRentPeriod.POR_DIA}&q=Argentina+%7C+Capital+Federal&location_id=146&page=1&limit=20` },
        { label: 'Temporada completa', href: `/results?period=${TemporalRentPeriod.POR_TEMPORADA}&q=Argentina+%7C+Capital+Federal&location_id=146&page=1&limit=20` },
        { label: 'Fin de semana', href: `/results?period=${TemporalRentPeriod.POR_FIN_DE_SEMANA}&q=Argentina+%7C+Capital+Federal&location_id=146&page=1&limit=20` },
      ],
    },
    {
      title: 'Ubicación',
      items: [
        { label: 'Capital Federal', href: '/results?q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=3&page=1&limit=20' },
        { label: 'GBA', href: '/results?q=Argentina+%7C+G.B.A.&location_id=147&operation_type=3&page=1&limit=20' },
      ],
    },
  ],
};

export default function Header({ showFilter = false }: { showFilter?: boolean }) {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const isRole4 = (sessionData?.user as any)?.role_id === 4;
  const searchParams = useSearchParams();
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  useEffect(() => {
    if (showFilter) {
      setHeaderSearchQuery(searchParams.get('q') ?? '');
    }
  }, [showFilter, searchParams]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);
  const [selectedItem, setSelectedItem] = useState<{ [key: string]: string } | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
    setExpandedSubCategory(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setOpenDropdown(null);
    setExpandedSubCategory(null);
    closeMobileMenu();
  };

  const toggleSubCategory = (categoryKey: string) => {
    setExpandedSubCategory(expandedSubCategory === categoryKey ? null : categoryKey);
  };

  const handleItemClick = (dropdownKey: string, itemLabel: string) => {
    setSelectedItem(prev => ({ ...prev, [dropdownKey]: itemLabel }));
  };

  return (
    <header className={`header-container ${!sessionData ? 'user-comun' : ''} ${sessionData?.user?.organization === null || sessionData?.user?.organization === undefined ? 'user-comun' : ''}`}>
      {(openDropdown !== null || mobileMenuOpen) && (
        <button
          type="button"
          className="header-menu-overlay"
          aria-label="Cerrar menu"
          onMouseDown={(event) => {
            event.preventDefault();
            closeAllMenus();
          }}
        />
      )}
      <div className={`header-content ${showFilter ? 'with-search' : ''}`}>
        {!isRole4 ? sessionData?.user?.organization && <div className="topnavbar-menu-items">        
          <button className="topnavbar-dropdown">
            <Link prefetch={false}  href="/protected/myProperties">Mis publicaciones</Link>
          </button>
        </div> : <div className="header-placeholder" />}
        {/* Left Section - Navigation Dropdowns / Hamburger Menu */}
        <div className={`header-nav-wrapper ${showFilter ? 'with-search' : ''}`}>
          {/* Hamburger Button for Mobile */}
          <button 
            className={`header-hamburger-button ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label="Navigation menu"
          >
            <img src="/icons/hamburger.svg" alt="Menu" />
          </button>

          {/* Desktop Navigation */}
          <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className='mobile-header-open-nav'>
              <Link prefetch={false} href="/" className='home-link'><img src={logoMetroprop} alt="MetroProp" /></Link>
              <button
                className="close-button"
                onClick={toggleMobileMenu}
                aria-label="Cerrar"
              >
                <img src="/icons/close.svg" alt="" />
              </button>
            </div>
            {Object.entries(dropdownItems).map(([key, columns]) => (
              <div key={key} className="header-dropdown-wrapper">
                <button
                  className={`header-dropdown-toggle ${openDropdown === key ? 'active' : ''}`}
                  onClick={() => toggleDropdown(key)}
                  aria-expanded={openDropdown === key}
                >
                  <span className="header-dropdown-label">
                    {key === 'comprar' && 'Comprar'}
                    {key === 'alquilar' && 'Alquilar'}
                    {key === 'temporal' && 'Temporal'}
                  </span>
                  <span className='header-dropdown-icon'>
                    {chevronUp}
                  </span>
                </button>
                
                {/* Desktop Multi-Column Dropdown */}
                {openDropdown === key && (
                  <div className="header-dropdown-menu header-dropdown-menu-grid header-desktop-dropdown">
                    {columns.map((column, colIndex) => (
                      column.title && (
                        <div key={colIndex} className="header-dropdown-column">
                        <div className="header-dropdown-column-title">
                          {column.title}
                        </div>
                        <div className="header-dropdown-column-items">
                          {column.items.map((item, itemIndex) => (
                            <a
                              key={itemIndex}
                              href={item.href}
                              className={`header-dropdown-item ${selectedItem?.[key] === item.label ? 'active' : ''}`}
                              onClick={(e) => {
                                handleItemClick(key, item.label);
                              }}
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                        {column.sections?.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="header-dropdown-column-section">
                            <div className="header-dropdown-column-title">{section.title}</div>
                            <div className="header-dropdown-column-items">
                              {section.items.map((item, itemIndex) => (
                                <a
                                  key={itemIndex}
                                  href={item.href}
                                  className={`header-dropdown-item ${selectedItem?.[key] === item.label ? 'active' : ''}`}
                                  onClick={() => handleItemClick(key, item.label)}
                                >
                                  {item.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Mobile Nested Accordion */}
                {openDropdown === key && (
                  <div className="header-mobile-accordion">
                    {columns.map((column, colIndex) => {
                      const subcategoryKey = `${key}_${colIndex}`;
                      const isSubCategoryOpen = expandedSubCategory === subcategoryKey;
                      return (
                        <div key={colIndex} className="accordion-subcategory">
                          {column.title 
                          ? <>
                            <button
                              className={`accordion-subcategory-toggle ${isSubCategoryOpen ? 'active' : ''}`}
                              onClick={() => toggleSubCategory(subcategoryKey)}
                            >
                              <span className="subcategory-label">{column.title}</span>
                              <span className='header-dropdown-icon'>
                                {chevronUp}
                              </span>
                            </button>
                            {isSubCategoryOpen && (
                            <div className="accordion-items">
                              {column.items.map((item, itemIndex) => (
                                <a
                                  key={itemIndex}
                                  href={item.href}
                                  className={`accordion-item ${selectedItem?.[key] === item.label ? 'active' : ''}`}
                                  onClick={(e) => {
                                    handleItemClick(key, item.label);
                                  }}
                                >
                                  {item.label}
                                </a>
                              ))}
                            </div>)}</>
                          : column.items.map((item, itemIndex) => (
                            <a
                              key={itemIndex}
                              href={item.href}
                              className={`accordion-item no-title ${selectedItem?.[key] === item.label ? 'active' : ''}`}
                              onClick={(e) => {
                                handleItemClick(key, item.label);
                              }}
                            >
                              {item.label}
                            </a>))
                          }
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center Section - Logo / Filter */}
        {showFilter && (
          <div className="header-search">
            <LocationAutocompleteInput
              value={headerSearchQuery}
              onChange={setHeaderSearchQuery}
              placeholder="Dirección, barrio, calle"
              onSubmit={(value, locationId) => {
                const params = new URLSearchParams();
                if (value) params.set('q', value);
                if (locationId != null) params.set('location_id', String(locationId));
                params.set('page', '1');
                params.set('limit', '20');
                router.push(`/results?${params.toString()}`);
              }}
            />
          </div>
        )} 
        <div className={`${showFilter ? 'with-search' : ''} header-logo`}>
          <Link prefetch={false}  href="/">
            <img src={logoMetroprop} alt="MetroProp" className="metroLogoDesktop" />
          </Link>
        </div>
        <div className={`${showFilter ? 'with-search' : ''} header-logo-mobile`}>
          <Link prefetch={false}  href="/">            
            <img src="/images/metropropLogo_mobile.svg" alt="MetroProp" className="metroLogoDesktop" />
          </Link>
        </div>        

        {/* Right Section - Login Button or User Menu */}
        <div className={`${showFilter ? 'with-search' : ''} header-actions`}>
          <TopUserMenu />
        </div>
      </div>
    </header>
  );
}
