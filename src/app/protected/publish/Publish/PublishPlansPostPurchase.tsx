'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './PublishPlansPostPurchase.scss';

const iconBack = '/icons/arrow.svg';
const iconCheck = '/icons/check.svg';

const availablePlans = [
  {
    id: 'baja',
    label: 'Visibilidad baja',
    quantity: null,
  },
  {
    id: 'alta',
    label: 'Visibilidad alta',
    quantity: 'Cantidad disponible: 1',
  },
];

const extraPlans = [
  {
    id: 'premium',
    label: '1 Premium',
    price: '$20.000,25',
    period: '/mes',
  },
  {
    id: 'destacada',
    label: '1 Destacada',
    price: '$20.000,25',
    period: '/mes',
  },
  {
    id: 'simple',
    label: '1 Simple',
    price: '$20.000,25',
    period: '/mes',
  },
];

const planBenefits = [
  'Detalle o beneficio del plan a definir con producto',
  'Detalle o beneficio del plan a definir con producto',
  'Detalle o beneficio del plan a definir con producto',
];

export default function PublishPlansPostPurchase() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('baja');

  const handleBack = () => {
    router.push('/protected/publish/checkout/payment');
  };

  const handleContinue = () => {
    router.push('/protected/publish/review');
  };

  return (
    <div className="publish-post-plans">
      <div className="publish-post-plans-inner">
        <div className="publish-post-plans-card">
          <div className="publish-post-plans-top">
            <div className="publish-post-plans-route">
              <p>Venta - Casa Duplex Juncal 2345</p>
            </div>
            <button className="publish-post-plans-link" type="button">
              Guardar y salir
            </button>
          </div>

          <div className="publish-post-plans-status">
            <span className="publish-post-plans-segment is-filled" />
            <span className="publish-post-plans-segment is-filled" />
            <span className="publish-post-plans-segment is-partial" />
          </div>

          <div className="publish-post-plans-section">
            <div className="publish-post-plans-heading">
              <h1>Ya casi terminas</h1>
              <h2>Elegi el plan con el que vas a publicar</h2>
            </div>

            <div className="publish-post-plans-group">
              <h3>Planes disponibles</h3>
              <div className="publish-post-plans-options">
                {availablePlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className={`publish-post-plans-option ${
                      selectedPlan === plan.id ? 'is-selected' : ''
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <span className="publish-post-plans-option-dot" />
                    <span className="publish-post-plans-option-label">{plan.label}</span>
                    {plan.quantity ? (
                      <span className="publish-post-plans-option-qty">{plan.quantity}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="publish-post-plans-group">
              <h3>Mas planes para vos</h3>
              <div className="publish-post-plans-cards">
                {extraPlans.map((plan) => (
                  <div key={plan.id} className="publish-post-plans-card-item">
                    <div className="publish-post-plans-card-header">
                      <span className="publish-post-plans-card-label">{plan.label}</span>
                      <div className="publish-post-plans-card-price">
                        <strong>{plan.price}</strong>
                        <span>{plan.period}</span>
                      </div>
                    </div>
                    <ul>
                      {planBenefits.map((benefit, index) => (
                        <li key={`${plan.id}-${index}`}>
                          <img src={iconCheck} alt="" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="publish-post-plans-buy">
                      Comprar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="publish-post-plans-footer">
            <button className="publish-post-plans-back" type="button" onClick={handleBack}>
              <img src={iconBack} alt="" />
              Volver
            </button>
            <button
              className="publish-post-plans-continue"
              type="button"
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
