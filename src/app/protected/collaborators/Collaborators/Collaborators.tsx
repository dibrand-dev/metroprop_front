'use client';

import { useEffect, useState } from 'react';
import './Collaborators.scss';
import { useRouter } from 'next/navigation';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession } from 'next-auth/react';
import Select from '@/ui/Select/Select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import InputField from '@/ui/InputField/InputField';
import InputField2 from '@/ui/InputField2/InputField2';

const iconArrowBack = '/icons/arrow.svg';
const iconLock = '/icons/lock.svg';
const iconEdit = '/icons/pencil.svg';
const iconTrash = '/icons/trash.svg';

const collaboratorsDescription =
  'Aca podes editar los datos de tus colaboradores, activarlos y /o agregar nuevos.';

type CollaboratorAction = 'lock' | 'edit' | 'delete';

const actionIcons: Record<CollaboratorAction, { src: string; label: string }> = {
  lock: { src: iconLock, label: 'Bloquear colaborador' },
  edit: { src: iconEdit, label: 'Editar colaborador' },
  delete: { src: iconTrash, label: 'Eliminar colaborador' },
};

interface CollaboratorItem {
  id: number;
  name: string;
  email: string;
  branchName: string;
  branches: Array<{ id: string; name: string }>;
  role_id: number | null;
  actions: CollaboratorAction[];
}

export default function Collaborators() {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [branchFilter, setBranchFilter] = useState('todas');

  // Lock (change password) modal state
  const [lockModal, setLockModal] = useState<{ open: boolean; userId: number | null; userName: string }>({ open: false, userId: null, userName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; userId: number | null; userName: string }>({ open: false, userId: null, userName: '' });
  const [branches, setBranches] = useState<any[]>([]);
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

  const branchOptions = [
    { value: 'todas', label: 'Todas' },
    ...branches?.map((b: any) => ({ value: String(b.id), label: b.branch_name ?? b.name ?? String(b.id) })),
  ];

  const { data: usersData, isLoading } = useQuery<any>({
    queryKey: ['collaborators-users'],
    queryFn: () => apiFetch<any>(`${API_BASE_URL}/users`),
  });
  const rawData: any = usersData;
  const rawUsers: any[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const collaborators: CollaboratorItem[] = rawUsers.map((user: any) => ({
    id: user.id,
    name: user.name ?? user.first_name ?? '',
    email: user.email ?? '',
    branchName: user.branch?.branch_name ?? user.branch_name ?? '',
    branches: user.branches ?? [],
    role_id: user.role_id ?? null,
    actions: ['lock', 'edit', 'delete'] as CollaboratorAction[],
  })) ?? [];

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

  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      apiFetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, userId: null, userName: '' });
      queryClient.invalidateQueries({ queryKey: ['collaborators-users'] });
    },
  });

  const handleLockAccept = () => {
    if (!newPassword || newPassword.length < 6) { setPasswordError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Las contraseñas no coinciden'); return; }
    if (!lockModal.userId) return;
    changePasswordMutation.mutate({ user_id: lockModal.userId, newPassword });
  };

  const filteredCollaborators = branchFilter === 'todas'
    ? collaborators
    : collaborators.filter((c) => c.branches?.find((b) => String(b.id) === branchFilter));

  const handleEdit = (id: string) => {
    const loggedInUserId = String((sessionData?.user as any)?.id ?? '');
    if (loggedInUserId && id === loggedInUserId) {
      router.push('/protected/profile');
    } else {
      router.push(`/protected/collaboratorForm/${id}`);
    }
  };

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
            <span>Colaboradores</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div>
              <h1>Colaboradores</h1>
              <p>{collaboratorsDescription}</p>
            </div>
            <button className="collaborators-add-button" type="button" onClick={() => router.push('/protected/collaboratorForm')} >
              Agregar colaborador
            </button>
          </div>

          <div className="collaborators-filter">
            <Select
              label="Sucursal"
              placeholder="Todas"
              value={branchFilter}
              onChange={(value) => setBranchFilter(value)}
              options={branchOptions}
            />
          </div>

          <div className="collaborators-list">
            {filteredCollaborators.map((collaborator) => (
              <div key={collaborator.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  <p className="collaborators-card-title">
                    {collaborator.name} - {collaborator.email}
                  </p>
                  <p className="collaborators-card-subtitle">
                    Sucursal: {collaborator.branches?.map(b => b.branch_name).join(', ') || '-'}
                  </p>
                </div>
                <div className="collaborators-card-actions">
                  <span className="collaborators-role-chip">Role {collaborator.role_id ?? '-'}</span>
                  <div className="collaborators-card-tools">
                    {collaborator.actions.map((action) => (
                      <button
                        key={action}
                        className="collaborators-action-button"
                        type="button"
                        aria-label={actionIcons[action].label}
                        onClick={() => {
                          if (action === 'edit') handleEdit(String(collaborator.id));
                          if (action === 'lock') { setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setLockModal({ open: true, userId: collaborator.id, userName: collaborator.name }); }
                          if (action === 'delete') setDeleteModal({ open: true, userId: collaborator.id, userName: collaborator.name });
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

        <div className="collaborators-mobile-footer">
          <button className="collaborators-add-button" type="button">
            Agregar colaborador
          </button>
        </div>
      </div>

      {lockModal.open && (
        <AreYouSureModal
          title="Cambiar contraseña"
          onCancel={() => { setLockModal({ open: false, userId: null, userName: '' }); setPasswordError(''); }}
          onAccept={handleLockAccept}
          acceptText={changePasswordMutation.isPending ? 'Guardando...' : 'Aceptar'}
          text={<div className="reset-collaborator-password" >          
            <h2>{`De ${lockModal.userName}`}</h2>
            {passwordSuccess ? (
              <p style={{ color: '#2e7d32', fontWeight: 600, textAlign: 'center', padding: '16px 0' }}>
                ¡Contraseña cambiada correctamente!
              </p>
            ) : (
            <div className="reset-modal-inputs-container">
              <InputField2
                label="Nueva contraseña"
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
              />
              <p className="form-help-text">Usa de 6 a 10 caracteres</p>
              <InputField2
                label="Repetir contraseña"
                type="password"
                placeholder="Repetir contraseña"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
              />
              {passwordError && <p style={{ color: '#d32f2f', fontSize: 13 }}>{passwordError}</p>}
            </div>
            )}
          </div>
          }
        />
      )}

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
