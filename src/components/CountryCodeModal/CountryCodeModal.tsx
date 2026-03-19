'use client';

import { useMemo, useEffect, useState } from 'react';
import './CountryCodeModal.scss';

interface CountryCode {
  id: string;
  name: string;
  dialCode: string;
}

interface CountryCodeModalProps {
  isOpen: boolean;
  selectedValue?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const searchIcon = 'https://www.figma.com/api/mcp/asset/44bd6976-7c62-491b-b989-b2f8b24541b2';
const closeIcon = 'https://www.figma.com/api/mcp/asset/1bbd4dd8-0172-4daf-8849-128bf8c67e17';

const countries: CountryCode[] = [
  { id: 'ar', name: 'Argentina', dialCode: '+54' },
  { id: 'bo', name: 'Bolivia', dialCode: '+591' },
  { id: 'br', name: 'Brasil', dialCode: '+55' },
  { id: 'cl', name: 'Chile', dialCode: '+56' },
  { id: 'py', name: 'Paraguay', dialCode: '+595' },
  { id: 'uy', name: 'Uruguay', dialCode: '+598' },
  { id: 'af', name: 'Afganistan', dialCode: '+93' },
  { id: 'co', name: 'Colombia', dialCode: '+57' },
  { id: 'es', name: 'Espana', dialCode: '+34' },
  { id: 'mx', name: 'Mexico', dialCode: '+52' },
];

export default function CountryCodeModal({
  isOpen,
  selectedValue,
  onClose,
  onSelect,
}: CountryCodeModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return countries;
    return countries.filter((country) => {
      const label = `${country.dialCode} ${country.name}`.toLowerCase();
      return label.includes(normalized);
    });
  }, [query]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (country: CountryCode) => {
    onSelect(`${country.dialCode}`);
    onClose();
  };

  return (
    <div
      className="country-code-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="country-code-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="country-code-modal-header">
          <h3>Código de pais</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="country-code-modal-search">
          <input
            type="text"
            placeholder="Ingresa pais o codigo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="country-code-modal-search-icon">
            <img src={searchIcon} alt="" />
          </span>
        </div>

        <div className="country-code-modal-list">
          {filteredCountries.map((country) => {
            const value = `${country.dialCode} ${country.name}`;
            const isSelected = value === selectedValue;
            return (
              <button
                key={country.id}
                type="button"
                className={`country-code-modal-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(country)}
              >
                <span>{value}</span>
                <span className="country-code-modal-flag" aria-hidden="true">
                  <img src="/icons/flag.svg" alt="" />
                </span>
              </button>
            );
          })}
          {filteredCountries.length === 0 && (
            <div className="country-code-modal-empty">Sin resultados</div>
          )}
        </div>
      </div>
    </div>
  );
}
