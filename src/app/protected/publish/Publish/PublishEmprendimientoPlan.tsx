'use client';

import { useState, useEffect } from 'react';
import './PublishEmprendimientoPlan.scss';
import Select from '@/ui/Select/Select';
import { CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import { Plan } from '@/types/plan';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';

interface PublishPlansProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (descriptionData: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  goToStep: (step: EmprendimientoStep) => void;
  onComprar: (plan: Plan, branchFilter: number) => void;
  onSaveAndExit: (descriptionData: Partial<CreatePropertyDraft>) => void;
}

const iconChevron = '/icons/chevron-up.svg';
const iconCheck = '/icons/check-black.svg';


export default function PublishPlansEmprendimiento({
  wizardData,
  updateWizardData,
  onComprar,
  onNext,
  onBack,
  onSaveAndExit,
  goToStep 
}: PublishPlansProps) {
  const [user_id, setUser_id] = useState(wizardData.user_id || undefined);
  const [selected_plan, setSelected_plan] = useState(wizardData.selected_plan || 1);
  const [branchFilter, setBranchFilter] = useState('');
  const { data: sessionData } = useSession();


  const { data:plansData , isLoading, isError } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/plans/`),
    staleTime: 30_000,
  });

  const orgId = (sessionData?.user as any)?.organization?.id ?? null;

  const { data: fetchedBranches = [] } = useQuery<any[]>({
    queryKey: ['branches', orgId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/branches/organization/${orgId}`),
    enabled: !!orgId,
  });
  const branches: any[] = Array.isArray(fetchedBranches) ? fetchedBranches : [];
  const branchOptions = [
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
    enabled: !!branchFilter,
  });

  const collaboratorOptions = rawUsers
    .filter((user: any) => {
      if (!branchFilter) return true;
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

  const handleComprar = (plan: any) => {
    onComprar(plan, parseInt(branchFilter));
  };

  return (
    <div className="publish-emprendimiento-preview">
      <div className="publish-emprendimiento-preview-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-text">Emprendimientos</span>
        </div>

        {/* Header */}
        <div className="header">
          <h1 className="title">Publicar emprendimiento</h1>
        </div>

        {/* Secondary Menu / Tabs */}
        <EmprendimientoTabs currentStep="emprendimiento-plans" goToStep={goToStep} />

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
            <button                    
              type="button"
              className={`publish-plans-radio is-highlighted ${selected_plan === 0 ? 'is-selected' : ''}`}
              onClick={() => setSelected_plan(0)}
            >
              <span className="publish-plans-radio-dot" />
              <span>Bonificado</span>
              <span className="publish-plans-radio-subtitle">Gratis</span>
            </button>
            {branchFilter === 'todas' && (
              <p style={{ fontSize: 13, color: '#888' }}>Seleccioná una sucursal para ver los planes disponibles.</p>
            )}
            {branchFilter !== 'todas' && loadingPlans && (
              <p style={{ fontSize: 13, color: '#888' }}>Cargando planes...</p>
            )}
            {branchFilter !== 'todas' && !loadingPlans && branchPlans.length === 0 && (
              <p style={{ fontSize: 13, color: '#888' }}>No hay planes disponibles para esta sucursal.</p>                  
            )}
            {branchPlans.map((plan) => (
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
              {plansData?.map((plan: Plan, idx: number) => (
                <div key={plan.id ?? idx} className="publish-plans-card-item">
                  <div className="publish-plans-card-header">
                    <span className="publish-plans-card-label">{plan.plan_name}</span>
                    <div className="publish-plans-card-price">
                      <strong>{plan.currency} {plan.price}</strong>
                      <span>/mes</span>
                    </div>
                  </div>
                  <ul>                        
                    <li>
                      <img src={iconCheck} alt="" />
                      {plan.plan_description}
                    </li>
                    <li>
                      <img src={iconCheck} alt="" />
                      Límite de propiedades: {plan.property_limit}
                    </li>
                    <li>
                      <img src={iconCheck} alt="" />
                      Destaques: {plan.highlight_limit}
                    </li>
                  </ul>
                  <button type="button" className="publish-plans-buy" onClick={() => handleComprar(plan)}>
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
  );
}
