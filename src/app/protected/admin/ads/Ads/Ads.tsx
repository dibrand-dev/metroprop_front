'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Ads.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import { API_BASE_URL } from '@/utils/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import { apiFetch } from '@/lib/apiFetch';
import Button from '@/ui/Button/Button';
import { BannerPlacementLabels } from '@/types/propiedad';

const iconArrowBack = '/icons/arrow.svg';
const iconLock = '/icons/lock.svg';
const iconWhiteTrash = '/icons/whiteTrash.svg';
const iconTrash = '/icons/trash.svg';
const iconCheck = '/icons/check_black.svg';
const iconPencil = '/icons/pencil.svg';

type ConfirmAction = { type: 'refresh' | 'edit' | 'disable' | 'enable' | 'delete'; id: number } | null;

export default function Ads() {
  const { showMenu, setShowMenu } = useAdminMenu();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: adsData, isLoading, isError } = useQuery<any[]>({
    queryKey: ['ads'],
    queryFn: async () => apiFetch<any[]>(`${API_BASE_URL}/ads-banners`),
    staleTime: 30_000,
  });

  const disableMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/ads-banners/${id}`, { method: 'PATCH', body: { status: false }, }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  });

  const enableMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/ads-banners/${id}`, { method: 'PATCH', body: { status: true }, }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiFetch(`${API_BASE_URL}/ads-banners/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ads'] }),
  });

  const desHabilitar = (id: number) => setConfirmAction({ type: 'disable', id });
  const habilitar = (id: number) => setConfirmAction({ type: 'enable', id });
  const eliminar = (id: number) => setConfirmAction({ type: 'delete', id });

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    setConfirmAction(null);
    if (type === 'disable') {
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
    disable: { title: 'Deshabilitar Ad', subTitle: '¿Estás seguro que desea deshabilitar el ad?', icon: iconLock, iconBackgroundColor: '#FFD700' },
    enable: { title: 'Habilitar Ad', subTitle: '¿Estás seguro que desea habilitar el ad?', icon: iconCheck, iconBackgroundColor: '#4DE04A' },
    delete: { title: 'Eliminar Ad', subTitle: '¿Estás seguro que desea eliminar el ad?', icon: iconWhiteTrash, iconBackgroundColor: '#E84545' },
  };

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error cargando Ads</div>;

  return (
    <>
      <div className={`partners-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="partners-mobile-header">
          <button
            className="partners-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Ads</span>
          </button>
        </div>

        <div className="partners-content">
          <div className="partners-header">
            <div className="partners-header-container">
              <h1>Ads</h1>
              <p>Aca podes crear, eliminar, deshabilitar y actualizar ads</p>
            </div>
            <Button label="Agregar Ad" type="button" onClick={() => router.push('/protected/admin/adsForm')} />
          </div>

          <div className="partners-list">
            {adsData?.map((ad) => (
              <div key={ad.id} className="partners-card">
                <div className="partners-card-info">
                  <p className="partners-card-title">
                    {ad.name ?? ''}
                  </p>
                  <p className="partners-card-subtitle">
                    {ad.placements ? (BannerPlacementLabels as any)[ad.placements] :  ''}
                  </p>
                </div>
                <div className="partners-card-actions">
                  <span className="partners-role-chip">{ad.status ? 'Habilitado' : 'Deshabilitado'}</span>                  
                  <div className="partners-card-tools">                   
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label="Editar ad"
                      onClick={() => router.push(`/protected/admin/adsForm/${ad.id}`)}
                    >
                      <img src={iconPencil} alt="Editar ad" />
                    </button>                    
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label={ad.status? "Deshabilitar ad" : "Habilitar ad"}
                      onClick={() => ad.status ? desHabilitar(ad.id) : habilitar(ad.id)}
                    >
                      <img src={ad.status ? iconLock : iconCheck} alt={ad.status ? "Deshabilitar ad" : "Habilitar ad"} />
                    </button>
                    <button
                      className="partners-action-button"
                      type="button"
                      aria-label="Eliminar ad"
                      onClick={() => eliminar(ad.id)}
                    >
                      <img src={iconTrash} alt="Eliminar ad" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="partners-mobile-footer">
          <Button type="button" variant="primary" onClick={() => router.push('/protected/admin/adsForm')} label="Agregar ad" fullWidth />
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
    </>
  );
}
