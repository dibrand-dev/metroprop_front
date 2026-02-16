'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import './Header.scss';
import TopUserMenu from '@/layout/TopUserMenu/TopUserMenu';

const logoMetroprop = "/images/metropropLogo.png";
const chevronIcon = "/icons/chevron-up.svg";

interface DropdownSubItem {
  label: string;
  href: string;
}

interface DropdownColumn {
  title: string;
  items: DropdownSubItem[];
}

interface DropdownSection {
  [key: string]: DropdownColumn[];
}

const dropdownItems: DropdownSection = {
  comprar: [
    {
      title: 'Ubicación',
      items: [
        { label: 'Capital Federal', href: '#' },
        { label: 'GBA Norte', href: '#' },
        { label: 'GBA Sur', href: '#' },
        { label: 'Santa Fe', href: '#' },
        { label: 'GBA Oeste', href: '#' },
        { label: 'Buenos Aires Costa Atlántica', href: '#' },
        { label: 'Córdoba', href: '#' },
        { label: 'Buenos Aires (fuera de GBA)', href: '#' },
        { label: 'Mendoza', href: '#' },
        { label: 'Neuquén', href: '#' },
        { label: 'Río Negro', href: '#' },
      ],
    },
    {
      title: 'Tipo de propiedad',
      items: [
        { label: 'Departamento', href: '#' },
        { label: 'Casa', href: '#' },
        { label: 'Terreno', href: '#' },
        { label: 'PH', href: '#' },
        { label: 'Local Comercial', href: '#' },
      ],
    },
    {
      title: 'Otros',
      items: [
        { label: 'Emprendimientos', href: '#' },
      ],
    },
  ],
  alquilar: [
    {
      title: 'Ubicación',
      items: [
        { label: 'Capital Federal', href: '#' },
        { label: 'GBA Norte', href: '#' },
        { label: 'GBA Sur', href: '#' },
        { label: 'GBA Oeste', href: '#' },
      ],
    },
    {
      title: 'Tipo de propiedad',
      items: [
        { label: 'Departamento', href: '#' },
        { label: 'Casa', href: '#' },
        { label: 'Oficina', href: '#' },
        { label: 'Local', href: '#' },
      ],
    },
  ],
  temporal: [
    {
      title: 'Duración',
      items: [
        { label: 'Por días', href: '#' },
        { label: 'Temporada completa', href: '#' },
        { label: 'Fin de semana', href: '#' },
      ],
    },
    {
      title: 'Ubicación',
      items: [
        { label: 'Capital Federal', href: '#' },
        { label: 'GBA', href: '#' },
      ],
    },
  ],
};

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ [key: string]: string }>({
    comprar: 'GBA Norte',
    alquilar: 'Capital Federal',
    temporal: 'Por días',
  });

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

  const toggleSubCategory = (categoryKey: string) => {
    setExpandedSubCategory(expandedSubCategory === categoryKey ? null : categoryKey);
  };

  const handleItemClick = (dropdownKey: string, itemLabel: string) => {
    setSelectedItem(prev => ({ ...prev, [dropdownKey]: itemLabel }));
  };

  return (
    <header className="header-container">
      <div className="header-content">
        {/* Left Section - Navigation Dropdowns / Hamburger Menu */}
        <div className="header-nav-wrapper">
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
                    <img src={chevronIcon} alt="" className="header-chevron" />
                  </span>
                </button>
                
                {/* Desktop Multi-Column Dropdown */}
                {openDropdown === key && (
                  <div className="header-dropdown-menu header-dropdown-menu-grid header-desktop-dropdown">
                    {columns.map((column, colIndex) => (
                      <div key={colIndex} className="header-dropdown-column">
                        <div className="header-dropdown-column-title">
                          {column.title}
                        </div>
                        <div className="header-dropdown-column-items">
                          {column.items.map((item, itemIndex) => (
                            <a
                              key={itemIndex}
                              href={item.href}
                              className={`header-dropdown-item ${selectedItem[key] === item.label ? 'active' : ''}`}
                              onClick={(e) => {
                                handleItemClick(key, item.label);
                              }}
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      </div>
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
                          <button
                            className={`accordion-subcategory-toggle ${isSubCategoryOpen ? 'active' : ''}`}
                            onClick={() => toggleSubCategory(subcategoryKey)}
                          >
                            <span className="subcategory-label">{column.title}</span>
                            <span className='header-dropdown-icon'>
                              <img src={chevronIcon} alt="" className="chevron" />
                            </span>
                          </button>
                          {isSubCategoryOpen && (
                            <div className="accordion-items">
                              {column.items.map((item, itemIndex) => (
                                <a
                                  key={itemIndex}
                                  href={item.href}
                                  className={`accordion-item ${selectedItem[key] === item.label ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleItemClick(key, item.label);
                                  }}
                                >
                                  {item.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center Section - Logo */}
        <div className="header-logo">
          <a href="/"><img src={logoMetroprop} alt="MetroProp" /></a>
        </div>

        {/* Right Section - Login Button or User Menu */}
        <div className="header-actions">
          <TopUserMenu />
        </div>
      </div>
    </header>
  );
}
