'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Plans.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { API_BASE_URL } from '@/utils/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import { apiFetch } from '@/lib/apiFetch';

const iconArrowBack = '/icons/arrow.svg';
const iconRefresh = '/icons/refresh.svg';
const iconLock = '/icons/lock.svg';
const iconTrash = '/icons/trash.svg';
const iconCheck = '/icons/check_black.svg';
const iconPencil = '/icons/pencil.svg';

type ConfirmAction = { type: 'refresh' | 'edit' | 'disable' | 'enable' | 'delete'; id: number } | null;

export default function Plans() {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const router = useRouter();
  const [refreshCredentials, setRefreshCredentials] = useState<{ app_key: string; app_secret: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: plansData, isLoading, isError } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/plans/`),
    staleTime: 30_000,
  });

  const refreshMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/plans/${id}/refresh-access-key`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const disableMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/plans/${id}/disable`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const enableMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/plans/${id}/enable`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/plans/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const desHabilitar = (id: number) => setConfirmAction({ type: 'disable', id });
  const habilitar = (id: number) => setConfirmAction({ type: 'enable', id });
  const eliminar = (id: number) => setConfirmAction({ type: 'delete', id });

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    setConfirmAction(null);
    if (type === 'refresh') {
      const response = await refreshMutation.mutateAsync(id);
      setRefreshCredentials({ app_key: response.data.app_key, app_secret: response.data.app_secret });
    } else if (type === 'disable') {
      disableMutation.mutate(id);
    } else if (type === 'enable') {
      enableMutation.mutate(id);
    } else if (type === 'delete') {
      deleteMutation.mutate(id);
    } else if (type === 'edit') {
      // Handle edit action here
    }
  };

  const confirmMessages: Record<string, { title: string; text: string; icon: string }> = {
    disable: { title: 'Deshabilitar Plan', text: '¿Estás seguro que desea deshabilitar el plan?', icon: iconLock },
    enable: { title: 'Habilitar Plan', text: '¿Estás seguro que desea habilitar el plan?', icon: iconCheck },
    delete: { title: 'Eliminar Plan', text: '¿Estás seguro que desea eliminar el plan?', icon: iconTrash },
  };

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error cargando los planes</div>;
  console.log("plansData", plansData)
  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`partners-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="partners-mobile-header">
          <button
            className="partners-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Planes</span>
          </button>
        </div>

        <div className="partners-content">
          <div className="partners-header">
            <div>
              <h1>Planes</h1>
              <p>Aca podes crear, eliminar, deshabilitar y actualizar los planes</p>
            </div>
            <button className="partners-add-button" type="button" onClick={() => router.push('/protected/planForm')}>
              Agregar plan
            </button>
          </div>

          <div className="partners-list">
            {plansData?.map((plan) => (
              <div key={plan.id} className="partners-card">
                <div className="partners-card-info">
                  <p className="partners-card-title">
                    {plan.plan_name ?? ''}
                  </p>
                  <p className="partners-card-subtitle">
                    {plan.plan_description ?? ''}
                  </p>
                </div>
                <div className="partners-card-actions">
                  <span className="partners-role-chip">{plan.is_active ? 'Habilitado' : 'Deshabilitado'}</span>                  
                  <div className="partners-card-tools">                                  
                    <button
                      className="partners-action-button"
                      type="button"
                      title="Editar plan"
                      aria-label="Editar plan"
                      onClick={() => router.push(`/protected/planForm/${plan.id}`)}
                    >
                      <img src={iconPencil} alt="Editar plan" />
                    </button>
                    <button
                      className="partners-action-button"
                      type="button"
                      title={plan.is_active ? "Deshabilitar plan" : "Habilitar plan"}
                      aria-label={plan.is_active ? "Deshabilitar plan" : "Habilitar plan"}
                      onClick={() => plan.is_active ? desHabilitar(plan.id) : habilitar(plan.id)}
                    >
                      <img src={plan.is_active ? iconLock : iconCheck} alt={plan.is_active ? "Deshabilitar plan" : "Habilitar plan"} />
                    </button>
                    <button
                      className="partners-action-button"
                      type="button"
                      title="Eliminar plan"
                      aria-label="Eliminar plan"
                      onClick={() => eliminar(plan.id)}
                    >
                      <img src={iconTrash} alt="Eliminar plan" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="partners-mobile-footer">
          <button className="partners-add-button" type="button" onClick={() => router.push('/protected/planForm')}>
            Agregar plan
          </button>
        </div>
      </div>

      {confirmAction && (
        <AreYouSureModal
          title={confirmMessages[confirmAction.type].title}
          text={confirmMessages[confirmAction.type].text}
          icon={confirmMessages[confirmAction.type].icon}
          onAccept={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {refreshCredentials && (
        <div className="are-you-sure-modal-container" onClick={() => setRefreshCredentials(null)}>
          <div className="are-you-sure-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content-container">
              <div className="modal-message">
                <p className="modal-message-text">
                  <strong>App Key:</strong> {refreshCredentials.app_key}
                </p>
                <p className="modal-message-text">
                  <strong>App Secret:</strong> {refreshCredentials.app_secret}
                </p>
              </div>
              <div className="are-you-sure-actions">
                <button
                  className="are-you-sure-btn are-you-sure-btn--accept"
                  type="button"
                  onClick={() => setRefreshCredentials(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
