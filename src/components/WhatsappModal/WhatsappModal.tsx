'use client';

import { useEffect, useState } from 'react';
import './WhatsappModal.scss';
// import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, sendPropertyToWhatsApp } from '@/utils/utils';
import { LeadContactType } from '@/types/propiedad';
import { useSession } from 'next-auth/react';
import SuccessModal from '../SuccessModal/SuccessModal';

interface WhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  propertyId: number;
  userId?: number;
  organizationId?: number;
}

const closeIcon = '/icons/close.svg';
const flagIcon = '/icons/flag.svg';

export default function WhatsappModal({ isOpen, onClose, phoneNumber, propertyId, userId, organizationId }: WhatsappModalProps) {
  const { data: sessionData } = useSession();
  // const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    // country: false,
    phone: false,
    terms: false,
    privacy: false,
  });
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    // countryCode: '+54',
    // country: 'Argentina',
    phone: '',
    termsAccepted: false,
    privacyAccepted: false,
  });

  useEffect(() => {
    const u = sessionData?.user as any;
    if (!u) return;
    setFormState((prev) => ({
      ...prev,
      name: u.name ?? prev.name,
      email: u.email ?? prev.email,
      phone: u.phone ?? prev.phone,
    }));
  }, [sessionData]);

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
      // country: !formState.country.trim(),
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
      (field === 'name' || field === 'email' /*|| field === 'country'*/ || field === 'phone') &&
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
/*
  const handleCountrySelect = (value: string) => {
    const parts = value.trim().split(' ');
    const dialCode = parts.shift() || '';
    const name = parts.join(' ').trim();
    setFormState((prev) => ({
      ...prev,
      // countryCode: dialCode || prev.countryCode,
      // country: name || prev.country,
    }));
  };
*/
    const handleSubmit = async () => {
      if (!validateForm()) return;
      try {
        await apiFetch(`${API_BASE_URL}/leads`, {
          method: 'POST',
          body: {
            name: formState.name,
            email: formState.email,
            // country_code: formState.country,
            phone: formState.phone,
            message: "Contacto por whatsapp desde la propiedad " + propertyId,
            property_id: propertyId,
            organization_id: organizationId,
            contact_type: LeadContactType.WHATSAPP,
            user_id: userId
          },
        });
        openWhatsApp();
      } catch {
        // silently fail
      }
    };

  const openWhatsApp = () => {
    if (!validateForm()) return;
    if (!phoneNumber) {
      setShowSuccess(true);
      setTimeout(() => {        
        setShowSuccess(false);
        onClose?.();
      }, 3000);
      return;
    };
    propertyId && sendPropertyToWhatsApp(propertyId, phoneNumber ?? '', '');
  };

  if (showSuccess) {
    return <SuccessModal title="¡Mensaje enviado!" text="Nos pondremos en contacto a la brevedad." />;
  }
  return (
    <div className="whatsapp-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="whatsapp-modal" onClick={(event) => event.stopPropagation()}>
        {/*<CountryCodeModal
          isOpen={isCountryModalOpen}
          selectedValue={`${formState.countryCode} ${formState.country}`}
          onClose={() => setIsCountryModalOpen(false)}
          onSelect={handleCountrySelect}
        />*/}
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
              {/*<InputField2
                label="País"
                value={formState.country}
                onFocus={() => setIsCountryModalOpen(true)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('country', event.target.value)}
                id="contact_pais"
                icon={<img src={flagIcon} />}
                error={fieldErrors.country ? ' ' : ''}
              />*/}
              <InputField2
                label="Teléfono"
                value={formState.phone}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange('phone', event.target.value)}
                error={fieldErrors.phone ? ' ' : ''}
              />
            </div>
          </div>
          <div className="whatsapp-modal-terms">
            <Checkbox
              label={<>Acepto&nbsp;<a rel="noopener noreferrer" target="_blank" href="/terms">Términos y condiciones de uso</a></>}
              checked={formState.termsAccepted}
              onChange={(checked) => handleChange('termsAccepted', checked)}
              error={fieldErrors.terms ? ' ' : undefined}
            />
            <Checkbox
              label={<>Acepto&nbsp;<a rel="noopener noreferrer" target="_blank" href="/policy">Política de privacidad</a></>}
              checked={formState.privacyAccepted}
              onChange={(checked) => handleChange('privacyAccepted', checked)}
              error={fieldErrors.privacy ? ' ' : undefined}
            />          
          </div>

          <button type="button" className="whatsapp-modal-submit" onClick={() => handleSubmit()}>
            Iniciar chat
          </button>
        </div>
      </div>
    </div>
  );
}
