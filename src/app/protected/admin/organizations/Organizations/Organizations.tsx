'use client';

import { useState, useEffect } from 'react';
import './Organizations.scss';
import { useRouter } from 'next/navigation';
import { useAdminMenu } from '../../AdminLayoutClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import InputField2 from '@/ui/InputField2/InputField2';

const iconArrowBack = '/icons/arrow.svg';
const iconLock = '/icons/lock.svg';
const iconTrash = '/icons/trash.svg';
const iconEdit = '/icons/pencil.svg';

const organizationsDescription =
  'Aca podes ver la lista de inmobiliarias, activarlas y /o eliminarlas.';

type OrganizationAction = 'lock' | 'edit' | 'delete';

const actionIcons: Record<OrganizationAction, { src: string; label: string }> = {
  lock: { src: iconLock, label: 'Bloquear organización' },
  edit: { src: iconEdit, label: 'Editar organización' },
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
  status: boolean;
}
const LIMIT = 20;
export default function Organizations() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<string | null>(null);
  const [totalOrganizations, setTotalOrganizations] = useState<number>(0);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; organizationId: number | null; organizationName: string; is_delete: boolean, status: boolean | null }>({ open: false, organizationId: null, organizationName: '', is_delete: true, status: null });

  const deleteMutation = useMutation({
    mutationFn: (organizationId: number) =>
      apiFetch(`${API_BASE_URL}/organizations/${organizationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, organizationId: null, organizationName: '', is_delete: true, status: null });
      queryClient.invalidateQueries({ queryKey: ['all-organizations'] });
    },
  });

  const enableMutation = useMutation({
    mutationFn: (organizationId: number) =>
      apiFetch(`${API_BASE_URL}/organizations/${organizationId}/enable`, { method: 'POST' }),
    onSuccess: () => {
      setDeleteModal({ open: false, organizationId: null, organizationName: '', is_delete: true, status: null });
      queryClient.invalidateQueries({ queryKey: ['all-organizations'] });
    },
  });

   const disableMutation = useMutation({
    mutationFn: (organizationId: number) =>
      apiFetch(`${API_BASE_URL}/organizations/${organizationId}/disable`, { method: 'POST' }),
    onSuccess: () => {
      setDeleteModal({ open: false, organizationId: null, organizationName: '', is_delete: true, status: null });
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
    setSearchId(trimmed);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchById();
  };

  const { data: organizationsData } = useQuery<any>({
    queryKey: ['all-organizations', currentPage, searchId],
    queryFn: async () => {
      if (searchId !== null) {
        return apiFetch<any>(`${API_BASE_URL}/organizations?searchCriteria=${searchId}`);
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
    status: organization.status ?? true,
    actions: ['delete', 'edit', 'lock'] as OrganizationAction[],
  })) ?? [];

  // Store the total count from the first call (when not searching)
  useEffect(() => {
    if (searchId === null && rawData?.total) {
      setTotalOrganizations(rawData.total);
    }
  }, [searchId, rawData?.total]);

  const handleEdit = (id: string) => {
    router.push('/protected/admin/organization/' + id);
  };

  return (
    <>
      <div className={`collaborators-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="collaborators-mobile-header">
          <button
            className="collaborators-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Inmobiliarias</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div className="collaborators-header-container">
              <h1>Inmobiliarias</h1>
              <p>{organizationsDescription}</p>
            </div>
          </div>

          <div className="collaborators-filter">
            <InputField2
              placeholder="ID / Nombre"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
              iconPosition="right"
              onIconClick={handleSearchById}
            />
          </div>
         
          <div>
            {totalOrganizations > 0 && <span>{totalOrganizations} Inmobiliarias registradas</span>}
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
                  <span className="collaborators-role-chip">{organization.status ? 'Activo' : 'Bloqueado'}</span>
                  <div className="collaborators-card-tools">
                    {organization.actions.map((action) => (
                      <button
                        key={action}
                        className="collaborators-action-button"
                        type="button"
                        aria-label={actionIcons[action].label}
                        onClick={() => {
                          if (action === 'edit') handleEdit(String(organization.id));
                          if (action === 'lock') setDeleteModal({ open: true, organizationId: organization.id, organizationName: organization.company_name, is_delete: false, status: organization.status }); // Reusing delete modal for lock action as well, adjust as needed
                          if (action === 'delete') setDeleteModal({ open: true, organizationId: organization.id, organizationName: organization.company_name, is_delete: true, status: null });
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
          title={deleteModal.is_delete ? "Eliminar Organización" : `${deleteModal.status ? "Bloquear" : "Desbloquear"} Organización`}
          subTitle={`¿Está seguro que desea ${deleteModal.is_delete ? "eliminar" : deleteModal.status ? "bloquear" : "desbloquear"} a ${deleteModal.organizationName}?`}
          text={deleteModal.is_delete ? "Todos los datos de la organización se eliminarán permanentemente." : deleteModal.status ? "La organización será bloqueada y no podrá acceder a sus datos." : "La organización será desbloqueada y podrá acceder a sus datos."}
          icon={deleteModal.is_delete ? "/icons/trash.svg" : "/icons/lock.svg"}
          onCancel={() => setDeleteModal({ open: false, organizationId: null, organizationName: '', is_delete: true, status: null })}
          onAccept={() => { 
            if (!deleteModal.organizationId) {
              return
            } 
            
            if (deleteModal.is_delete) {
              deleteMutation.mutate(deleteModal.organizationId); 
            } else {
              if (deleteModal.status) {
                disableMutation.mutate(deleteModal.organizationId!);
              } else {
                enableMutation.mutate(deleteModal.organizationId!);
              }
            }}
          }
          acceptText={deleteMutation.isPending ? 'Eliminando...' : 'Aceptar'}
        />
      )}
    </>
  );
}
