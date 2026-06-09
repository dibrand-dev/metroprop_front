'use client';

import { useState } from 'react';
import './Users.scss';
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

const usersDescription = 'Aca podes ver la lista de usuarios, activarlos y /o eliminarlos.';

type UserAction = 'lock' | 'delete';

const actionIcons: Record<UserAction, { src: string; label: string }> = {
  lock: { src: iconLock, label: 'Bloquear usuario' },  
  delete: { src: iconTrash, label: 'Eliminar usuario' },
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
  const { showMenu, setShowMenu } = useAdminMenu();
  const [currentPage, setCurrentPage] = useState(0);  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId: number | null; userName: string }>({ open: false, userId: null, userName: '' });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      apiFetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, userId: null, userName: '' });
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
    const num = Number(trimmed);
    if (trimmed && !Number.isNaN(num) && num > 0) {
      setSearchId(num);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchById();
  };
  const { data: usersData } = useQuery<any>({
    queryKey: ['all-users', currentPage, searchId],
    queryFn: async () => {
      if (searchId !== null) {
        const user: UserItem = await apiFetch<any>(`${API_BASE_URL}/users/${searchId}`);
        return [user];
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
    actions: [/*'lock', 'edit',*/ 'delete'] as UserAction[],
  })) ?? [];

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
            <div>
              <h1>Usuarios</h1>
              <p>{usersDescription}</p>
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
                  <span className="collaborators-role-chip">Role {user.role_id ?? '-'}</span>
                  <div className="collaborators-card-tools">
                    {user.actions.map((action) => (
                      <button
                        key={action}
                        className="collaborators-action-button"
                        type="button"
                        aria-label={actionIcons[action].label}
                        onClick={() => {
                          // if (action === 'edit') handleEdit(String(user.id));
                          // if (action === 'lock') { setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setLockModal({ open: true, userId: user.id, userName: user.name }); }
                          if (action === 'delete') setDeleteModal({ open: true, userId: user.id, userName: user.name });
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
          title="Eliminar Colaborador"
          subTitle={`¿Está seguro que desea eliminar a ${deleteModal.userName}?`}
          text="Todos las publicaciones del vendedor pasaran al administrador."
          icon="/icons/trash.svg"
          onCancel={() => setDeleteModal({ open: false, userId: null, userName: '' })}
          onAccept={() => { if (deleteModal.userId) deleteMutation.mutate(deleteModal.userId); }}
          acceptText={deleteMutation.isPending ? 'Eliminando...' : 'Aceptar'}
        />
      )}
    </>
  );
}
