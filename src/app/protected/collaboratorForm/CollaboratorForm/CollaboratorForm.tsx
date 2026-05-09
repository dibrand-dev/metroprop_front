'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './CollaboratorForm.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';
import { useSession } from 'next-auth/react';
import InputField from '@/ui/InputField/InputField';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import { LOCATION_ARGENTINA_ID } from '@/app/constants';
import { apiFetch } from '@/lib/apiFetch';

const iconArrowBack = '/icons/arrow.svg';

interface CollaboratorFormProps {
  collaboratorId?: string;
}

export default function CollaboratorForm({ collaboratorId }: CollaboratorFormProps) {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<any>({
    user_role: '',
    email: '',
    phone: '',
    alternative_phone: '',
    province: '',
    city: '',
    neighborhood: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const { data: provinces = [] } = useQuery<any[]>({
    queryKey: ['provinces', LOCATION_ARGENTINA_ID],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getCountryStates`, { params: { countryId: LOCATION_ARGENTINA_ID } }),
  });

  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ['locations', formData.province],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getStateLocations`, { params: { stateId: formData.province } }),
    enabled: !!formData.province,
  });

  const { data: neighborhoods = [] } = useQuery<any[]>({
    queryKey: ['zones', formData.city],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getLocationChildrens`, { params: { locationId: formData.city } }),
    enabled: !!formData.city,
  });

  const provinceOptions = provinces.map((p: any) => ({ value: String(p.id), label: p.name }));
  const cityOptions = cities.map((c: any) => ({ value: String(c.id), label: c.name }));
  const neighborhoodOptions = neighborhoods.map((n: any) => ({ value: String(n.id), label: n.name }));

  const isEditing = Boolean(collaboratorId);
  const pageTitle = isEditing ? 'Modificar colaborador' : 'Agregar colaborador';
  const formatPhone = (value: string) => value.replace(/\D/g, '');

  const { data: collaboratorData } = useQuery<any>({
    queryKey: ['collaborator', collaboratorId],
    queryFn: () => apiFetch<any>(`${API_BASE_URL}/users/${collaboratorId}`),
    enabled: isEditing,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!collaboratorData) return;
    const c = collaboratorData?.user ?? collaboratorData;
    setFormData({
      user_role: String(c.role_id ?? c.user_role ?? ''),
      email: c.email ?? '',
      phone: formatPhone(c.phone ?? ''),
      alternative_phone: formatPhone(c.alternative_phone ?? ''),
      province: c.state_id != null ? String(c.state_id) : '',
      city: c.location_id != null ? String(c.location_id) : '',
      neighborhood: c.sub_location_id != null ? String(c.sub_location_id) : '',
    });
  }, [collaboratorData]);

  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const isPhoneValid = phoneRegex.test(formData.phone.trim());
  const isAlternativePhoneValid = phoneRegex.test(formData.alternative_phone.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isFormValid = formData.user_role.trim().length > 0 && formData.email.trim().length > 0 && isEmailValid && isPhoneValid;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const organizationId = (sessionData?.user as any)?.organization?.id ?? null;
      const payload: Record<string, any> = {
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        alternative_phone: formData.alternative_phone || undefined,
        user_role: formData.user_role || undefined,
        country_id: LOCATION_ARGENTINA_ID,
      };
      if (formData.province) payload.state_id = parseInt(formData.province);
      if (formData.city) payload.location_id = parseInt(formData.city);
      if (formData.neighborhood) payload.sub_location_id = parseInt(formData.neighborhood);
      if (!isEditing && organizationId) payload.organizationId = organizationId;
      const url = isEditing
        ? `${API_BASE_URL}/users/${collaboratorId}`
        : `${API_BASE_URL}/users`;
      return apiFetch<any>(url, {
        method: isEditing ? 'PATCH' : 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      setErrorMessage('');
      if (!isEditing) {
        setFormData({
          user_role: '',
          email: '',
          phone: '',
          alternative_phone: '',
          province: '',
          city: '',
          neighborhood: '',
        });
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/protected/collaborators');
      }, 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message ?? 'Error al guardar el colaborador. Intenta de nuevo.');
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isFormValid) return;
    saveMutation.mutate();
  };

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`branch-form-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="branch-form-mobile-header">
          <button
            className="branch-form-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>{pageTitle}</span>
          </button>
        </div>

        <form className="branch-form-content" onSubmit={handleSubmit}>
          <div className="branch-form-header">
            <div className="title-container">
              <h1>{pageTitle}</h1>
              <div className="buttons-header">
                <Button
                  label="Cancelar"
                  type="button"
                  variant="secondary"
                  buttonType="2"
                  size="medium"
                  onClick={() => router.push('/protected/collaborators')}
                />  
                <Button
                  label={saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                  type="submit"
                  variant="primary"
                  buttonType="1"
                  size="medium"
                  disabled={!isFormValid || saveMutation.isPending}
                />
              </div>
            </div>
            <div>
              <p>Administrador Publica, edita, lee todos los avisos y edita datos de la empresa y administra usuarios.</p>
              <p>Supervisor Publica, edita, lee todos los avisos y administra usuarios.</p>
              <p>Vendedor Publica, edita y lee avisos en los que tiene permisos.</p>
            </div>
          </div>
          <div className="branch-form-grid">
            <div className="branch-form-section">
              <Select
                label="Tipo de usuario"
                placeholder="Seleccionar"
                value={formData.user_role}
                onChange={(value) => { handleInputChange('user_role', value); }}
                options={[{ value: '1', label: 'Administrador' },
                          { value: '2', label: 'Supervisor' },
                          { value: '3', label: 'Vendedor' }]}
              />
            </div>
          </div>

          <div className="branch-form-section">
            <h2>Datos del colaborador</h2>
            <div className="branch-form-field">
              <InputField
                label="Email (opcional)"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(event) => handleInputChange('email', event.target.value)}
                error={submitted && formData.email.trim().length > 0 && !isEmailValid ? 'Formato de email inválido' : undefined}
              />
            </div>
            <div className="branch-form-grid">              
              <div className="branch-form-field">
                <InputField
                  label="Teléfono"
                  type="tel"
                  placeholder="Número de teléfono"
                  value={formData.phone}
                  onChange={(event) => handleInputChange('phone', formatPhone(event.target.value))}
                  error={submitted && formData.phone.trim().length === 0 ? 'El teléfono es obligatorio' : formData.phone.trim().length > 0 && !isPhoneValid ? 'Formato inválido. Ej: 541130475755' : undefined}
                />
              </div>
              <div className="branch-form-field">
                <InputField
                  label="Teléfono adicional (opcional)"
                  type="tel"
                  placeholder="Número de teléfono adicional"
                  value={formData.alternative_phone}
                  onChange={(event) => handleInputChange('alternative_phone', formatPhone(event.target.value))}
                  error={formData.alternative_phone.trim().length > 0 && !isAlternativePhoneValid ? 'Formato inválido. Ej: 541130475755' : undefined}
                />
              </div>
            </div>
          </div>
          <div className="branch-form-section">
            <div className="branch-form-grid">              
              <div className="branch-form-field">
                <Select
                  label="Provincia (opcional)"
                  placeholder="Seleccionar"
                  value={formData.province}
                  onChange={(value) => { handleInputChange('province', value); handleInputChange('city', ''); handleInputChange('neighborhood', ''); }}
                  options={provinceOptions}
                />
              </div>
              <div className="branch-form-field">
                <Select
                  label="Ciudad (opcional)"
                  placeholder="Seleccionar"
                  value={formData.city}
                  onChange={(value) => { handleInputChange('city', value); handleInputChange('neighborhood', ''); }}
                  options={cityOptions}
                  disabled={!formData.province}
                />
              </div>
              <div className="branch-form-field">
                <Select
                  label="Barrio (opcional)"
                  placeholder="Seleccionar"
                  value={formData.neighborhood}
                  onChange={(value) => handleInputChange('neighborhood', value)}
                  options={neighborhoodOptions}
                  disabled={!formData.city}
                />
              </div>
            </div>
          </div>
        </form>

        {showSuccessModal && (
          <SuccessModal
            title={isEditing ? '¡Colaborador actualizado!' : '¡Colaborador creado!'}
            text={isEditing ? 'Los datos del colaborador fueron guardados exitosamente.' : 'El colaborador fue creado exitosamente.'}
          />
        )}
        {errorMessage && (
          <div className="branch-form-feedback branch-form-feedback--error">{errorMessage}</div>
        )}

        <div className="branch-form-mobile-footer">
          <Button
            label="Cancelar"
            type="button"
            variant="secondary"
            buttonType="2"
            fullWidth={true}
            size="medium"
            onClick={() => router.push('/protected/collaborators')}
          />
          <Button
            label={saveMutation.isPending ? 'Guardando...' : 'Guardar colaborador'}
            type="submit"
            variant="primary"
            buttonType="1"
            fullWidth={true}
            size="medium"
            disabled={!isFormValid || saveMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
