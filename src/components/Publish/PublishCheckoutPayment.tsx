'use client';

import { useRouter } from 'next/navigation';
import './PublishCheckoutPayment.scss';

const iconBack = '/icons/arrow.svg';

const summaryItems = [
  { label: '1 Destacada', value: '$20.000,25' },
  { label: 'Impuestos (21,00%)', value: '$12000' },
];

export default function PublishCheckoutPayment() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/protected/publish/checkout/detail');
  };

  const handleBuy = () => {
    router.push('/protected/publish/plans/post-purchase');
  };

  return (
    <div className="publish-payment">
      <div className="publish-payment-inner">
        <div className="publish-payment-card">
          <div className="publish-payment-back">
            <button type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
              Seleccion de planes
            </button>
          </div>

          <div className="publish-checkout-stepper">
            <div className="publish-checkout-step is-active">
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
            <div className="publish-checkout-line" />
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
                  <label>Titular de la tarjeta</label>
                  <input type="text" placeholder="Nombre y apellido de titular" />
                </div>
                <div className="publish-payment-field">
                  <label>Email</label>
                  <input type="text" placeholder="Email" />
                </div>
                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <label>Cod. de area</label>
                    <input type="text" placeholder="Cod. de area" />
                  </div>
                  <div className="publish-payment-field">
                    <label>Telefono</label>
                    <input type="text" placeholder="Numero de telefono" />
                  </div>
                </div>
                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <label>Documento</label>
                    <select>
                      <option>Seleccionar</option>
                      <option>DNI</option>
                      <option>Pasaporte</option>
                    </select>
                  </div>
                  <div className="publish-payment-field">
                    <label>Numero de documento</label>
                    <input type="text" placeholder="Numero de documento" />
                  </div>
                </div>
                <div className="publish-payment-field">
                  <label>Numero de tarjeta</label>
                  <input type="text" placeholder="Ej. 1234 4568 4587" />
                </div>
                <div className="publish-payment-row">
                  <div className="publish-payment-field">
                    <label>Vencimiento</label>
                    <input type="text" placeholder="MM/AA" />
                  </div>
                  <div className="publish-payment-field">
                    <label>Cod. de seguridad</label>
                    <input type="text" placeholder="Ej. 123" />
                  </div>
                </div>
                <label className="publish-payment-checkbox">
                  <input type="checkbox" defaultChecked />
                  <span>Acepto Terminos y condiciones de uso</span>
                </label>
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
