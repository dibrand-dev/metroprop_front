'use client';

import { useState, useEffect, useRef } from 'react';
import './PublishCheckoutPayment.scss';
import InputField from '@/ui/InputField/InputField';
import Select from '@/ui/Select/Select';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { Plan } from '@/types/plan';
import { apiFetch } from '@/lib/apiFetch';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/utils/utils';

// ─── MercadoPago configuration ────────────────────────────────────────────────
const MP_PUBLIC_KEY = 'TEST-8a741dc5-dc45-4271-be8b-501f9ef0107c';
const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => {
      createCardToken: (data: Record<string, string>) => Promise<{ id: string; [key: string]: unknown }>;
    };
  }
}

interface PublishCheckoutPaymentProps {
  planToBuy: Plan | null;
  branchID?: number;
  onNext: () => void;
  onBack: () => void;
}

const iconChevron = '/icons/chevron-up.svg';

const documentOptions = [
  { value: 'DNI', label: 'DNI' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'CUIL', label: 'CUIL' },
  { value: 'CUIT', label: 'CUIT' },
];

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function PublishCheckoutPayment({
  onNext,
  onBack,
  planToBuy,
  branchID,
}: PublishCheckoutPaymentProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';
  const userHasOrganization = session?.user?.organization != null;
  const [cardHolder, setCardHolder] = useState('');
  const [email, setEmail] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [phone, setPhone] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const mpRef = useRef<InstanceType<Window['MercadoPago']> | null>(null);

  // Load MercadoPago SDK
  useEffect(() => {
    if (document.querySelector(`script[src="${MP_SDK_URL}"]`)) {
      if (window.MercadoPago) {
        mpRef.current = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
        setSdkReady(true);
      }
      return;
    }
    const script = document.createElement('script');
    script.src = MP_SDK_URL;
    script.async = true;
    script.onload = () => {
      mpRef.current = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
      setSdkReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardHolder.trim()) newErrors.cardHolder = 'El nombre del titular es obligatorio';
    if (!email.trim()) newErrors.email = 'El email es obligatorio';
    else if (!isValidEmail(email)) newErrors.email = 'El email no es válido';
    if (!areaCode.trim()) newErrors.areaCode = 'El código de área es obligatorio';
    if (!phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (!documentType) newErrors.documentType = 'El tipo de documento es obligatorio';
    if (!documentNumber.trim()) newErrors.documentNumber = 'El número de documento es obligatorio';

    const rawCard = cardNumber.replace(/\s/g, '');
    if (!rawCard) newErrors.cardNumber = 'El número de tarjeta es obligatorio';
    else if (rawCard.length < 13 || rawCard.length > 19) newErrors.cardNumber = 'El número de tarjeta no es válido';
    else if (!luhnCheck(rawCard)) newErrors.cardNumber = 'El número de tarjeta no es válido';

    const parts = expiryDate.split('/');
    if (!expiryDate) newErrors.expiryDate = 'El vencimiento es obligatorio';
    else if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
      newErrors.expiryDate = 'Formato inválido (MM/AA)';
    } else {
      const month = parseInt(parts[0], 10);
      const year = 2000 + parseInt(parts[1], 10);
      const now = new Date();
      if (month < 1 || month > 12) newErrors.expiryDate = 'Mes inválido';
      else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        newErrors.expiryDate = 'La tarjeta está vencida';
      }
    }

    if (!securityCode.trim()) newErrors.securityCode = 'El código de seguridad es obligatorio';
    else if (!/^\d{3,4}$/.test(securityCode)) newErrors.securityCode = 'El código debe tener 3 o 4 dígitos';

    if (!acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBuy = async () => {
    setSubmitError('');
    if (!validate()) return;
    if (!sdkReady || !mpRef.current) {
      setSubmitError('El servicio de pago no está disponible aún. Intente nuevamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const expiryParts = expiryDate.split('/');
      const tokenResult = await mpRef.current.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardHolder,
        cardExpirationMonth: expiryParts[0],
        cardExpirationYear: `20${expiryParts[1]}`,
        securityCode,
        identificationType: documentType,
        identificationNumber: documentNumber,
      });

      // Get payment method from card BIN (first 6 digits)
      const bin = cardNumber.replace(/\s/g, '').substring(0, 6);
      const binResponse = await fetch(
        `https://api.mercadopago.com/v1/payment_methods/search?public_key=${MP_PUBLIC_KEY}&bins=${bin}`
      );
      const binData = await binResponse.json();
      const paymentMethodId = binData?.results?.[0]?.id;
      if (!paymentMethodId) {
        throw new Error('No se pudo determinar el método de pago para esta tarjeta');
      }
     
      const response = await apiFetch(`${API_BASE_URL}/plans/${userHasOrganization ? `branch/${branchID}` : `user/${userId}`}`, {
        method: 'POST',
        body: {
          transaction_amount: planToBuy?.price ?? 0,
          token: tokenResult.id,
          description: planToBuy?.plan_name ?? 'Plan',
          installments: 1,
          payment_method_id: paymentMethodId,
          payer: {
            email,
            identification: {
              type: documentType,
              number: documentNumber,
            },
            phone: {
              area_code: areaCode,
              number: phone,
            },
          },
          planId: planToBuy?.id
        }
      }).then(data => {
        onNext();
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Payment failed with status ${response.status}`);
      }

      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('205') || message.includes('cardNumber')) {
        setErrors((prev) => ({ ...prev, cardNumber: 'El número de tarjeta no es válido' }));
      } else if (message.includes('208') || message.includes('cardExpirationMonth')) {
        setErrors((prev) => ({ ...prev, expiryDate: 'Mes de vencimiento inválido' }));
      } else if (message.includes('209') || message.includes('cardExpirationYear')) {
        setErrors((prev) => ({ ...prev, expiryDate: 'Año de vencimiento inválido' }));
      } else if (message.includes('214') || message.includes('identificationNumber')) {
        setErrors((prev) => ({ ...prev, documentNumber: 'Número de documento inválido' }));
      } else if (message.includes('316') || message.includes('cardholderName')) {
        setErrors((prev) => ({ ...prev, cardHolder: 'Nombre del titular inválido' }));
      } else if (message.includes('E301') || message.includes('securityCode')) {
        setErrors((prev) => ({ ...prev, securityCode: 'Código de seguridad inválido' }));
      } else {
        setSubmitError('Error al procesar el pago. Verifique los datos e intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="publish-payment">
      <div className="publish-payment-inner">
        <div className="publish-payment-card">
          <div className="publish-payment-back">
            <button type="button" onClick={onBack}>
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
                <div className="publish-payment-section-title">
                  <h2>Datos de pago</h2>
                  <span>Todos los campos son obligatorios</span>
                </div>

                <div className="publish-payment-field">
                  <InputField
                    label="Titular de la tarjeta"
                    value={cardHolder}
                    onChange={(e) => setCardHolder((e.target as HTMLInputElement).value)}
                    placeholder="Nombre y apellido del titular"
                    error={errors.cardHolder}
                  />
                </div>

                <div className="publish-payment-field">
                  <InputField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                    placeholder="Email"
                    type="email"
                    error={errors.email}
                  />
                </div>

                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <InputField
                      label="Cód. de área"
                      value={areaCode}
                      onChange={(e) => setAreaCode((e.target as HTMLInputElement).value)}
                      placeholder="11"
                      error={errors.areaCode}
                    />
                  </div>
                  <div className="publish-payment-field">
                    <InputField
                      label="Teléfono"
                      value={phone}
                      onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
                      placeholder="Número de teléfono"
                      type="tel"
                      error={errors.phone}
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
                      error={errors.documentType}
                    />
                  </div>
                  <div className="publish-payment-field">
                    <InputField
                      label="Número de documento"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber((e.target as HTMLInputElement).value)}
                      placeholder="Número de documento"
                      error={errors.documentNumber}
                    />
                  </div>
                </div>

                <div className="publish-payment-field">
                  <InputField
                    label="Número de tarjeta"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber((e.target as HTMLInputElement).value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    error={errors.cardNumber}
                    autoComplete="cc-number"
                  />
                </div>

                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <InputField
                      label="Vencimiento"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiry((e.target as HTMLInputElement).value))}
                      placeholder="MM/AA"
                      maxLength={5}
                      error={errors.expiryDate}
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div className="publish-payment-field">
                    <InputField
                      label="Cód. de seguridad"
                      value={securityCode}
                      onChange={(e) => setSecurityCode((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      error={errors.securityCode}
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>

                <Checkbox
                  label="Acepto Términos y condiciones de uso"
                  checked={acceptTerms}
                  onChange={(checked) => setAcceptTerms(checked)}
                  error={errors.acceptTerms}
                />
              </div>
            </div>

            <div className="publish-payment-summary">
              <h2>Detalle de compra</h2>
              <div className="publish-payment-summary-items">
                {planToBuy && (
                  <div className="publish-payment-summary-row">
                    <span>{planToBuy.plan_name}</span>
                    <span>{planToBuy.currency} {planToBuy.price}</span>
                  </div>
                )}
              </div>
              <div className="publish-payment-summary-total">
                <span>Total</span>
                <strong>{planToBuy ? `${planToBuy.currency} ${planToBuy.price}` : ''}</strong>
              </div>
              <button
                type="button"
                className="publish-payment-buy"
                onClick={handleBuy}
                disabled={isSubmitting || !sdkReady}
              >
                {isSubmitting ? 'Procesando...' : 'Comprar'}
              </button>
              {!sdkReady && (
                <p className="publish-payment-sdk-loading">Cargando servicio de pago...</p>
              )}
              {submitError && (
                <p className="publish-payment-submit-error">{submitError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

