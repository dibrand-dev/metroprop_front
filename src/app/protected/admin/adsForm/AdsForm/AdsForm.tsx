'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './AdsForm.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { apiFetch } from '@/lib/apiFetch';
import Select from '@/ui/Select/Select';
import { AdBanner, BANNER_PLACEMENT_OPTIONS, BannerPlacement } from '@/types/propiedad';

const iconArrowBack = '/icons/arrow.svg';

interface PlanFormProps {
  adId?: string;
}

export default function AdsForm({ adId }: PlanFormProps) {
  const router = useRouter();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [name, setName] = useState('');
  const [placement, setPlacement] = useState('');
  const [habilitado, setHabilitado] = useState(false);  
  const [fieldErrors, setFieldErrors] = useState({ name: '', placement: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isEditing = Boolean(adId);
  const pageTitle = isEditing ? 'Modificar anuncio' : 'Agregar anuncio';
  const queryClient = useQueryClient();

  const { isLoading: isLoadingAd, data: adData } = useQuery<AdBanner>({
    queryKey: ['ad', adId],
    queryFn: async () => apiFetch(`${API_BASE_URL}/ads-banners/${adId}`),
    enabled: Boolean(adId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!adData) return;
    const ad: AdBanner = adData?.ad ?? adData;
    setName(ad.name ?? '');
    setPlacement(ad.placement ?? '');
    setHabilitado(ad.status);
  }, [adData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),        
        status: habilitado,
        placement: placement,
      };
      const url = isEditing
        ? `${API_BASE_URL}/ads-banner/${adId}`
        : `${API_BASE_URL}/ads-banner`;
      return apiFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      if (!isEditing) {
        setName('');
        setPlacement('');
        setHabilitado(false);
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/protected/admin/ads'); 
      }, 3000);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({ name: '', placement: '',  });

    const errors = { name: '', placement: '',  };
    if (!name.trim()) errors.name = 'El nombre es requerido';
    if (!placement) errors.placement = 'La ubicación es requerida';

    if (errors.name || errors.placement) {
      setFieldErrors(errors);
      return;
    }

    saveMutation.mutate();
  };

  return (
      <div className={`partner-form-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="partner-form-mobile-header">
          <button
            className="partner-form-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>{pageTitle}</span>
          </button>
        </div>

        <form className="partner-form-content" onSubmit={handleSubmit}>
          <div className="partner-form-header">
            <h1>{pageTitle}</h1>
            <Button
              label="Guardar ad"
              type="submit"
              variant="primary"
              buttonType="1"
              size="medium"
            />
          </div>
          <div className="partner-form-section">
            <label className="partner-form-label">Nombre del ad</label>
            <InputField2
              label="Nombre del ad"
              type="text"
              placeholder="Nombre del ad"
              value={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
              required={true}
              error={fieldErrors.name}
            />
          </div>
          <div className="partner-form-section">
            <Select
              options={BANNER_PLACEMENT_OPTIONS}
              value={placement}
              onChange={(value) => setPlacement(value)}
              label="Ubicación"

            />
          </div>
          
          <div className="partner-form-section">
            <Checkbox
              label="Habilitado"
              checked={habilitado}
              onChange={setHabilitado}
            />
          </div>
        </form>

        {showSuccessModal && (
          <SuccessModal
            title={isEditing ? 'Plan actualizado!' : '¡Plan creado!'}
            text={isEditing ? 'Los datos del plan fueron guardados exitosamente.' : 'El plan fue creado exitosamente.'}
          />
        )}

        <div className="partner-form-mobile-footer">
          <Button
            label="Guardar plan"
            type="submit"
            variant="primary"
            buttonType="1"
            fullWidth={true}
            size="medium"
          />
        </div>
      </div>
  );
}
