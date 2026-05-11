'use client';

import { useState, useEffect } from 'react';
import './PublishPlans.scss';
import Select from '@/ui/Select/Select';
import { CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';

interface PublishPlansProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (descriptionData: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onComprar: () => void;
  onSaveAndExit: (descriptionData: Partial<CreatePropertyDraft>) => void;
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
  const [branchFilter, setBranchFilter] = useState('todas');
  const { data: sessionData } = useSession();

  const orgId = (sessionData?.user as any)?.organization?.id ?? null;

  const { data: fetchedBranches = [] } = useQuery<any[]>({
    queryKey: ['branches', orgId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/branches/organization/${orgId}`),
    enabled: !!orgId,
  });
  const branches: any[] = Array.isArray(fetchedBranches) ? fetchedBranches : [];
  const branchOptions = [
    { value: 'todas', label: 'Todas' },
    ...branches.map((b: any) => ({ value: String(b.id), label: b.branch_name ?? b.name ?? String(b.id) })),
  ];

  const { data: usersData } = useQuery<any>({
    queryKey: ['collaborators-users'],
    queryFn: () => apiFetch<any>(`${API_BASE_URL}/users`),
  });
  const rawData: any = usersData;
  const rawUsers: any[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);

  const { data: branchPlans = [], isLoading: loadingPlans } = useQuery<any[]>({
    queryKey: ['branch-plans', branchFilter],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/branch/${branchFilter}`),
    enabled: branchFilter !== 'todas',
  });

  const collaboratorOptions = rawUsers
    .filter((user: any) => {
      if (branchFilter === 'todas') return true;
      const userBranchId = String(user.branch_id ?? user.branch?.id ?? '');
      return userBranchId === branchFilter;
    })
    .map((user: any) => ({
      value: String(user.id),
      label: user.name ?? user.first_name ?? user.email ?? String(user.id),
    }));

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

            {branches.length > 0 && <div className="publish-plans-block">
              <h2>Asigna este aviso a un colaborador</h2>
              <div className="publish-plans-field">
                <Select
                  label="Sucursal"
                  placeholder="Todas"
                  value={branchFilter}
                  onChange={(value) => { setBranchFilter(value); setUser_id(undefined); }}
                  options={branchOptions}
                />
              </div>
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
                {branchFilter === 'todas' && (
                  <p style={{ fontSize: 13, color: '#888' }}>Seleccioná una sucursal para ver los planes disponibles.</p>
                )}
                {branchFilter !== 'todas' && loadingPlans && (
                  <p style={{ fontSize: 13, color: '#888' }}>Cargando planes...</p>
                )}
                {branchFilter !== 'todas' && !loadingPlans && branchPlans.length === 0 && (
                  <p style={{ fontSize: 13, color: '#888' }}>Sin planes disponibles para esta sucursal.</p>
                )}
                <div className="publish-plans-cards">
                  {branchPlans.map((plan: any, idx: number) => (
                    <div key={plan.id ?? idx} className="publish-plans-card-item">
                      <div className="publish-plans-card-header">
                        <span className="publish-plans-card-label">{plan.name ?? plan.label ?? `Plan ${idx + 1}`}</span>
                        <div className="publish-plans-card-price">
                          <strong>{plan.price ?? plan.amount ?? '-'}</strong>
                          <span>{plan.period ?? '/mes'}</span>
                        </div>
                      </div>
                      <ul>
                        {planBenefits.map((benefit, index) => (
                          <li key={`${plan.id ?? idx}-${index}`}>
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
