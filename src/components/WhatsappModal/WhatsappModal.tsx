'use client';

import { useEffect, useState } from 'react';
import './WhatsappModal.scss';
import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';

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
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    country: false,
    phone: false,
    terms: false,
    privacy: false,
  });
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

  const validateForm = () => {
    const nextErrors = {
      name: !formState.name.trim(),
      email: !formState.email.trim(),
      country: !formState.country.trim(),
      phone: !formState.phone.trim(),
      terms: !formState.termsAccepted,
      privacy: !formState.privacyAccepted,
    };

    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleChange = (field: keyof typeof formState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (
      (field === 'name' || field === 'email' || field === 'country' || field === 'phone') &&
      typeof value === 'string'
    ) {
      setFieldErrors((prev) => ({ ...prev, [field]: !value.trim() }));
      return;
    }

    if (field === 'termsAccepted') {
      setFieldErrors((prev) => ({ ...prev, terms: !Boolean(value) }));
      return;
    }

    if (field === 'privacyAccepted') {
      setFieldErrors((prev) => ({ ...prev, privacy: !Boolean(value) }));
    }
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
    if (!validateForm()) return;
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
          
          <div className="property-detail-contact-form">
            <div className="property-detail-input-row">
              <InputField2
                label="Nombre"
                value={formState.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('name', event.target.value)}
                id="contact_name"
                error={fieldErrors.name ? ' ' : ''}
              />
              <InputField2
                label="Email"
                type="email"
                value={formState.email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('email', event.target.value)}
                error={fieldErrors.email ? ' ' : ''}
              />
            </div>
            <div className="property-detail-input-row">
              <InputField2
                label="País"
                value={formState.country}
                onFocus={() => setIsCountryModalOpen(true)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('country', event.target.value)}
                id="contact_pais"
                icon={<img src={flagIcon} />}
                error={fieldErrors.country ? ' ' : ''}
              />
              <InputField2
                label="Telefono"
                value={formState.phone}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', event.target.value)}
                error={fieldErrors.phone ? ' ' : ''}
              />
            </div>
          </div>
          <div className="whatsapp-modal-terms">
            <Checkbox
              label="Acepto terminos y condiciones"
              checked={formState.termsAccepted}
              onChange={(checked) => handleChange('termsAccepted', checked)}
              error={fieldErrors.terms ? ' ' : undefined}
            />
            <Checkbox
              label="Acepto politica de privacidad"
              checked={formState.privacyAccepted}
              onChange={(checked) => handleChange('privacyAccepted', checked)}
              error={fieldErrors.privacy ? ' ' : undefined}
            />          
          </div>

          <button type="button" className="whatsapp-modal-submit" onClick={openWhatsApp}>
            Iniciar chat
          </button>
        </div>
      </div>
    </div>
  );
}
