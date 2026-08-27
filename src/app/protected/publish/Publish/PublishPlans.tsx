'use client';

import { useState, useEffect, useRef } from 'react';
import './PublishPlans.scss';
import Select from '@/ui/Select/Select';
import { CreatePropertyDraft, OPERATION_TYPE_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, formatCurrency, formatNumbers } from '@/utils/utils';
import { Plan } from '@/types/plan';
import Button from '@/ui/Button/Button';

interface PublishPlansProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (descriptionData: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
  onSaveAndBack: (descriptionData: Partial<CreatePropertyDraft>) => void;
  onComprar: (plan: Plan, branchFilter: number | undefined) => void;
  onSaveAndExit: (descriptionData: Partial<CreatePropertyDraft>) => void;
  isEditMode?: boolean;
}

const iconChevron = '/icons/chevron-up.svg';
const iconCheck = '/icons/check-black.svg';


export default function PublishPlans({
  wizardData,
  updateWizardData,
  onComprar,
  onNext,
  onBack,
  onSaveAndBack,
  onSaveAndExit,
  isEditMode = false
}: PublishPlansProps) {
  const [user_id, setUser_id] = useState(wizardData.user_id || undefined);
  const [hired_plan_id, setHired_plan_id] = useState(wizardData.hired_plan_id || 1);
  const [visibility, setVisibility] = useState(wizardData.visibility || 0);  
  const [purchased_plan_id, setPurchased_plan_id] = useState(wizardData.purchased_plan_id || 0);
  const [branchFilter, setBranchFilter] = useState(wizardData.branch_id?.toString() || '');
  // Plan que la propiedad tenía originalmente (solo en edición). Se captura una sola
  // vez para que el +1 de disponibilidad siempre aplique al plan en uso original,
  // sin importar qué plan se seleccione luego en el formulario.
  const [originalPurchasedPlanId, setOriginalPurchasedPlanId] = useState(0);
  const originalPurchasedCaptured = useRef(false);
  const { data: sessionData } = useSession();

  useEffect(() => {
    if (isEditMode && !originalPurchasedCaptured.current && wizardData.purchased_plan_id) {
      setOriginalPurchasedPlanId(wizardData.purchased_plan_id);
      originalPurchasedCaptured.current = true;
    }
  }, [isEditMode, wizardData.purchased_plan_id]);

  const { data:plansData , isLoading, isError } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/plans/`),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const orgId = (sessionData?.user as any)?.organization?.id ?? null;
  const isRole2 = (sessionData?.user as any)?.role_id === 2;
  const isRole3 = (sessionData?.user as any)?.role_id === 3;
  const isRole1 = (sessionData?.user as any)?.role_id === 1;
  const loggedUserId = (sessionData?.user as any)?.id;

  const { data: fetchedBranches = [] } = useQuery<any[]>({
    queryKey: ['branches', orgId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/branches/organization/${orgId}`),
    enabled: !!orgId,
  });

  const branchOptions = fetchedBranches.map((b: any) => ({
    value: String(b.id),
    label: b.branch_name ?? b.name ?? String(b.id),
  }));

  // Auto-select when only one branch, or when role_id=2 is handled below
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

  // Auto-select branch for role_id=2 users
  useEffect(() => {
    if (isRole1 || !loggedUserId || rawUsers.length === 0 || (wizardData.branch_id !== 0 && wizardData.branch_id !== undefined)) return;
    const me = rawUsers.find((u: any) => String(u.id) === String(loggedUserId));
    const myBranch = Array.isArray(me?.branches) && me.branches.length > 0 ? String(me.branches[0].id) : null;
    if (myBranch) setBranchFilter(myBranch);
  }, [isRole2, isRole3, loggedUserId, rawUsers, wizardData.branch_id]);

  const { data: branchPlans = [], isLoading: loadingPlans } = useQuery<any[]>({
    queryKey: ['branch-plans', branchFilter],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/branch/${branchFilter}/availability`),
    enabled: !!branchFilter && !!orgId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: userPlans = [], isLoading: loadingUserPlans } = useQuery<any[]>({
    queryKey: ['user-plans', loggedUserId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/user/${loggedUserId}/availability`),
    enabled: !orgId && !!loggedUserId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // El plan que la propiedad ya tenía en uso (originalPurchasedPlanId) libera un cupo
  // al editar, por eso se le suma +1 directamente a su disponibilidad.
  const activePlans = (orgId ? branchPlans : userPlans).map((plan) =>
    plan.purchased_plan_id === originalPurchasedPlanId
      ? { ...plan, available: (plan.available ?? 0) + 1 }
      : plan
  );
  const loadingActivePlans = orgId ? loadingPlans : loadingUserPlans;

  const collaboratorOptions = rawUsers
    .filter((user: any) => {
      if (!branchFilter) return true;
      const userBranchId = String(user.branches.find((b: any) => String(b.id) === branchFilter)?.id ?? '');
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
      hired_plan_id,
      visibility,
      purchased_plan_id,
      branch_id: branchFilter ? Number.parseInt(branchFilter) : undefined
    });
  }, [user_id, hired_plan_id, visibility, purchased_plan_id, branchFilter, updateWizardData]);

  const continueDisabled = hired_plan_id === undefined || (orgId && !isRole3 && (branchFilter === '' || (fetchedBranches.length > 0 && user_id === undefined)));

  const handleBack = () => {
    if (isEditMode) {
      handleContinue('back');
      return;
    }
    onBack();
  };

  const handleContinue = (action: 'next' | 'exit' | 'back' = 'next') => {
    const plansUpdate = {
      user_id,
      hired_plan_id,
      visibility,
      purchased_plan_id,
      branch_id: branchFilter ? Number.parseInt(branchFilter) : undefined
    };
    if (action === 'exit') {
      onSaveAndExit({
        ...plansUpdate,
      });
    } else if (action === 'back') {
      onSaveAndBack({
        ...plansUpdate,
      });
    } else {
      onNext({
        ...plansUpdate,
      });
    }
  };

  const handleComprar = (plan: any) => {
    onComprar(plan, branchFilter ? Number.parseInt(branchFilter) : undefined);
  };
  
  return (
    <div className="publish-plans">
      <div className="publish-plans-inner">
        <div className="publish-plans-card">
          <div className="publish-plans-top">
            <div className="publish-plans-route">
              {wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} {wizardData.property_subtype ?  '- ' +PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}<br />{wizardData.street ? wizardData.street : 'Sin dirección'}
            </div>
            <button className="publish-plans-link" type="button" onClick={() => handleContinue('exit')}>
              Guardar y salir
            </button>
          </div>

          <div className="publish-plans-status">
            <span className="publish-plans-segment is-filled" />
            <span className="publish-plans-segment is-filled" />
            <span className="publish-plans-segment is-partial" />
          </div>

          <div className="publish-plans-section">
            <h1>Ya casi terminás</h1>

            {fetchedBranches.length > 0 && !isRole3 && <div className="publish-plans-block">
              <h2>Asigna este aviso a un colaborador</h2>
              <div className="publish-plans-field">
                <Select
                  label="Sucursal"
                  placeholder="Seleccionar sucursal"
                  value={branchFilter}
                  onChange={(value) => { setBranchFilter(value); setUser_id(undefined); setHired_plan_id(0); setVisibility(0); setPurchased_plan_id(0); }}
                  options={branchOptions}
                  disabled={isRole3 || isRole2}
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
                  className={`publish-plans-radio  ${hired_plan_id === 0 ? 'is-selected is-highlighted ' : ''}`}
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
                {activePlans.map((plan) => ( plan.available > 0 || plan.purchased_plan_id === originalPurchasedPlanId) && (
                  <button
                    key={plan.purchased_plan_id}
                    type="button"
                    className={`publish-plans-radio ${purchased_plan_id === plan.purchased_plan_id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setHired_plan_id(plan.plan_id);
                      setVisibility(plan.plan_visibility);
                      setPurchased_plan_id(plan.purchased_plan_id);
                    }}
                  >
                    <span className="publish-plans-radio-dot" />
                    <span className="publish-plans-radio-title">{plan.plan_name}</span>
                    <span className="publish-plans-radio-subtitle">Cantidad disponible: {plan.available ?? '-'}</span>                    
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
                      <Button label="Comprar" type="button" onClick={() => handleComprar(plan)} disabled={continueDisabled} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="publish-plans-footer">           
            <Button
              label="Volver"
              variant="back"
              onClick={handleBack}
              disabled={isEditMode ? continueDisabled : false}
              icon={<img src={iconChevron} alt="" />}
              iconPosition="left"
              className="publish-plans-back"
            />
            <Button
              variant="primary"
              onClick={() => handleContinue('next')}
              label="Continuar" // isRole3
              disabled={continueDisabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
