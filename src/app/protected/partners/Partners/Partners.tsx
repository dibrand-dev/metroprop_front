'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Partners.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { API_BASE_URL } from '@/utils/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import { apiFetch } from '@/lib/apiFetch';

const iconArrowBack = '/icons/arrow.svg';
const iconRefresh = '/icons/refresh.svg';
const iconLock = '/icons/lock.svg';
const iconWhiteTrash = '/icons/whiteTrash.svg';
const iconTrash = '/icons/trash.svg';
const iconCheck = '/icons/check_black.svg';
const iconPencil = '/icons/pencil.svg';
const iconEye = '/icons/eye.svg';

type ConfirmAction = { type: 'refresh' | 'edit' | 'disable' | 'enable' | 'delete'; id: number } | null;

export default function Partners() {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const router = useRouter();
  const [viewCredentials, setViewCredentials] = useState<{ app_key: string; app_secret: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'app_key' | 'app_secret' | null>(null);
  const queryClient = useQueryClient();

  const { data: partnersData, isLoading, isError } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/partners`),
    staleTime: 30_000,
  });

  const refreshMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/partners/${id}/refresh-access-key`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });

  const disableMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/partners/${id}/disable`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });

  const enableMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/partners/${id}/enable`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/partners/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partners'] }),
  });

  const refresh = (id: number) => setConfirmAction({ type: 'refresh', id });  
  const desHabilitar = (id: number) => setConfirmAction({ type: 'disable', id });
  const habilitar = (id: number) => setConfirmAction({ type: 'enable', id });
  const eliminar = (id: number) => setConfirmAction({ type: 'delete', id });

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    setConfirmAction(null);
    if (type === 'refresh') {
      const response = await refreshMutation.mutateAsync(id);
      setViewCredentials({ app_key: response.data.app_key, app_secret: response.data.app_secret });
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

  const confirmMessages: Record<string, { title: string; text?: string; subTitle?: string; icon: string, iconBackgroundColor?: string }> = {
    refresh: { title: 'Refresh API Key', subTitle: '¿Estás seguro que desea refrescar la API key del partner?', icon: iconRefresh, iconBackgroundColor: '#FFD700' },
    disable: { title: 'Deshabilitar Partner', subTitle: '¿Estás seguro que desea deshabilitar el partner?', icon: iconLock, iconBackgroundColor: '#FFD700' },
    enable: { title: 'Habilitar Partner', subTitle: '¿Estás seguro que desea habilitar el partner?', icon: iconCheck, iconBackgroundColor: '#4DE04A' },
    delete: { title: 'Eliminar Partner', subTitle: '¿Estás seguro que desea eliminar el partner?', icon: iconWhiteTrash, iconBackgroundColor: '#E84545' },
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading partners</div>;

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
            <span>Partners</span>
          </button>
        </div>

        <div className="partners-content">
          <div className="partners-header">
            <div>
              <h1>Partners</h1>
              <p>Aca podes crear, eliminar, deshabilitar y actualizar keys de los partners</p>
            </div>
            <button className="partners-add-button" type="button" onClick={() => router.push('/protected/partnerForm')}>
              Agregar partner
            </button>
          </div>

          <div className="partners-list">
            {partnersData?.partners?.map((partner) => (
              <div key={partner.id} className="partners-card">
                <div className="partners-card-info">
                  <p className="partners-card-title">
                    {partner.name ?? ''}
                  </p>
                  <p className="partners-card-subtitle">
                    {partner.description ?? ''}
                  </p>
                </div>
                <div className="partners-card-actions">
                  <span className="partners-role-chip">{partner.status === 1 ? 'Habilitado' : 'Deshabilitado'}</span>                  
                  <div className="partners-card-tools">
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label="Ver Api key"
                      onClick={() => setViewCredentials({ app_key: partner.app_key, app_secret: partner.app_secret })}
                    >
                      <img src={iconEye} alt="Ver Api key" />
                    </button>                   
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label="Editar partner"
                      onClick={() => router.push(`/protected/partnerForm/${partner.id}`)}
                    >
                      <img src={iconPencil} alt="Editar partner" />
                    </button>
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label="Refresh Api key"
                      onClick={() => refresh(partner.id)}
                    >
                      <img src={iconRefresh} alt="Refresh Api key" />
                    </button>
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label={partner.status === 1 ? "Deshabilitar partner" : "Habilitar partner"}
                      onClick={() => partner.status === 1 ? desHabilitar(partner.id) : habilitar(partner.id)}
                    >
                      <img src={partner.status === 1 ? iconLock : iconCheck} alt={partner.status === 1 ? "Deshabilitar partner" : "Habilitar partner"} />
                    </button>
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label="Eliminar partner"
                      onClick={() => eliminar(partner.id)}
                    >
                      <img src={iconTrash} alt="Eliminar partner" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="partners-mobile-footer">
          <button className="partners-add-button" type="button" onClick={() => router.push('/protected/partnerForm')}>
            Agregar partner
          </button>
        </div>
      </div>

      {confirmAction && (
        <AreYouSureModal
          title={confirmMessages[confirmAction.type].title}
          subTitle={confirmMessages[confirmAction.type].subTitle}
          icon={confirmMessages[confirmAction.type].icon}
          onAccept={handleConfirm}
          onCancel={() => setConfirmAction(null)}
          iconBackgroundColor={confirmMessages[confirmAction.type].iconBackgroundColor}
        />
      )}

      {viewCredentials && (<AreYouSureModal
          title="Keys"
          subTitle="Credenciales del partner"
          text={<>
            <div className="modal-credential-row">
              <div className="modal-message-text">
                <strong>App Key: </strong> 
                <button
                  type="button"
                  title="Copiar App Key"
                  style={{ color: copiedField === 'app_key' ? '#2e7d32' : undefined }}
                  onClick={() => { navigator.clipboard.writeText(viewCredentials.app_key); setCopiedField('app_key'); setTimeout(() => setCopiedField(null), 3000); }}
                >
                  {copiedField === 'app_key' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p style={{ fontSize: '0.9em' }}>{viewCredentials.app_key}</p>
            </div>
            <div className="modal-credential-row">
              <div className="modal-message-text">
                <strong>App Secret: </strong>
                <button
                  type="button"
                  title="Copiar App Secret"
                  style={{ color: copiedField === 'app_secret' ? '#2e7d32' : undefined }}
                  onClick={() => { navigator.clipboard.writeText(viewCredentials.app_secret); setCopiedField('app_secret'); setTimeout(() => setCopiedField(null), 3000); }}
                >
                  {copiedField === 'app_secret' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p style={{ fontSize: '0.9em' }}>{viewCredentials.app_secret}</p>              
            </div>
          </>}
          icon={iconEye}
          iconBackgroundColor="#FFD700"
          onCancel={() => setViewCredentials(null)}
          cancelText='Cerrar'
        />)}
    </div>
  );
}
