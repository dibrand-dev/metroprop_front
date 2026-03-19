'use client';

import { useEffect, useState } from 'react';
import './PhoneRevealModal.scss';
import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';

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
              <InputField2
                label="Nombre"
                type="text"
                placeholder="Nombre"
                value={formState.name}
                onChange={(event) => handleChange('name', event.target.value)}
              />
              <InputField2
                label="Email"
                type="email"
                placeholder="unemail@dibrand.com"
                value={formState.email}
                onChange={(event) => handleChange('email', event.target.value)}
              />
            </div>

            <div className="phone-reveal-row">
              <div className="phone-reveal-field">
                
                <button
                  type="button"
                  className="phone-reveal-country"
                  onClick={() => setIsCountryModalOpen(true)}
                >
                  <span>Pais</span>
                  <span className="phone-reveal-flag" aria-hidden="true">
                    <img src={flagIcon} alt="" />
                  </span>
                  <span>{formState.countryCode}</span>
                  <img src={chevronIcon} alt="" className="phone-reveal-chevron" />
                </button>
              </div>
              <InputField2
                label="Telefono"
                type="tel"
                placeholder="1526458466"
                value={formState.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
              />
            </div>
          </div>

          <div className="phone-reveal-terms">
            <Checkbox
              label="Acepto los Terminos y condiciones de Uso"
              checked={formState.termsAccepted}
              onChange={(checked) => handleChange('termsAccepted', checked)}
            />
            <Checkbox
              label="Acepto la Politica de Privacidad"
              checked={formState.privacyAccepted}
              onChange={(checked) => handleChange('privacyAccepted', checked)}
            />
          </div>

          <Button
            label="Ver telefono"
            variant="primary"
            type="button"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
