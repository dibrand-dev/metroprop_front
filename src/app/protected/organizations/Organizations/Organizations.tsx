'use client';

import { useState } from 'react';
import './Organizations.scss';
import { useRouter } from 'next/navigation';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import InputField2 from '@/ui/InputField2/InputField2';

const iconArrowBack = '/icons/arrow.svg';
const iconLock = '/icons/lock.svg';
//const iconEdit = '/icons/pencil.svg';
const iconTrash = '/icons/trash.svg';

const organizationsDescription =
  'Aca podes ver la lista de organizaciones, activarlas y /o eliminarlas.';

type OrganizationAction = 'lock' | 'edit' | 'delete';

const actionIcons: Record<OrganizationAction, { src: string; label: string }> = {
  lock: { src: iconLock, label: 'Bloquear organización' },
  // edit: { src: iconEdit, label: 'Editar organización' },
  delete: { src: iconTrash, label: 'Eliminar organización' },
};

interface OrganizationItem {
  id: number;
  company_name: string;
  email: string;
  branchName: string;
  branchId: string;
  role_id: number | null;
  cuit: string | null;
  actions: OrganizationAction[];
}
const LIMIT = 20;
export default function Organizations() {
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; organizationId: number | null; organizationName: string }>({ open: false, organizationId: null, organizationName: '' });

  const deleteMutation = useMutation({
    mutationFn: (organizationId: number) =>
      apiFetch(`${API_BASE_URL}/organizations/${organizationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, organizationId: null, organizationName: '' });
      queryClient.invalidateQueries({ queryKey: ['all-organizations'] });
    },
  });
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() === '') {
      setSearchId(null);
    }
  };

  const handleSearchById = () => {
    const trimmed = searchQuery.trim();
    const num = Number(trimmed);
    if (trimmed && !Number.isNaN(num) && num > 0) {
      setSearchId(num);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchById();
  };

  const { data: organizationsData } = useQuery<any>({
    queryKey: ['all-organizations', currentPage, searchId],
    queryFn: async () => {
      if (searchId !== null) {
        const organization: OrganizationItem = await apiFetch<any>(`${API_BASE_URL}/organizations/${searchId}`);
        return [organization];
      }
      return apiFetch(`${API_BASE_URL}/organizations`, {
        params: { offset: currentPage, limit: LIMIT },
      });
    },
    staleTime: 5 * 60 * 1000,
  });


  const rawData: any = organizationsData;
  const rawOrganizations: any[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const total: number = rawData?.total ?? rawOrganizations.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const organizations: OrganizationItem[] = rawOrganizations.map((organization: any) => ({
    id: organization.id,
    company_name: organization.company_name ?? organization.name ?? '',
    email: organization.email ?? '',
    branchName: organization.branch?.branch_name ?? organization.branch_name ?? '',
    branchId: String(organization.branch_id ?? organization.branch?.id ?? ''),
    role_id: organization.role_id ?? null,
    cuit: organization.cuit ?? null,
    actions: ['delete'] as OrganizationAction[],
  })) ?? [];

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`collaborators-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="collaborators-mobile-header">
          <button
            className="collaborators-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Organizaciones</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div>
              <h1>Organizaciones</h1>
              <p>{organizationsDescription}</p>
            </div>
          </div>

          <div className="collaborators-filter">
            <InputField2
              placeholder="ID"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
              iconPosition="right"
              onIconClick={handleSearchById}
            />
          </div>

          <div className="collaborators-list">
            {organizations.map((organization) => (
              <div key={organization.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  <p className="collaborators-card-title">
                    {organization.company_name} - {organization.email}
                  </p>
                  <p className="collaborators-card-subtitle">
                    ID: {organization.id}
                  </p>
                </div>
                <div className="collaborators-card-actions">
                  <span className="collaborators-role-chip">CUIT {organization.cuit ?? '-'}</span>
                  <div className="collaborators-card-tools">
                    {organization.actions.map((action) => (
                      <button
                        key={action}
                        className="collaborators-action-button"
                        type="button"
                        aria-label={actionIcons[action].label}
                        onClick={() => {
                          // if (action === 'edit') handleEdit(String(organization.id));
                          // if (action === 'lock') { setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setLockModal({ open: true, userId: organization.id, userName: organization.company_name }); }
                          if (action === 'delete') setDeleteModal({ open: true, organizationId: organization.id, organizationName: organization.company_name });
                        }}
                      >
                        <img src={actionIcons[action].src} alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => { setCurrentPage(page); }}
        />

        <div className="collaborators-mobile-footer">
          {/*<button className="collaborators-add-button" type="button">
            Agregar colaborador
          </button>*/}
        </div>
      </div>


      {deleteModal.open && (
        <AreYouSureModal
          title="Eliminar Organización"
          subTitle={`¿Está seguro que desea eliminar a ${deleteModal.organizationName}?`}
          text="Todos los datos de la organización se eliminarán permanentemente."
          icon="/icons/trash.svg"
          onCancel={() => setDeleteModal({ open: false, organizationId: null, organizationName: '' })}
          onAccept={() => { if (deleteModal.organizationId) deleteMutation.mutate(deleteModal.organizationId); }}
          acceptText={deleteMutation.isPending ? 'Eliminando...' : 'Aceptar'}
        />
      )}
    </div>
  );
}
