'use client';

import { useEffect, useState } from 'react';
import './WhatsappModal.scss';
import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';

interface WhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  propertyId: number;
}

const closeIcon = '/icons/close.svg';
const flagIcon = '/icons/flag.svg';
const chevronIcon = '/icons/chevron-up.svg';

export default function WhatsappModal({ isOpen, onClose, phoneNumber, propertyId }: WhatsappModalProps) {
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

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }
    if (window.innerWidth > 768) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hola, estoy interesado en esta propiedad que vi en MetroProp. ¿Podrías darme más información? <a href="https://metroprop.com/property/${propertyId}">Ver propiedad</a>`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="whatsapp-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="whatsapp-modal" onClick={(event) => event.stopPropagation()}>
        <CountryCodeModal
          isOpen={isCountryModalOpen}
          selectedValue={`${formState.countryCode} ${formState.country}`}
          onClose={() => setIsCountryModalOpen(false)}
          onSelect={handleCountrySelect}
        />
        <div className="whatsapp-modal-header">
          <h3>WhatsApp</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="whatsapp-modal-body">
          <h4>Escribile un mensaje al anunciante por esta propiedad</h4>

          <div className="whatsapp-modal-form">
            <div className="whatsapp-modal-row">
              <label className="whatsapp-modal-field">
                <span>Nombre</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Nombre"
                />
              </label>
              <label className="whatsapp-modal-field wide">
                <span>Email</span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  placeholder="unemail@dibrand.com"
                />
              </label>
            </div>

            <div className="whatsapp-modal-row">
              <div className="whatsapp-modal-field">
                <span>Pais</span>
                <button
                  type="button"
                  className="whatsapp-modal-country"
                  onClick={() => setIsCountryModalOpen(true)}
                >
                  <span className="whatsapp-modal-flag" aria-hidden="true">
                    <img src={flagIcon} alt="" />
                  </span>
                  <span>{formState.countryCode}</span>
                  <img src={chevronIcon} alt="" className="whatsapp-modal-chevron" />
                </button>
              </div>
              <label className="whatsapp-modal-field wide">
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

          <div className="whatsapp-modal-terms">
            <label className="whatsapp-modal-checkbox">
              <input
                type="checkbox"
                checked={formState.termsAccepted}
                onChange={(event) => handleChange('termsAccepted', event.target.checked)}
              />
              <span>
                Acepto los <u>Terminos y condiciones de Uso</u>
              </span>
            </label>
            <label className="whatsapp-modal-checkbox">
              <input
                type="checkbox"
                checked={formState.privacyAccepted}
                onChange={(event) => handleChange('privacyAccepted', event.target.checked)}
              />
              <span>
                Acepto la <u>Politica de Privacidad</u>
              </span>
            </label>
          </div>

          <button type="button" className="whatsapp-modal-submit" onClick={openWhatsApp}>
            Iniciar chat
          </button>
        </div>
      </div>
    </div>
  );
}
