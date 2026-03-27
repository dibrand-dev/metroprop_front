'use client';

import { useState } from 'react';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import CountryCodeModal from '@/components/CountryCodeModal/CountryCodeModal';

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
}

export default function ContactForm({ isModal = false }: ContactFormProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [formState, setFormState] = useState({
    name: '',
    country: '',
    email: '',
    phone: '',
    message: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

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
            />
            <InputField2
              label="Email"
              type="email"
              value={formState.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
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
            />
            <InputField2
              label="Telefono"
              value={formState.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
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
            />
          </div>
        </div>

        <div className="property-detail-contact-terms">
          <Checkbox
            label="Acepto terminos y condiciones"
            checked={termsAccepted}
            onChange={setTermsAccepted}
          />
          <Checkbox
            label="Acepto politica de privacidad"
            checked={privacyAccepted}
            onChange={setPrivacyAccepted}
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
