'use client';

import { useState } from 'react';
import './Highlights.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
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
  const [showMenu, setShowMenu] = useState(false);
  const [branchFilter, setBranchFilter] = useState('todas');

  const branches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
  const branchOptions = [
    { value: 'todas', label: 'Todas' },
    ...branches.map((b: any) => ({ value: String(b.id), label: b.branch_name ?? b.name ?? String(b.id) })),
  ];

  const { data: plans = [], isLoading: loadingPlans } = useQuery<any[]>({
    queryKey: ['branch-plans', branchFilter],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/branch/${branchFilter}`),
    enabled: branchFilter !== 'todas',
  });

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
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
              placeholder="Todas"
              value={branchFilter}
              onChange={(value) => setBranchFilter(value)}
              options={branchOptions}
            />
          </div>

          {branchFilter !== 'todas' && (
            <div className="highlights-list">
              <div className="highlights-card">
                <h3>{branchOptions.find(o => o.value === branchFilter)?.label}</h3>
                <div className="highlights-table">
                  <div className="highlights-row highlights-row-header">
                    <span>Productos</span>
                    <span>Comprados</span>
                    <span>Disponibles</span>
                    <span>Activos</span>
                  </div>
                  {loadingPlans && (
                    <div className="highlights-row"><span>Cargando...</span></div>
                  )}
                  {!loadingPlans && plans.length === 0 && (
                    <div className="highlights-row"><span>Sin productos disponibles</span></div>
                  )}
                  {plans.map((plan: any, idx: number) => (
                    <div key={plan.id ?? idx} className="highlights-row">
                      <span>{plan.name}</span>
                      <span>{plan.purchased ?? plan.total ?? '-'}</span>
                      <span>{plan.available ?? plan.remaining ?? '-'}</span>
                      <span>{plan.active ?? plan.used ?? '-'}</span>
                    </div>
                  ))}
                </div>
                <div className="highlights-progress">
                  <div className="highlights-progress-bar" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
