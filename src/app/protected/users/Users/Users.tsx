'use client';

import { useState } from 'react';
import './Users.scss';
import { useRouter } from 'next/navigation';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';

const iconArrowBack = '/icons/arrow.svg';
const iconLock = '/icons/lock.svg';
//const iconEdit = '/icons/pencil.svg';
const iconTrash = '/icons/trash.svg';

const usersDescription =
  'Aca podes ver la lista deusuarios, activarlos y /o eliminarlos.';

type UserAction = 'lock' | 'edit' | 'delete';

const actionIcons: Record<UserAction, { src: string; label: string }> = {
  lock: { src: iconLock, label: 'Bloquear usuario' },
  // edit: { src: iconEdit, label: 'Editar usuario' },
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

export default function Users() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [branchFilter, setBranchFilter] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 20;
/*
  // Lock (change password) modal state
  const [lockModal, setLockModal] = useState<{ open: boolean; userId: number | null; userName: string }>({ open: false, userId: null, userName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
*/
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId: number | null; userName: string }>({ open: false, userId: null, userName: '' });
/*
  const changePasswordMutation = useMutation({
    mutationFn: (vars: { user_id: number; newPassword: string }) =>
      apiFetch(`${API_BASE_URL}/users/update-password`, { method: 'POST', body: vars }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError('');
      setTimeout(() => {
        setLockModal({ open: false, userId: null, userName: '' });
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess(false);
      }, 3000);
    },
  });
*/
  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      apiFetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, userId: null, userName: '' });
      queryClient.invalidateQueries({ queryKey: ['collaborators-users'] });
    },
  });
/*
  const handleLockAccept = () => {
    if (!newPassword || newPassword.length < 6) { setPasswordError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Las contraseñas no coinciden'); return; }
    if (!lockModal.userId) return;
    changePasswordMutation.mutate({ user_id: lockModal.userId, newPassword });
  };

  const branches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
  const branchOptions = [
    { value: 'todas', label: 'Todas' },
    ...branches.map((b: any) => ({ value: String(b.id), label: b.branch_name ?? b.name ?? String(b.id) })),
  ];
*/
  const { data: usersData, isLoading } = useQuery<any>({
    queryKey: ['collaborators-users', currentPage],
    queryFn: () => apiFetch<any>(`${API_BASE_URL}/users?offset=${currentPage}&limit=${LIMIT}`),
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

  const filteredUsers = branchFilter === 'todas'
    ? users
    : users.filter((u) => u.branchId === branchFilter);
/*
  const handleEdit = (id: string) => {
    const loggedInUserId = String((sessionData?.user as any)?.id ?? '');
    if (loggedInUserId && id === loggedInUserId) {
      router.push('/protected/profile');
    } else {
      router.push(`/protected/userForm/${id}`);
    }
  };
*/
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
            <span>Usuarios</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div>
              <h1>Usuarios</h1>
              <p>{usersDescription}</p>
            </div>
            {/*<button className="collaborators-add-button" type="button" onClick={() => router.push('/protected/userForm')} >
              Agregar usuario
            </button>*/}
          </div>

          <div className="collaborators-filter">
            
          </div>

          <div className="collaborators-list">
            {filteredUsers.map((user) => (
              <div key={user.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  <p className="collaborators-card-title">
                    {user.name} - {user.email}
                  </p>
                  {user.branchName && <p className="collaborators-card-subtitle">
                    Sucursal: {user.branchName}
                  </p>}
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
    </div>
  );
}
