'use client';
import { Organization } from '@/types/propiedad';
import { useEffect, useState } from 'react';
import './PhoneRevealModal.scss';
// import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import { LeadContactType } from '@/types/propiedad';
import { useSession } from 'next-auth/react';

interface PropertyUser {
  name?: string;
  email?: string;
  phone?: string;
  phone_additional?: string;
  phone_whatsapp?: string;
}

interface PhoneRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: number;
  userId?: number;
  organizationId?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  user?: PropertyUser;
  organization: Organization | null;
  branchId?: number;
}

const closeIcon = '/icons/close.svg';
const flagIcon = '/icons/flag.svg';
const chevronIcon = '/icons/chevron-up.svg';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const EMPTY_FORM = {
  name: '',
  email: '',
  // countryCode: '+54',
  // country: 'Argentina',
  phone: '',
};

export default function PhoneRevealModal({ isOpen, onClose, propertyId, userId, organizationId, ownerName, ownerEmail, ownerPhone, user, organization, branchId }: PhoneRevealModalProps) {
  const { data: sessionData } = useSession();
  // const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [branchPhone, setBranchPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !branchId || user?.phone || organization?.phone) return;
    apiFetch<any>(`${API_BASE_URL}/branches/${branchId}`)
      .then((branch) => setBranchPhone(branch?.phone ?? null))
      .catch(() => setBranchPhone(null));
  }, [isOpen, branchId, user?.phone, organization?.phone]);

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

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
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

  const fieldErrors = touched ? {
    name: !formState.name.trim(),
    email: !formState.email.trim() || !isValidEmail(formState.email),
    phone: !formState.phone.trim(),
    terms: !termsAccepted,
    privacy: !privacyAccepted,
  } : { name: false, email: false, phone: false, terms: false, privacy: false };

  const isValid =
    formState.name.trim() &&
    isValidEmail(formState.email) &&
    formState.phone.trim() &&
    termsAccepted &&
    privacyAccepted;

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        body: {
          name: formState.name,
          email: formState.email,
          // country_code: formState.countryCode,
          phone: formState.phone,
          message: 'Vio teléfono',
          property_id: propertyId,
          organization_id: organizationId,
          contact_type: LeadContactType.SAW_CONTACT,
          user_id: userId
        },
      });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'ver_telefono_enviado',
        id_propiedad: propertyId,
      });
      setFormState(EMPTY_FORM);
      setTermsAccepted(false);
      setPrivacyAccepted(false);
      setTouched(false);
      setShowSuccess(true);
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="phone-reveal-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="phone-reveal-modal" onClick={(event) => event.stopPropagation()}>
        {/*<CountryCodeModal
          isOpen={isCountryModalOpen}
          selectedValue={`${formState.countryCode} ${formState.country}`}
          onClose={() => setIsCountryModalOpen(false)}
          onSelect={handleCountrySelect}
        />*/}
        <div className="phone-reveal-modal-header">
          <h3>Ver teléfono</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className="phone-reveal-modal-body">
          {showSuccess ? (
            <div className="phone-reveal-success">
              <h4>¡Listo! Estos son los datos de contacto:</h4>
              {user && (user.name || user.email || user.phone || user.phone_additional || user.phone_whatsapp) ? (
                <ul className="phone-reveal-contact-list">
                  {user.name && <li><strong>Nombre:</strong> {user.name}</li>}
                  {user.email && <li><strong>Email:</strong> {user.email}</li>}
                  {user.phone 
                    ? <li><strong>Teléfono:</strong> {user.phone}</li>
                    : organization?.phone 
                      ? <li><strong>Teléfono:</strong> {organization.phone}</li>
                      : branchPhone 
                        ? <li><strong>Teléfono:</strong> {branchPhone}</li>
                        : null
                  }
                  {user.phone_additional && <li><strong>Teléfono adicional:</strong> {user.phone_additional}</li>}
                  {user.phone_whatsapp && <li><strong>WhatsApp:</strong> {user.phone_whatsapp}</li>}
                </ul>
              ) : (
                <ul className="phone-reveal-contact-list">
                  {ownerName && <li><strong>Nombre:</strong> {ownerName}</li>}
                  {ownerEmail && <li><strong>Email:</strong> {ownerEmail}</li>}
                  {ownerPhone && <li><strong>Teléfono:</strong> {ownerPhone}</li>}
                </ul>
              )}
              <Button label="Cerrar" variant="primary" type="button" fullWidth onClick={onClose} />
            </div>
          ) : (
            <>
              <h4>
                Completa tus datos y podrás ver el
                <br />
                teléfono del anunciante.
              </h4>

              <div className="phone-reveal-form">
                <div className="phone-reveal-row">
                  <InputField2
                    label="Nombre"
                    type="text"
                    placeholder="Nombre"
                    value={formState.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    error={fieldErrors.name ? ' ' : ''}
                  />
                  <InputField2
                    label="Email"
                    type="email"
                    placeholder="unemail@dibrand.com"
                    value={formState.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    error={fieldErrors.email ? ' ' : ''}
                  />
                </div>

                <div className="phone-reveal-row">
                  {/*<div className="phone-reveal-field">
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
                  </div>*/}
                  <InputField2
                    label="Teléfono"
                    type="tel"
                    placeholder="1526458466"
                    value={formState.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    error={fieldErrors.phone ? ' ' : ''}
                  />
                </div>
              </div>

              <div className="phone-reveal-terms">
                <Checkbox
                  label={<>Acepto&nbsp;<a rel="noopener noreferrer" target="_blank" href="/terms">Términos y condiciones de uso</a></>}
                  checked={termsAccepted}
                  onChange={(checked) => setTermsAccepted(checked)}
                  error={fieldErrors.terms ? ' ' : undefined}
                />
                <Checkbox
                  label={<>Acepto&nbsp;<a rel="noopener noreferrer" target="_blank" href="/policy">Política de privacidad</a></>}
                  checked={privacyAccepted}
                  onChange={(checked) => setPrivacyAccepted(checked)}
                  error={fieldErrors.privacy ? ' ' : undefined}
                />
              </div>

              <Button
                label={isSubmitting ? 'Enviando...' : 'Ver teléfono'}
                variant="primary"
                type="button"
                fullWidth
                onClick={handleSubmit}
                disabled={isSubmitting}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
