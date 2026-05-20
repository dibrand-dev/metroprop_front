'use client';

import { CreatePropertyDraft } from '@/types/propiedad';
import './PublishCheckoutDetail.scss';
import { Plan } from '@/types/plan';

interface PublishCheckoutDetailProps {
  onNext: () => void;
  onBack: (emprendimiento: boolean) => void;
  planToBuy: Plan | null;
}

const iconChevron = '/icons/chevron-up.svg';


export default function PublishCheckoutDetail({
  planToBuy,
  onNext,
  onBack,
}: PublishCheckoutDetailProps) {
  const handleBack = () => {
    onBack(planToBuy?.emprendimiento ?? false);
  };

  const handleBuy = () => {
    onNext();
  };

  return (
    <div className="publish-checkout">
      <div className="publish-checkout-inner">
        <div className="publish-checkout-card">
          <div className="publish-checkout-back">
            <button type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
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
                {planToBuy && (
                  <div className="publish-checkout-row">
                    <span>{planToBuy.plan_name}</span>
                    <span>{planToBuy.currency} {planToBuy.price}</span>
                  </div>
                )}
              </div>
              <div className="publish-checkout-total">
                <span>Total</span>
                <span>{planToBuy ? `${planToBuy.currency} ${planToBuy.price}` : ''}</span>
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
