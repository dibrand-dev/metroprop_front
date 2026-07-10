'use client';

import { useState, useEffect } from 'react';
import './PublishEmprendimientoPlan.scss';
import Select from '@/ui/Select/Select';
import { CreatePropertyDraft } from '@/types/propiedad';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, formatCurrency, formatNumbers } from '@/utils/utils';
import { Plan } from '@/types/plan';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';
import Button from '@/ui/Button/Button';

interface PublishPlansProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (descriptionData: Partial<CreatePropertyDraft>) => void;
  goToStep: (step: EmprendimientoStep) => void;
  onComprar: (plan: Plan, branchFilter: number) => void;
  onSaveAndExit: (descriptionData: Partial<CreatePropertyDraft>) => void;
}

const iconCheck = '/icons/check-black.svg';

export default function PublishPlansEmprendimiento({
  wizardData,
  updateWizardData,
  onComprar,
  onNext,
  onSaveAndExit,
  goToStep 
}: PublishPlansProps) {
  const [user_id, setUser_id] = useState(wizardData.user_id || undefined);
  const [hired_plan_id, setHired_plan_id] = useState(wizardData.hired_plan_id || 0);
  const [visibility, setVisibility] = useState(wizardData.visibility || 0);
  const [purchased_plan_id, setPurchased_plan_id] = useState(wizardData.purchased_plan_id || 0);
  const [branchFilter, setBranchFilter] = useState(wizardData.branch_id?.toString() || '');
  const { data: sessionData } = useSession();

  const { data:plansData , isLoading, isError } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/plans/`),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const orgId = (sessionData?.user as any)?.organization?.id ?? null;
  const isRole1 = (sessionData?.user as any)?.role_id === 1;
  const isRole2 = (sessionData?.user as any)?.role_id === 2;
  const isRole3 = (sessionData?.user as any)?.role_id === 3;
  const loggedUserId = (sessionData?.user as any)?.id;

  const { data: fetchedBranches = [] } = useQuery<any[]>({
    queryKey: ['branches', orgId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/branches/organization/${orgId}`),
    enabled: !!orgId || isRole3, // Fetch branches if user has an org or is role_id=3 (to find their branch)
  });

  const branchOptions = fetchedBranches.map((b: any) => ({
    value: String(b.id),
    label: b.branch_name ?? b.name ?? String(b.id),
  }));

  useEffect(() => {
    if (wizardData.branch_id && wizardData.branch_id !== 0 && wizardData.branch_id !== undefined) {
      setBranchFilter(wizardData.branch_id.toString());
      return; // Don't auto-select if we already have a branch in wizardData
    }
    
    if (!isRole3 && fetchedBranches.length === 1) {
      setBranchFilter(String(fetchedBranches[0].id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedBranches.length]);

  const { data: usersData } = useQuery<any>({
    queryKey: ['collaborators-users'],
    queryFn: () => apiFetch<any>(`${API_BASE_URL}/users`),
    enabled: !!orgId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const rawData: any = usersData;
  const rawUsers: any[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);

  // Auto-select branch for role_id=3 and 2 users
  useEffect(() => {
    if (isRole1 || !loggedUserId || rawUsers.length === 0 || (wizardData.branch_id !== 0 && wizardData.branch_id !== undefined)) return;
    const me = rawUsers.find((u: any) => String(u.id) === String(loggedUserId));
    const myBranch = Array.isArray(me?.branches) && me.branches.length > 0 ? String(me.branches[0].id) : null;
    if (myBranch) setBranchFilter(myBranch);
  }, [isRole3, isRole2, loggedUserId, rawUsers, wizardData.branch_id]);

  const { data: branchPlans = [], isLoading: loadingPlans } = useQuery<any[]>({
    queryKey: ['branch-plans', branchFilter],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/branch/${branchFilter}/availability`),
    enabled: !!branchFilter && !!orgId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: userPlans = [], isLoading: loadingUserPlans } = useQuery<any[]>({
    queryKey: ['user-plans', user_id],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/user/${user_id}/availability`),
    enabled: !!user_id && !orgId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const activePlans = orgId ? branchPlans : userPlans;
  const loadingActivePlans = orgId ? loadingPlans : loadingUserPlans;

  const collaboratorOptions = rawUsers
    .filter((user: any) => {
      if (!branchFilter) return true;
      const userBranchId = String(user.branches.find((b) => String(b.id) === branchFilter)?.id ?? '');
      return userBranchId === branchFilter?.toString();
    })
    .map((user: any) => ({
      value: String(user.id),
      label: user.name ?? user.first_name ?? user.email ?? String(user.id),
    }));

  // Update wizard data when plans data changes
  useEffect(() => {
    updateWizardData({
      user_id,
      hired_plan_id,
      visibility,
      purchased_plan_id,
      branch_id: branchFilter ? Number.parseInt(branchFilter) : undefined
    });
  }, [user_id, hired_plan_id, visibility, branchFilter, purchased_plan_id, updateWizardData]);

  const handleContinue = () => {
    onNext({
      user_id,
      visibility,
      purchased_plan_id,
      hired_plan_id,
      branch_id: Number.parseInt(branchFilter)
    });
  };

  const handleComprar = (plan: any) => {
    onComprar(plan, Number.parseInt(branchFilter));
  };

  return (
    <div className="publish-emprendimiento-vista-al-precio">
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

        {fetchedBranches.length > 0 && !isRole3 && <div className="publish-plans-block">
          {!isRole3 && <h2>Asigna este aviso a un colaborador</h2>}
          <div className="publish-plans-field">
            <Select
              label="Sucursal"
              placeholder="Seleccionar sucursal"
              value={branchFilter}
              onChange={(value) => { setBranchFilter(value); setUser_id(undefined); setHired_plan_id(0); setVisibility(0); setPurchased_plan_id(0); }}
              options={branchOptions}
              disabled={isRole2 || isRole3}
            />
          </div>
          {!isRole3 && (
            <div className="publish-plans-field">
              <Select
                label="Tus colaboradores"
                options={collaboratorOptions}
                value={user_id ? user_id.toString() : undefined}
                onChange={(value) => setUser_id(value ? parseInt(value) : undefined)}
                placeholder="Seleccionar colaborador"
                disabled={branchFilter === ''}
              />
            </div>
          )}
        </div>}

        <div className="publish-plans-block">
          <h2>Elegí el plan con el que vas a publicar</h2>
          <div className="publish-plans-group">
            <h3>Planes disponibles</h3>
            <button                    
              type="button"
              className={`publish-plans-radio ${hired_plan_id === 0 ? 'is-selected is-highlighted ' : ''}`}
              onClick={() => {
                setHired_plan_id(0);
                setVisibility(0);
                setPurchased_plan_id(0);
              }}
            >
              <span className="publish-plans-radio-dot" />
              <span className="publish-plans-radio-title">Gratis</span>
              <span className="publish-plans-radio-subtitle"></span>
            </button>  
            {!!orgId && branchFilter === '' && (
              <p style={{ fontSize: 13, color: '#888' }}>Seleccioná una sucursal para ver los planes disponibles.</p>
            )}
            {loadingActivePlans && (
              <p style={{ fontSize: 13, color: '#888' }}>Cargando planes...</p>
            )}
            {!loadingActivePlans && (orgId ? branchFilter !== '' : true) && activePlans.length === 0 && (
              <p style={{ fontSize: 13, color: '#888' }}>No hay planes disponibles.</p>
            )}
            {activePlans.map((plan) => (
              <button
                key={plan.purchased_plan_id}
                type="button"
                className={`publish-plans-radio ${purchased_plan_id === plan.purchased_plan_id ? 'is-selected is-highlighted' : ''}`}
                onClick={() => {
                  setHired_plan_id(plan.plan_id);
                  setPurchased_plan_id(plan.purchased_plan_id);
                  setVisibility(plan.plan_visibility);
                }}
              >
                <span className="publish-plans-radio-dot" />
                <span className="publish-plans-radio-title">{plan.plan_name}</span>
                <span className="publish-plans-radio-subtitle">Cantidad disponible: {plan.available}</span>                
              </button>
            ))}
          </div>

          <div className="publish-plans-group">
            <h3>Más planes para vos</h3>
            
            <div className="publish-plans-cards">
              {plansData?.map((plan: Plan, idx: number) => (
                <div key={plan.id ?? idx} className="publish-plans-card-item">
                  <div className="publish-plans-card-header">
                    <span className="publish-plans-card-label">{plan.plan_name}</span>
                    <div className="publish-plans-card-price">
                      <strong>{formatCurrency(plan.currency)} {formatNumbers(plan.price)}</strong>
                      <span>/mes</span>
                    </div>
                  </div>
                  <ul>                        
                    {plan.plan_description?.split('\n').map((line, index) => line && line.trim() !== '' && (
                      <li key={index}>
                        <img src={iconCheck} alt="" />
                        {line}
                      </li>
                    ))}
                    <li>
                      <img src={iconCheck} alt="" />
                      Nivel de prioridad: {plan.visibility}
                    </li>
                    <li>
                      <img src={iconCheck} alt="" />
                      Destaques: {plan.highlight_limit}
                    </li>
                  </ul>
                  <Button label="Comprar" type="button" onClick={() => handleComprar(plan)} disabled={hired_plan_id === undefined || (orgId && !isRole3 && (branchFilter === '' || (fetchedBranches.length > 0 && user_id === undefined)))} />
                </div>
              ))}
            </div>
          </div>
        </div>
         {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Guardar como borrador"
            variant="secondary"
            buttonType="2"
            onClick={() => onSaveAndExit(wizardData)}
            fullWidth={false}
            disabled={(wizardData.development_delivery_date?.trim() === '') || wizardData.development_type === null || wizardData.publication_title?.trim() === ''}
          />
          <Button
            label="Continuar"
            variant="primary"
            buttonType="2"
            onClick={handleContinue}
            fullWidth={false}
            disabled={hired_plan_id === undefined || (orgId && !isRole3 && (branchFilter === '' || (fetchedBranches.length > 0 && user_id === undefined)))}
          />
        </div>
      </div>
    </div>
  );
}
