'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Branches.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/utils/utils';
import Button from '@/ui/Button/Button';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';

const iconArrowBack = '/icons/arrow.svg';
const iconEditPencil = '/icons/pencil.svg';

const branchDescription =
  'Acá podes editar los datos de tus sucursales, activarlas y /o desactivarlas y agregar nuevas';

export default function Branches() {
  const { data: sessionData } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const router = useRouter();

  const orgId = (sessionData?.user as any)?.organization?.id ?? null;

  const { data: fetchedBranches } = useQuery({
    queryKey: ['branches', orgId],
    queryFn: async () => apiFetch(`${API_BASE_URL}/branches/organization/${orgId}`),
    enabled: !!orgId,
  });

  useEffect(() => {
    if (Array.isArray(fetchedBranches)) {
      setBranches(fetchedBranches);
    }
  }, [fetchedBranches]);

  const handleToggle = async (id: string, nextValue: boolean) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === id ? { ...branch, active: nextValue } : branch
      )
    );
    try {
      await apiFetch(`${API_BASE_URL}/branches/${id}`, {
        method: 'PUT',
        body: { is_active: nextValue },
      });
    } catch {
      // revert on error
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === id ? { ...branch, active: !nextValue } : branch
        )
      );
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/protected/branchForm/${id}`);
  };

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`branches-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="branches-mobile-header">
          <button
            className="branches-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Sucursales</span>
          </button>
        </div>

        <div className="branches-content">
          <div className="branches-header">
            <div className="branches-header-container">
              <h1>Sucursales</h1>
              <p>{branchDescription}</p>
            </div>
            <Button  onClick={() => router.push('/protected/branchForm')} label="Agregar sucursal" />
          </div>

          <div className="branches-list">
            {branches.map((branch) => (
              <div key={branch.id} className="branches-card">
                <div className="branches-card-info">
                  <p className="branches-card-title">
                    {branch.branch_name} - Sucursal: {branch.id} - Tel: {branch.phone}
                  </p>
                  <div className="branches-card-meta">
                    <span>{branch.listings}</span>
                    {branch.users && <span>Colaboradores: {branch.users.map((user: any) => user.name).join(', ')}</span>}                    
                  </div>
                </div>
                <div className="branches-card-actions">
                  <div className="branches-card-status">
                    <SwitchToggle
                      checked={branch.active}
                      onChange={(nextValue) => handleToggle(branch.id, nextValue)}
                      ariaLabel={`Cambiar estado de ${branch.name}`}
                    />
                    <span className="branches-status-chip">Activa</span>
                  </div>
                  <button
                    className="branches-card-edit"
                    type="button"
                    aria-label="Editar sucursal"
                    onClick={() => handleEdit(branch.id)}
                  >
                    <img src={iconEditPencil} alt="" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="branches-mobile-footer">
          <button className="branches-add-button" type="button" onClick={() => router.push('/protected/branchForm')}>
            Agregar sucursal
          </button>
        </div>
      </div>
    </div>
  );
}
