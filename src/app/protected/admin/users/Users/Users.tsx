'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Users.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import InputField2 from '@/ui/InputField2/InputField2';
import { ROLE } from '@/types/propiedad';

const iconArrowBack = '/icons/arrow.svg';
const iconLock = '/icons/lock.svg';
const iconTrash = '/icons/trash.svg';

const usersDescription = 'Aca podes ver la lista de usuarios, activarlos y /o eliminarlos.';

type UserAction = 'lock' | 'delete' | 'edit';

const actionIcons: Record<UserAction, { src: string; label: string }> = {
  lock: { src: iconLock, label: 'Bloquear usuario' },  
  delete: { src: iconTrash, label: 'Eliminar usuario' },
  edit: { src: '/icons/pencil.svg', label: 'Editar usuario' },
};

interface UserItem {
  id: number;
  name: string;
  email: string;
  branchName: string;
  branchId: string;
  role_id: number | null;
  actions: UserAction[];
}
const LIMIT = 20;
export default function Users() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [currentPage, setCurrentPage] = useState(0);  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId: number | null; userName: string; is_delete: boolean; status: string | null }>({ open: false, userId: null, userName: '', is_delete: true, status: null });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      apiFetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, userId: null, userName: '', is_delete: true, status: null });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
  
  const enableMutation = useMutation({
    mutationFn: (userId: number) =>
      apiFetch(`${API_BASE_URL}/users/${userId}/enable`, { method: 'POST' }),
    onSuccess: () => {
      setDeleteModal({ open: false, userId: null, userName: '', is_delete: true, status: null });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: (userId: number) =>
      apiFetch(`${API_BASE_URL}/users/${userId}/disable`, { method: 'POST' }),
    onSuccess: () => {
      setDeleteModal({ open: false, userId: null, userName: '', is_delete: true, status: null });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
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

  const { data: usersData } = useQuery<any>({
    queryKey: ['all-users', currentPage, searchId],
    queryFn: async () => {
      if (searchId !== null) {
        return apiFetch<any>(`${API_BASE_URL}/users/?searchCriteria=${searchId}`);
      }
      return apiFetch(`${API_BASE_URL}/users`, {
        params: { offset: currentPage, limit: LIMIT },
      });
    },
    staleTime: 5 * 60 * 1000,
  });
  const rawData: any = usersData;
  const rawUsers: any[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const total: number = rawData?.total ?? rawUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const users: UserItem[] = rawUsers.map((user: any) => ({
    id: user.id,
    name: user.name ?? user.first_name ?? '',
    email: user.email ?? '',
    branchName: user.branch?.branch_name ?? user.branch_name ?? '',
    branchId: String(user.branch_id ?? user.branch?.id ?? ''),
    role_id: user.role_id ?? null,
    status: user.status ?? false,
    actions: ['delete', 'edit', 'lock'] as UserAction[],
  })) ?? [];

  const handleEdit = (id: string) => {
    router.push('/protected/admin/users/' + id);
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
            <span>Usuarios</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div className="collaborators-header-container">
              <h1>Usuarios</h1>
              <p>{usersDescription}</p>
            </div>
          </div>

          <div className="collaborators-filter">
            <InputField2
              placeholder="ID / nombre"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
              iconPosition="right"
              onIconClick={handleSearchById}
            />
          </div>

          <div>
            {total > 0 && <span>{total} Usuario{total > 1 ? 's' : ''} registrado{total > 1 ? 's' : ''}</span>}
          </div>

          <div className="collaborators-list">
            {users.map((user) => (
              <div key={user.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  <p className="collaborators-card-title">
                    {user.name} - {user.email}
                  </p>
                  <p className="collaborators-card-subtitle">
                    ID: {user.id}
                  </p>
                </div>
                <div className="collaborators-card-actions">
                  <span className="collaborators-role-chip">{user.status ? 'Habilitado' : 'Deshabilitado'}</span>
                  <span className="collaborators-role-chip">{user.role_id ? ROLE[user.role_id] : '-'}</span>
                  <div className="collaborators-card-tools">
                    {user.actions.map((action) => (
                      <button
                        key={action}
                        className="collaborators-action-button"
                        type="button"
                        aria-label={actionIcons[action].label}
                        onClick={() => {
                          if (action === 'edit') handleEdit(String(user.id));
                          if (action === 'lock')  setDeleteModal({ open: true, userId: user.id, userName: user.name, is_delete: false, status: user.status });
                          if (action === 'delete') setDeleteModal({ open: true, userId: user.id, userName: user.name, is_delete: true, status: null });
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
          title={deleteModal.is_delete ? "Eliminar Colaborador" : `${deleteModal.status ? "Bloquear" : "Desbloquear"} Usuario`}
          subTitle={`¿Está seguro que desea ${deleteModal.is_delete ? "eliminar" : deleteModal.status ? "bloquear" : "desbloquear"} a ${deleteModal.userName}?`}
          text={`${deleteModal.status ? "Todos las publicaciones del vendedor serán bloqueadas." : "Todos las publicaciones del vendedor estarán disponibles."}`}
          icon={deleteModal.is_delete ? "/icons/trash.svg" : "/icons/lock.svg"}
          onCancel={() => setDeleteModal({ open: false, userId: null, userName: '', is_delete: true, status: null })}
          onAccept={() => {
            if (!deleteModal.userId) {
              return;
            }
            if (deleteModal.is_delete) {
              deleteMutation.mutate(deleteModal.userId); 
            } else {
              if (deleteModal.status) {
                disableMutation.mutate(deleteModal.userId!);
              } else {
                enableMutation.mutate(deleteModal.userId!);
              }
            }
          }}
          acceptText={deleteMutation.isPending ? (deleteModal.is_delete ? 'Eliminando...' : 'Bloqueando...') : 'Aceptar'}
        />
      )}
    </>
  );
}
