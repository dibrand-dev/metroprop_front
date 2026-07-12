'use client';

import { useState } from 'react';
import './Highlights.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import Select from '@/ui/Select/Select';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';

const iconArrowBack = '/icons/arrow.svg';

const highlightDescription =
  'Los productos se actualizarán automáticamente según las adquisiciones y usos.';

export default function Highlights() {
  const { data: sessionData } = useSession();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [branchFilter, setBranchFilter] = useState('todas');
  const [planToCancel, setPlanToCancel] = useState<number | null>(null);

  const orgId = (sessionData?.user as any)?.organization?.id ?? null;
  const user_id = (sessionData?.user as any)?.id ?? null;

  const queryClient = useQueryClient();

  const cancelPlanMutation = useMutation({
    mutationFn: (purchasedPlanId: number) =>
      apiFetch(
        orgId
          ? `${API_BASE_URL}/plans/branch-plan/${purchasedPlanId}/cancel`
          : `${API_BASE_URL}/plans/user-plan/${purchasedPlanId}/cancel`,
        { method: 'PATCH' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-plans-all', 'user-plans'] });
      setPlanToCancel(null);
      if (orgId) refetchBranches();
      else refetchUserPlans();
    },
  });

  const { data: fetchedBranches = [] } = useQuery<any[]>({
    queryKey: ['branches', orgId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/branches/organization/${orgId}`),
    enabled: !!orgId,
  });

  // user plans are fetched only if user_id is available and orgId is not set  
  const { data: userPlans = [], isLoading: loadingUserPlans, refetch: refetchUserPlans } = useQuery<any[]>({
    queryKey: ['user-plans', user_id],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/user/${user_id}/availability`),
    enabled: !!user_id && !orgId,
  });

  const branches: any[] = Array.isArray(fetchedBranches) ? fetchedBranches : [];
  const branchOptions = [
    { value: 'todas', label: 'Todas' },
    ...branches.map((b: any) => ({ value: String(b.id), label: b.branch_name ?? b.name ?? String(b.id) })),
  ];

  const { data: allBranchPlans = [], isLoading: loadingAllPlans, refetch: refetchBranches } = useQuery<{ branchId: number; plans: any[] }[]>({
    queryKey: ['branch-plans-all', branches.map((b: any) => b.id).join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        branches.map(async (b: any) => ({
          branchId: b.id,
          plans: await apiFetch<any[]>(`${API_BASE_URL}/plans/branch/${b.id}/availability`),
        })),
      );
      return results;
    },
    enabled: branches.length > 0,
    staleTime: 0,
  });

  const showAll = branchFilter === 'todas';
  const filteredPlans = allBranchPlans.find((e) => String(e.branchId) === branchFilter)?.plans ?? [];

  return (
      <div className={`highlights-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="highlights-mobile-header">
          <button
            className="highlights-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Destaques</span>
          </button>
        </div>

        <div className="highlights-content">
          <div className="highlights-header">            
            <h1>Destaques</h1>
            <h2>Productos disponibles</h2>
            <p>{highlightDescription}</p>
          </div>

          {orgId && (
            <div className="highlights-filter">
              <Select
                label="Sucursal"
                value={branchFilter}
                onChange={(value) => setBranchFilter(value)}
                options={branchOptions}
              />
            </div>
          )}

          <div className="highlights-list">
            {!orgId ? (
              <div className="highlights-card">
                <div className="highlights-table">
                  <div className="highlights-row highlights-row-header">
                    <span>Productos</span>
                    <span>Contratados</span>
                    <span>Usados</span>
                    <span>Disponibles</span>
                    <span>Fecha de contratación</span>
                    <span>Fecha de finalización</span>
                    <span>Acciones</span>
                  </div>
                  {loadingUserPlans && (
                    <div className="highlights-row"><span>Cargando...</span></div>
                  )}
                  {!loadingUserPlans && userPlans.length === 0 && (
                    <div className="highlights-row"><span>Sin productos disponibles</span></div>
                  )}
                  {userPlans.map((plan: any, idx: number) => (
                    <div key={plan.purchased_plan_id ?? idx} className="highlights-row">
                      <span>{plan.plan_name}</span>
                      <span>{plan.highlight_limit ?? '-'}</span>
                      <span>{plan.used ?? '-'}</span>
                      <span>{plan.available ?? '-'}</span>
                      <span>{plan.start_date && !isNaN(new Date(plan.start_date).getTime()) ? new Date(plan.start_date).toLocaleDateString("es-ES") : '-'}</span>
                      <span>{plan.end_date && !isNaN(new Date(plan.end_date).getTime()) ?  new Date(plan.end_date).toLocaleDateString("es-ES") : '-'}</span>
                      <span>{(plan.end_date === undefined || plan.end_date == null || plan.end_date === '') && (
                        <button
                          type="button"
                          className="highlights-cancel-button"
                          onClick={() => setPlanToCancel(plan.purchased_plan_id)}
                          disabled={cancelPlanMutation.isPending || plan.purchased_plan_id == null}
                        >
                          Dar de baja
                        </button>
                      )}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : showAll ? (
              <>
                {loadingAllPlans && (
                  <div className="highlights-card"><div className="highlights-row"><span>Cargando...</span></div></div>
                )}
                {!loadingAllPlans && allBranchPlans.map(({ branchId, plans: branchPlans }) => {
                  const branch = branches.find((b: any) => b.id === branchId);
                  const branchName = branch?.branch_name ?? branch?.name ?? String(branchId);
                  return (
                    <div key={branchId} className="highlights-card">
                      <h3>{branchName}</h3>
                      <div className="highlights-table">
                        <div className="highlights-row highlights-row-header">
                          <span>Productos</span>
                          <span>Contratados</span>
                          <span>Usados</span>
                          <span>Disponibles</span>
                          <span>Fecha de contratación</span>
                          <span>Fecha de finalización</span>
                          <span>Acciones</span>
                        </div>
                        {branchPlans.length === 0 && (
                          <div className="highlights-row"><span>Sin productos disponibles</span></div>
                        )}
                        {branchPlans.map((plan: any, idx: number) => (
                          <div key={plan.purchased_plan_id ?? idx} className="highlights-row">
                            <span>{plan.plan_name}</span>
                            <span>{plan.highlight_limit ?? '-'}</span>
                            <span>{plan.used ?? '-'}</span>
                            <span>{plan.available ?? '-'}</span>
                            <span>{plan.start_date && !isNaN(new Date(plan.start_date).getTime()) ? new Date(plan.start_date).toLocaleDateString("es-ES") : '-'}</span>
                            <span>{plan.end_date && !isNaN(new Date(plan.end_date).getTime()) ? new Date(plan.end_date).toLocaleDateString("es-ES") : '-'}</span>                            
                            <span>{(plan.end_date === undefined || plan.end_date == null || plan.end_date === '') && (
                              <button
                                type="button"
                                className="highlights-cancel-button"
                                onClick={() => setPlanToCancel(plan.purchased_plan_id)}
                                disabled={cancelPlanMutation.isPending || plan.purchased_plan_id == null}
                              >
                                Dar de baja
                              </button>
                            )}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
            <div className="highlights-card">
              <h3>{branchOptions.find(o => o.value === branchFilter)?.label}</h3>
              <div className="highlights-table">
                <div className="highlights-row highlights-row-header">
                  <span>Productos</span>
                  <span>Contratados</span>
                  <span>Usados</span>
                  <span>Disponibles</span>
                  <span>Fecha de contratación</span>
                  <span>Fecha de finalización</span>
                  <span>Acciones</span>
                </div>
                {loadingAllPlans && (
                  <div className="highlights-row"><span>Cargando...</span></div>
                )}
                {!loadingAllPlans && filteredPlans.length === 0 && (
                  <div className="highlights-row"><span>Sin productos disponibles</span></div>
                )}
                {filteredPlans.map((plan: any, idx: number) => (
                  <div key={plan.purchased_plan_id ?? idx} className="highlights-row">
                    <span>{plan.plan_name}</span>
                    <span>{plan.highlight_limit ?? '-'}</span>
                    <span>{plan.used ?? '-'}</span>
                    <span>{plan.available ?? '-'}</span>
                    <span>{plan.start_date && !isNaN(new Date(plan.start_date).getTime()) ? new Date(plan.start_date).toLocaleDateString("es-ES") : '-'}</span>
                    <span>{plan.end_date && !isNaN(new Date(plan.end_date).getTime()) ? new Date(plan.end_date).toLocaleDateString("es-ES") : '-'}</span>                            
                    <span>{(plan.end_date === undefined || plan.end_date == null || plan.end_date === '') && (
                      <button
                        type="button"
                        className="highlights-cancel-button"
                        onClick={() => setPlanToCancel(plan.purchased_plan_id)}
                        disabled={cancelPlanMutation.isPending || plan.purchased_plan_id == null}
                      >
                        Dar de baja
                      </button>
                    )}</span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>

        {planToCancel != null && (
          <AreYouSureModal
            title="Dar de baja plan"
            text="¿Estás seguro de que deseas dar de baja este plan? Esta acción no se puede deshacer."
            acceptText="Dar de baja"
            cancelText="Cancelar"
            onAccept={() => cancelPlanMutation.mutate(planToCancel)}
            onCancel={() => setPlanToCancel(null)}
          />
        )}
      </div>
  );
}
