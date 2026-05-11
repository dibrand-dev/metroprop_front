'use client';

import { useState } from 'react';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';

const QUESTION_CHIPS = [
  'Se puede visitar hoy',
  'Aceptan permuta',
  'El edificio tiene amenities',
  'Tiene baulera',
];

const CONTACT_ACTIONS = [
  { id: 'whatsapp', label: 'Whatsapp', icon: '/icons/whatsapp.svg', variant: 'whatsapp' },
  { id: 'contact', label: 'Contactar', icon: '/icons/envelope.svg', variant: 'primary' },
];

const flagIcon = '/icons/flag.svg';

interface ContactFormProps {
  isModal?: boolean;
  propertyId?: number;
  userId?: number;
  organizationId?: number;
  onClose?: () => void;
  phoneNumber?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const EMPTY_FORM = { name: '', country: '', email: '', phone: '', message: '' };

export default function ContactForm({ isModal = false, propertyId, userId, organizationId, onClose, phoneNumber }: ContactFormProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const primaryContactAction = CONTACT_ACTIONS.find((action) => action.id === 'contact');
  const contactActions = isModal && primaryContactAction ? [primaryContactAction] : CONTACT_ACTIONS;

  const toggleQuestion = (question: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(question) ? prev.filter((item) => item !== question) : [...prev, question]
    );
  };

  const handleCountrySelect = (value: string) => {
    setFormState((prev) => ({ ...prev, country: value }));
  };

  const fieldErrors = touched ? {
    name: !formState.name.trim(),
    email: !formState.email.trim() || !isValidEmail(formState.email),
    country: !formState.country.trim(),
    phone: !formState.phone.trim(),
    message: !formState.message.trim(),
    terms: !termsAccepted,
    privacy: !privacyAccepted,
  } : { name: false, email: false, country: false, phone: false, message: false, terms: false, privacy: false };

  const isValid =
    formState.name.trim() &&
    isValidEmail(formState.email) &&
    formState.country.trim() &&
    formState.phone.trim() &&
    formState.message.trim() &&
    termsAccepted &&
    privacyAccepted;

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setSelectedQuestions([]);
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setTouched(false);
  };
  
  const openWhatsApp = (message: string) => {
    if (!phoneNumber) return;
    const encodedMessage = encodeURIComponent(`Hola, estoy interesado en esta propiedad que vi en MetroProp. ¿Podrías darme más información? <a href="https://metroprop.com/property/${propertyId}">Ver propiedad</a><br />${message}`);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };
  
  const handleSubmit = async (actionId: string) => {
    setTouched(true);
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        body: {
          name: formState.name,
          email: formState.email,
          country_code: formState.country,
          phone: formState.phone,
          message: formState.message,
          property_id: propertyId,
          owner_user_id: userId,
          organization_id: organizationId,
        },
      });
      if (actionId === 'whatsapp') {
        openWhatsApp(formState.message);
        resetForm();
        return;
      }
      resetForm();
      setShowSuccess(true);
      setTimeout(() => {        
        setShowSuccess(false);
        onClose?.();
      }, 3000);
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return <SuccessModal title="¡Mensaje enviado!" text="Nos pondremos en contacto a la brevedad." />;
  }

  return (
    <>
      <CountryCodeModal
        isOpen={isCountryModalOpen}
        selectedValue={formState.country}
        onClose={() => setIsCountryModalOpen(false)}
        onSelect={handleCountrySelect}
      />
      <form
        className={`property-detail-contact ${isModal ? 'property-detail-contact-modal-form' : ''}`}
        onSubmit={(event) => event.preventDefault()}
      >
        {!isModal && (
          <div className="property-detail-contact-header">
            <h2>Contacta al anunciante</h2>
          </div>
        )}

        <div className="property-detail-contact-block">
          <h3>Preguntas para el anunciante</h3>
          <p>Selecciona una o mas preguntas, o escribi tu consulta.</p>
          <div className="property-detail-question-grid">
            {QUESTION_CHIPS.map((question) => (
              <button
                key={question}
                type="button"
                className={`property-detail-question ${
                  selectedQuestions.includes(question) ? 'selected' : ''
                }`}
                onClick={() => toggleQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="property-detail-contact-form">
          <div className="property-detail-input-row">
            <InputField2
              label="Nombre"
              value={formState.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              id="contact_name"
              error={fieldErrors.name ? ' ' : ''}
            />
            <InputField2
              label="Email"
              type="email"
              value={formState.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
              error={fieldErrors.email ? ' ' : ''}
            />
          </div>
          <div className="property-detail-input-row">
            <InputField2
              label="País"
              value={formState.country}
              onFocus={() => setIsCountryModalOpen(true)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState((prev) => ({ ...prev, country: e.target.value }))}
              id="contact_pais"
              icon={<img src={flagIcon} />}
              error={fieldErrors.country ? ' ' : ''}
            />
            <InputField2
              label="Telefono"
              value={formState.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
              error={fieldErrors.phone ? ' ' : ''}
            />
          </div>
          <div className="property-detail-input-row single">
            <InputField2
              label="Consulta"
              value={formState.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormState((prev) => ({ ...prev, message: e.target.value }))}
              multiline={true}
              rows={4}
              id="contact_consulta"
              error={fieldErrors.message ? ' ' : ''}
            />
          </div>
        </div>

        <div className="property-detail-contact-terms">
          <Checkbox
            label="Acepto terminos y condiciones"
            checked={termsAccepted}
            onChange={setTermsAccepted}
            error={fieldErrors.terms ? ' ' : undefined}
          />
          <Checkbox
            label="Acepto politica de privacidad"
            checked={privacyAccepted}
            onChange={setPrivacyAccepted}
            error={fieldErrors.privacy ? ' ' : undefined}
          />
        </div>

        <div
          className={`property-detail-contact-actions ${isModal ? 'property-detail-contact-actions-modal' : ''}`}
        >
          {contactActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`property-detail-contact-action property-detail-contact-action-${action.variant}`}
              onClick={() => handleSubmit(action.id)}
              disabled={isSubmitting}
            >
              <img src={action.icon} alt="" aria-hidden="true" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </form>
    </>
  );
}
