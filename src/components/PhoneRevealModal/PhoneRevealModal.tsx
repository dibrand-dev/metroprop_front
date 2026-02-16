'use client';

import { useEffect, useState } from 'react';
import './PhoneRevealModal.scss';
import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';

interface PhoneRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const closeIcon = '/icons/close.svg';
const flagIcon = '/icons/flag.svg';
const chevronIcon = '/icons/chevron-up.svg';

export default function PhoneRevealModal({ isOpen, onClose }: PhoneRevealModalProps) {
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    countryCode: '+54',
    country: 'Argentina',
    phone: '',
    termsAccepted: false,
    privacyAccepted: false,
  });

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

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountrySelect = (value: string) => {
    const parts = value.trim().split(' ');
    const dialCode = parts.shift() || '';
    const name = parts.join(' ').trim();
    setFormState((prev) => ({
      ...prev,
      countryCode: dialCode || prev.countryCode,
      country: name || prev.country,
    }));
  };

  return (
    <div className="phone-reveal-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="phone-reveal-modal" onClick={(event) => event.stopPropagation()}>
        <CountryCodeModal
          isOpen={isCountryModalOpen}
          selectedValue={`${formState.countryCode} ${formState.country}`}
          onClose={() => setIsCountryModalOpen(false)}
          onSelect={handleCountrySelect}
        />
        <div className="phone-reveal-modal-header">
          <h3>Ver telefono</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="phone-reveal-modal-body">
          <h4>
            Completa tus datos y podras ver el
            <br />
            telefono del anunciante.
          </h4>

          <div className="phone-reveal-form">
            <div className="phone-reveal-row">
              <label className="phone-reveal-field">
                <span>Nombre</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Nombre"
                />
              </label>
              <label className="phone-reveal-field wide">
                <span>Email</span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  placeholder="unemail@dibrand.com"
                />
              </label>
            </div>

            <div className="phone-reveal-row">
              <div className="phone-reveal-field">
                <span>Pais</span>
                <button
                  type="button"
                  className="phone-reveal-country"
                  onClick={() => setIsCountryModalOpen(true)}
                >
                  <span className="phone-reveal-flag" aria-hidden="true">
                    <img src={flagIcon} alt="" />
                  </span>
                  <span>{formState.countryCode}</span>
                  <img src={chevronIcon} alt="" className="phone-reveal-chevron" />
                </button>
              </div>
              <label className="phone-reveal-field wide">
                <span>Telefono</span>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  placeholder="1526458466"
                />
              </label>
            </div>
          </div>

          <div className="phone-reveal-terms">
            <label className="phone-reveal-checkbox">
              <input
                type="checkbox"
                checked={formState.termsAccepted}
                onChange={(event) => handleChange('termsAccepted', event.target.checked)}
              />
              <span>Acepto los Terminos y condiciones de Uso</span>
            </label>
            <label className="phone-reveal-checkbox">
              <input
                type="checkbox"
                checked={formState.privacyAccepted}
                onChange={(event) => handleChange('privacyAccepted', event.target.checked)}
              />
              <span>Acepto la Politica de Privacidad</span>
            </label>
          </div>

          <button type="button" className="phone-reveal-submit">
            Ver telefono
          </button>
        </div>
      </div>
    </div>
  );
}
