'use client';

import { useRouter } from 'next/navigation';
import './PublishCheckoutDetail.scss';

const iconBack = '/icons/arrow.svg';

const purchaseItems = [
  { label: '1 Destacada', value: '$20.000,25' },
  { label: 'Impuestos (21,00%)', value: '$12000' },
];

const totalValue = '$32000,25';

export default function PublishCheckoutDetail() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/protected/publish/plans');
  };

  const handleBuy = () => {
    router.push('/protected/publish/checkout/payment');
  };

  return (
    <div className="publish-checkout">
      <div className="publish-checkout-inner">
        <div className="publish-checkout-card">
          <div className="publish-checkout-back">
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
            <div className="publish-checkout-step">
              <span>2</span>
              <p>Paga</p>
            </div>
            <div className="publish-checkout-step">
              <span>3</span>
              <p>Listo</p>
            </div>
            <div className="publish-checkout-line" />
          </div>

          <div className="publish-checkout-section">
            <h1>Detalle de compra</h1>
            <div className="publish-checkout-summary">
              <div className="publish-checkout-items">
                {purchaseItems.map((item) => (
                  <div key={item.label} className="publish-checkout-row">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="publish-checkout-total">
                <span>Total</span>
                <strong>{totalValue}</strong>
              </div>
            </div>
            <button className="publish-checkout-buy" type="button" onClick={handleBuy}>
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
