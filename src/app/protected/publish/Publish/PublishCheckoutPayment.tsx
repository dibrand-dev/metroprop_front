'use client';

import { useState, useEffect } from 'react';
import './PublishCheckoutPayment.scss';
import InputField from '@/ui/InputField/InputField';
import Select from '@/ui/Select/Select';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { CreatePropertyDraft } from '@/types/propiedad';

interface PublishCheckoutPaymentProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

const iconChevron = '/icons/chevron-up.svg';

const summaryItems = [
  { label: '1 Destacada', value: '$20.000,25' },
  { label: 'Impuestos (21,00%)', value: '$12000' },
];

export default function PublishCheckoutPayment({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishCheckoutPaymentProps) {
  const [cardHolder, setCardHolder] = useState(wizardData.checkoutPayment?.cardHolder || '');
  const [email, setEmail] = useState(wizardData.checkoutPayment?.email || '');
  const [areaCode, setAreaCode] = useState(wizardData.checkoutPayment?.areaCode || '');
  const [phone, setPhone] = useState(wizardData.checkoutPayment?.phone || '');
  const [documentType, setDocumentType] = useState(wizardData.checkoutPayment?.documentType || '');
  const [documentNumber, setDocumentNumber] = useState(wizardData.checkoutPayment?.documentNumber || '');
  const [cardNumber, setCardNumber] = useState(wizardData.checkoutPayment?.cardNumber || '');
  const [expiryDate, setExpiryDate] = useState(wizardData.checkoutPayment?.expiryDate || '');
  const [securityCode, setSecurityCode] = useState(wizardData.checkoutPayment?.securityCode || '');
  const [acceptTerms, setAcceptTerms] = useState(wizardData.checkoutPayment?.acceptTerms || true);

  const documentOptions = [
    { value: 'dni', label: 'DNI' },
    { value: 'pasaporte', label: 'Pasaporte' },
  ];

  // Update wizard data when checkout payment data changes
  useEffect(() => {
    updateWizardData({
      checkoutPayment: {
        cardHolder,
        email,
        areaCode,
        phone,
        documentType,
        documentNumber,
        cardNumber,
        expiryDate,
        securityCode,
        acceptTerms,
      },
    });
  }, [cardHolder, email, areaCode, phone, documentType, documentNumber, cardNumber, expiryDate, securityCode, acceptTerms, updateWizardData]);
  const handleBack = () => {
    onBack();
  };

  const handleBuy = () => {
    onNext();
  };

  return (
    <div className="publish-payment">
      <div className="publish-payment-inner">
        <div className="publish-payment-card">
          <div className="publish-payment-back">
            <button type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Seleccion de planes
            </button>
          </div>

          <div className="publish-checkout-stepper">
            <div className="publish-checkout-step is-completed">
              <span>1</span>
              <p>Detalle de compra</p>
            </div>
            <div className="publish-checkout-step is-active">
              <span>2</span>
              <p>Paga</p>
            </div>
            <div className="publish-checkout-step">
              <span>3</span>
              <p>Listo</p>
            </div>
            <div className="publish-checkout-line half" />
          </div>

          <div className="publish-payment-body">
            <div className="publish-payment-form">
              <h1>Pago</h1>
              <div className="publish-payment-section">
                <h2>Datos de facturacion</h2>
                <div className="publish-payment-note">
                  Nombre / Razon social: Rodrigo Perez
                  <br />
                  Condicion de IVA: Responsable inscri...
                  <br />
                  CUIT: 270647589
                </div>
              </div>

              <div className="publish-payment-section">
                <div className="publish-payment-section-title">
                  <h2>Datos de pago</h2>
                  <span>Todos los campos son obligatorios</span>
                </div>
                <div className="publish-payment-field">
                  <InputField
                    label="Titular de la tarjeta"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Nombre y apellido de titular"
                    required
                  />
                </div>
                <div className="publish-payment-field">
                  <InputField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    required
                  />
                </div>
                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <InputField
                      label="Cod. de area"
                      value={areaCode}
                      onChange={(e) => setAreaCode(e.target.value)}
                      placeholder="Cod. de area"
                      type="number"
                      required
                    />
                  </div>
                  <div className="publish-payment-field">
                    <InputField
                      label="Telefono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Numero de telefono"
                      type="tel"
                      required
                    />
                  </div>
                </div>
                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <Select
                      label="Documento"
                      options={documentOptions}
                      value={documentType}
                      onChange={(value) => setDocumentType(value)}
                      placeholder="Seleccionar"
                      required
                    />
                  </div>
                  <div className="publish-payment-field">
                    <InputField
                      label="Numero de documento"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Numero de documento"
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div className="publish-payment-field">
                  <InputField
                    label="Numero de tarjeta"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Ej. 1234 4568 4587"
                    required
                  />
                </div>
                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <InputField
                      label="Vencimiento"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/AA"
                      required
                    />
                  </div>
                  <div className="publish-payment-field">
                    <InputField
                      label="Cod. de seguridad"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      placeholder="Ej. 123"
                      type="number"
                      required
                    />
                  </div>
                </div>
                <Checkbox
                  label="Acepto Terminos y condiciones de uso"
                  checked={acceptTerms}
                  onChange={(checked) => setAcceptTerms(checked)}
                  required
                />
              </div>
            </div>

            <div className="publish-payment-summary">
              <h2>Detalle de compra</h2>
              <div className="publish-payment-summary-items">
                {summaryItems.map((item) => (
                  <div key={item.label} className="publish-payment-summary-row">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="publish-payment-summary-total">
                <span>Total</span>
                <strong>$32000,25</strong>
              </div>
              <button type="button" className="publish-payment-buy" onClick={handleBuy}>
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
