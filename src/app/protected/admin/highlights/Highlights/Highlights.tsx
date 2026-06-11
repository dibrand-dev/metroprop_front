'use client';

import { useState } from 'react';
import './Highlights.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import Select from '@/ui/Select/Select';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';

const iconArrowBack = '/icons/arrow.svg';

const highlightDescription =
  'Los productos se actualizarán automáticamente según las adquisiciones y usos.';

export default function Highlights() {
  const { data: sessionData } = useSession();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [branchFilter, setBranchFilter] = useState('todas');

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

  const { data: allBranchPlans = [], isLoading: loadingAllPlans } = useQuery<{ branchId: number; plans: any[] }[]>({
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
    staleTime: 5 * 60 * 1000,
  });

  const showAll = branchFilter === 'todas';
  const filteredPlans = allBranchPlans.find((e) => String(e.branchId) === branchFilter)?.plans ?? [];

  console.log("allBranchPlans", allBranchPlans)
  console.log("branchFilter", branchFilter)
  console.log("filteredPlans", filteredPlans)

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

          <div className="highlights-filter">
            <Select
              label="Sucursal"
              value={branchFilter}
              onChange={(value) => setBranchFilter(value)}
              options={branchOptions}
            />
          </div>

          <div className="highlights-list">
            {showAll ? (
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
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
  );
}
