'use client';

import './PublishCheckoutSuccess.scss';
import Button from '@/ui/Button/Button';

interface PublishCheckoutSuccessProps {
  onFinish: () => void;
}

const iconCheck = '/icons/check.svg';

const summaryItems = [
  { label: '1 Destacada', value: '$20.000,25' },
  { label: 'Impuestos (21,00%)', value: '$12000' },
];

export default function PublishCheckoutSuccess({
  onFinish,
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
                  {summaryItems.map((item) => (
                    <div key={item.label} className="publish-success-item">
                      <span className="publish-success-item-label">{item.label}</span>
                      <span className="publish-success-item-value">{item.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="publish-success-total">
                  <span className="publish-success-total-label">Total</span>
                  <span className="publish-success-total-value">$32000,25</span>
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