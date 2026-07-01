'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './AdsForm.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import InputField2 from '@/ui/InputField2/InputField2';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { apiFetch } from '@/lib/apiFetch';
import { AdBanner, BANNER_PLACEMENT_OPTIONS, BannerPlacement } from '@/types/propiedad';

const iconArrowBack = '/icons/arrow.svg';

export default function AdsForm() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.id as string | undefined;
  const { showMenu, setShowMenu } = useAdminMenu();
  const [name, setName] = useState('');
  const [placements, setPlacements] = useState<number[]>([]);
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [habilitado, setHabilitado] = useState(false);  
  const [fieldErrors, setFieldErrors] = useState({ name: '', placements: '', link: '', file: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isEditing = Boolean(adId);
  const pageTitle = isEditing ? 'Modificar anuncio' : 'Agregar anuncio';
  const queryClient = useQueryClient();

  const { isLoading: isLoadingAd, data: adData } = useQuery<AdBanner>({
    queryKey: ['ad', adId],
    queryFn: async () => apiFetch(`${API_BASE_URL}/ads-banners/${adId}`),
    enabled: !!adId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!adData) return;
    const ad: AdBanner = adData?.ad ?? adData;
    setName(ad.name ?? '');
    setPlacements(Array.isArray((ad as any).placements) ? (ad as any).placements.map(Number) : (ad.placements ? [Number(ad.placements)] : []));
    setLink((ad as any).link ?? '');
    setImagePreview((ad as any).file ?? '');
    setHabilitado(ad.status);
  }, [adData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('status', String(habilitado));
      formData.append('placements', "[" + placements.join(',') + "]");
      formData.append('link', link.trim());
      if (imageFile) formData.append('file', imageFile);
      const url = isEditing
        ? `${API_BASE_URL}/ads-banners/${adId}`
        : `${API_BASE_URL}/ads-banners`;
      return apiFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      if (!isEditing) {
        setName('');
        setPlacements([]);
        setLink('');
        setImageFile(null);
        setImagePreview('');
        setHabilitado(false);
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/protected/admin/ads'); 
      }, 3000);
    },
  });

  const handleSubmit = (/* event: React.FormEvent */) => {
    setFieldErrors({ name: '', placements: '', link: '', file: '' });

    const errors = { name: '', placements: '', link: '', file: '' };
    if (!name.trim()) errors.name = 'El nombre es requerido';
    if (placements.length === 0) errors.placements = 'Seleccioná al menos una ubicación';
    if (!link.trim()) errors.link = 'El link es requerido';
    if (!imageFile && !imagePreview) errors.file = 'La imagen es requerida';

    if (errors.name || errors.placements || errors.link || errors.file) {
      setFieldErrors(errors);
      return;
    }

    saveMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = '';
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

        <form className="partner-form-content" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="partner-form-header">
            <h1>{pageTitle}</h1>
            <Button
              label="Guardar Ad"
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
            <label className="partner-form-label">Ubicación*</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BANNER_PLACEMENT_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={placements.includes(option.value)}
                  onChange={(checked) =>
                    setPlacements(prev =>
                      checked ? [...prev, option.value] : prev.filter(v => v !== option.value)
                    )
                  }
                />
              ))}
            </div>
            {fieldErrors.placements && <span style={{ color: '#d32f2f', fontSize: '0.8em' }}>{fieldErrors.placements}</span>}
          </div>

          <div className="partner-form-section">
            <InputField2
              label="Link*"
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
              required={true}
              error={fieldErrors.link}
            />
          </div>

          <div className="partner-form-section">
            <label className="partner-form-label">Imagen* <span style={{ fontWeight: 400, fontSize: '0.85em', color: '#666' }}>(JPG, PNG, WEBP, GIF)</span></label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ display: 'block', maxHeight: 120, maxWidth: '100%', marginBottom: 8, borderRadius: 6, objectFit: 'contain' }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'block' }}
            />
            {fieldErrors.file && <span style={{ color: '#d32f2f', fontSize: '0.8em' }}>{fieldErrors.file}</span>}
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
            label="Guardar Ad"
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
