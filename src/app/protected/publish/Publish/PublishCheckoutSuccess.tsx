'use client';

import { Plan } from '@/types/plan';
import './PublishCheckoutSuccess.scss';
import Button from '@/ui/Button/Button';
import { formatCurrency, formatNumbers } from '@/utils/utils';

interface PublishCheckoutSuccessProps {
  onFinish: () => void;
  planToBuy: any; 
}

const iconCheck = '/icons/check.svg';

export default function PublishCheckoutSuccess({
  onFinish,
  planToBuy,
}: PublishCheckoutSuccessProps) {
  return (
    <div className="publish-success">
      <div className="publish-success-inner">
        <div className="publish-success-card">
          <div className="publish-checkout-stepper">
            <div className="publish-checkout-step is-completed">
              <span>1</span>
              <p>Detalle de compra</p>
            </div>
            <div className="publish-checkout-step is-completed">
              <span>2</span>
              <p>Paga</p>
            </div>
            <div className="publish-checkout-step is-completed">
              <span>3</span>
              <p>Listo</p>
            </div>
            <div className="publish-checkout-line success" />
          </div>

          <div className="publish-success-body">
            <div className="publish-success-notification">
              <div className="publish-success-icon">
                <img src={iconCheck} alt="" />
              </div>
              <h1>Tu compra se realizó con éxito</h1>
            </div>

            <div className="publish-success-details">
              <h2>Detalle de compra</h2>
             
              <div className="publish-success-summary">
                <div className="publish-success-items">
                  <div className="publish-success-item">
                    <span className="publish-success-item-label">{planToBuy.plan_name}</span>
                    <span className="publish-success-item-value">{formatNumbers(planToBuy.price)}</span>
                  </div>
                </div>
                
                <div className="publish-success-total">
                  <span className="publish-success-total-label">Total</span>
                  <span className="publish-success-total-value">{formatCurrency(planToBuy.currency)} {formatNumbers(planToBuy.price)}</span>
                </div>
              </div>

              <Button
                label="Volver a mi aviso"
                variant="primary"
                onClick={onFinish}
                fullWidth
                className="publish-success-button"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}