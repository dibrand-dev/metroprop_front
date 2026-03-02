'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPlans.scss';
import Select from '@/ui/Select/Select';

interface PublishPlansProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onComprar: () => void;
}

const iconChevron = '/icons/chevron-up.svg';
const iconCheck = '/icons/check-black.svg';

const collaboratorOptions = ['Daniela Benitez', 'Lucia Perez', 'Carlos Molina'];

const planOptions = [
  {
    id: 'bonificado',
    title: 'Bonificado',
    subtitle: 'Visibilidad baja',
    highlighted: true,
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

export default function PublishPlans({
  wizardData,
  updateWizardData,
  onComprar,
  onNext,
  onBack,
}: PublishPlansProps) {
  const [selectedCollaborator, setSelectedCollaborator] = useState(wizardData.plans?.selectedCollaborator || '');
  const [selectedPlan, setSelectedPlan] = useState(wizardData.plans?.selectedPlan || 'bonificado');

  const collaboratorSelectOptions = useMemo(
    () => collaboratorOptions.map(option => ({
      value: option,
      label: option,
    })),
    []
  );

  // Update wizard data when plans data changes
  useEffect(() => {
    updateWizardData({
      plans: {
        selectedCollaborator,
        selectedPlan,
      },
    });
  }, [selectedCollaborator, selectedPlan, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext();
  };

  const handleComprar = () => {
    onComprar();
  };

  return (
    <div className="publish-plans">
      <div className="publish-plans-inner">
        <div className="publish-plans-card">
          <div className="publish-plans-top">
            <div className="publish-plans-route">
              {wizardData.operation} - {wizardData.propertyType} {wizardData.propertySubtype}<br />{wizardData.location?.address}
            </div>
            <button className="publish-plans-link" type="button">
              Guardar y salir
            </button>
          </div>

          <div className="publish-plans-status">
            <span className="publish-plans-segment is-filled" />
            <span className="publish-plans-segment is-filled" />
            <span className="publish-plans-segment is-partial" />
          </div>

          <div className="publish-plans-section">
            <h1>Ya casi terminas</h1>

            <div className="publish-plans-block">
              <h2>Asigna este aviso a un colaborador</h2>
              <div className="publish-plans-field">
                <Select
                  label="Tus colaboradores"
                  options={collaboratorSelectOptions}
                  value={selectedCollaborator}
                  onChange={(value) => setSelectedCollaborator(value)}
                  placeholder="Seleccionar colaborador"
                />
              </div>
            </div>

            <div className="publish-plans-block">
              <h2>Elegi el plan con el que vas a publicar</h2>
              <div className="publish-plans-group">
                <h3>Planes disponibles</h3>
                {planOptions.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className={`publish-plans-radio ${
                      plan.highlighted ? 'is-highlighted' : ''
                    } ${selectedPlan === plan.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <span className="publish-plans-radio-dot" />
                    <span>{plan.title}</span>
                    <span className="publish-plans-radio-subtitle">{plan.subtitle}</span>
                  </button>
                ))}
              </div>

              <div className="publish-plans-group">
                <h3>Mas planes para vos</h3>
                <div className="publish-plans-cards">
                  {extraPlans.map((plan) => (
                    <div key={plan.id} className="publish-plans-card-item">
                      <div className="publish-plans-card-header">
                        <span className="publish-plans-card-label">{plan.label}</span>
                        <div className="publish-plans-card-price">
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
                      <button type="button" className="publish-plans-buy" onClick={handleComprar}>
                        Comprar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="publish-plans-footer">
            <button className="publish-plans-back" type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <button className="publish-plans-continue" type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
