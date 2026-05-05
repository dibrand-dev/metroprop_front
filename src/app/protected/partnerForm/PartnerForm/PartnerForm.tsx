'use client';

import { useEffect, useState } from 'react';
import './PartnerForm.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import { apiFetch } from '@/lib/apiFetch';

const iconArrowBack = '/icons/arrow.svg';

interface PartnerFormProps {
  partnerId?: string;
}

export default function PartnerForm({ partnerId }: PartnerFormProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [habilitado, setHabilitado] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: '', description: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isEditing = Boolean(partnerId);
  const pageTitle = isEditing ? 'Modificar partner' : 'Agregar partner';
  const queryClient = useQueryClient();

  const { isLoading: isLoadingPartner, data: partnerData } = useQuery({
    queryKey: ['partner', partnerId],
    queryFn: async () => apiFetch(`${API_BASE_URL}/partners/${partnerId}`),
    enabled: Boolean(partnerId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!partnerData) return;
    const partner = partnerData?.partner ?? partnerData;
    setName(partner.name ?? '');
    setDescription(partner.description ?? '');
    setHabilitado(partner.status === 1);
  }, [partnerData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        status: habilitado ? 1 : 0,
      };
      const url = isEditing
        ? `${API_BASE_URL}/partners/${partnerId}`
        : `${API_BASE_URL}/partners`;
      return apiFetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      if (!isEditing) {
        setName('');
        setDescription('');
        setHabilitado(false);
      }
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({ name: '', description: '' });

    const errors = { name: '', description: '' };
    if (!name.trim()) errors.name = 'El nombre es requerido';
    if (!description.trim()) errors.description = 'La descripción es requerida';

    if (errors.name || errors.description) {
      setFieldErrors(errors);
      return;
    }

    saveMutation.mutate();
  };

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
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
              label="Guardar partner"
              type="submit"
              variant="primary"
              buttonType="1"
              size="medium"
            />
          </div>
          <div className="partner-form-section">
            <label className="partner-form-label">Nombre del partner</label>
            <InputField2
              label="Nombre del partner"
              type="text"
              placeholder="Nombre del partner"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required={true}
              error={fieldErrors.name}
            />
          </div>

          <div className="partner-form-section">
            <label className="partner-form-label">Descripción</label>
            <InputField2
              label="Descripción"
              type="text"
              placeholder="Descripción"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required={true}
              error={fieldErrors.description}
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
            title={isEditing ? '¡Partner actualizado!' : '¡Partner creado!'}
            text={isEditing ? 'Los datos del partner fueron guardados exitosamente.' : 'El partner fue creado exitosamente.'}
          />
        )}

        <div className="partner-form-mobile-footer">
          <Button
            label="Guardar partner"
            type="submit"
            variant="primary"
            buttonType="1"
            fullWidth={true}
            size="medium"
          />
        </div>
      </div>
    </div>
  );
}
