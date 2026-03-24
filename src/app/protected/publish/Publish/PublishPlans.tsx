'use client';

import { useMemo, useState, useEffect } from 'react';
import './PublishPlans.scss';
import Select from '@/ui/Select/Select';
import { CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import { useSession } from 'next-auth/react';

interface PublishPlansProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (descriptionData: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onComprar: () => void;
  onSaveAndExit: () => void;
}

const iconChevron = '/icons/chevron-up.svg';
const iconCheck = '/icons/check-black.svg';

const planOptions = [
  {
    id: 1,
    title: 'Bonificado',
    subtitle: '',
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
  onSaveAndExit
}: PublishPlansProps) {
  const [user_id, setUser_id] = useState(wizardData.user_id || undefined);
  const [selected_plan, setSelected_plan] = useState(wizardData.selected_plan || 1);
  const { data: sessionData } = useSession();

  type Collaborator = { id: number; name: string };
  type Branch = { id: number; branch_name: string; users?: Collaborator[] };
  type Organization = { branches?: Branch[] };
  const organization = (sessionData as { user?: { organization?: Organization } } | null)?.user?.organization;

  const collaboratorOptions = useMemo(() => {
    const branches = [...(organization?.branches ?? [])].sort((a: Branch, b: Branch) =>
      (a.branch_name ?? '').localeCompare(b.branch_name ?? '', 'es', { sensitivity: 'base' })
    );

    return branches.flatMap((branch: Branch) => {
      const users = [...(branch.users ?? [])].sort((a: Collaborator, b: Collaborator) =>
        (a.name ?? '').localeCompare(b.name ?? '', 'es', { sensitivity: 'base' })
      );

      return users.map((user: Collaborator) => ({
        value: user.id.toString(),
        label: `${user.name} - ${branch.branch_name}`,
      }));
    });
  }, [organization]);

  console.log("sessionData" , sessionData)
  // Update wizard data when plans data changes
  useEffect(() => {
    updateWizardData({
      user_id,
      selected_plan,
    });
  }, [user_id, selected_plan, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext({
      user_id,
      selected_plan,
    });
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
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} {wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-plans-link" type="button" onClick={onSaveAndExit}>
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

            {organization && <div className="publish-plans-block">
              <h2>Asigna este aviso a un colaborador</h2>
              <div className="publish-plans-field">
                <Select
                  label="Tus colaboradores"
                  options={collaboratorOptions}
                  value={user_id ? user_id.toString() : undefined}
                  onChange={(value) => setUser_id(value ? parseInt(value) : undefined)}
                  placeholder="Seleccionar colaborador"
                />
              </div>
            </div>}

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
                    } ${selected_plan === plan.id ? 'is-selected' : ''}`}
                    onClick={() => setSelected_plan(plan.id)}
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
