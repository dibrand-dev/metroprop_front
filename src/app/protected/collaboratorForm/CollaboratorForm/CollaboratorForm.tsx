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
    role_id: '',
    name: '',
    password: '',
    email: '',
    phone: '',
    phone_additional: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const isEditing = Boolean(collaboratorId);
  const pageTitle = isEditing ? 'Modificar colaborador' : 'Agregar colaborador';
  const formatPhone = (value: string) => value.replace(/\D/g, '');

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
      if (fetchedBranches.length === 1) {
        handleInputChange('branchIds', String(fetchedBranches[0].id));
      }
    }
  }, [fetchedBranches]);

  const branchOptions = [
    ...branches?.map((b: any) => ({ value: String(b.id), label: b.branch_name ?? b.name ?? String(b.id) })),
  ];

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
      role_id: String(c.role_id ?? c.user_role ?? ''),
      name: c.name ?? '',
      password: '',
      email: c.email ?? '',
      phone: formatPhone(c.phone ?? ''),
      phone_additional: formatPhone(c.alternative_phone ?? c.phone_additional ?? ''),
      branchIds: String(c.branches?.[0]?.id ?? ''),
    });
  }, [collaboratorData]);

  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const isPhoneValid = phoneRegex.test(formData.phone.trim());
  const isPhoneAdditionalValid = phoneRegex.test(formData.phone_additional.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isFormValid = formData.role_id.trim().length > 0 && formData.email.trim().length > 0 && isEmailValid && isPhoneValid;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const organizationId = (sessionData?.user as any)?.organization?.id ?? null;
      const payload: Record<string, any> = {
        name: formData.name || undefined,
        password: formData.password || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        phone_additional: formData.phone_additional || undefined,
        role_id: formData.role_id || undefined,
        branchIds: [formData.branchIds]
      //  country_id: LOCATION_ARGENTINA_ID,
      };
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
          role_id: '',
          name: '',
          password: '',
          email: '',
          phone: '',
          phone_additional: '',
          branchIds: [],
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
                label="Sucursal"
                placeholder="Seleccionar"
                value={formData.branchIds}
                onChange={(value) => handleInputChange('branchIds', value)}
                options={branchOptions}
              />
            </div>
          </div>
          <div className="branch-form-grid">
            <div className="branch-form-section">
              <Select
                label="Tipo de usuario"
                placeholder="Seleccionar"
                value={formData.role_id}
                onChange={(value) => { handleInputChange('role_id', value); }}
                options={[{ value: '1', label: 'Administrador' },
                          { value: '2', label: 'Supervisor' },
                          { value: '3', label: 'Vendedor' }]}
              />
            </div>
          </div>

          <div className="branch-form-section">
            <h2>Datos del colaborador</h2>
            <div className="branch-form-grid">
              <div className="branch-form-field">
                <InputField
                  label="Nombre"
                  type="text"
                  placeholder="Nombre del colaborador"
                  value={formData.name}
                  onChange={(event) => handleInputChange('name', event.target.value)}
                />
              </div>
              <div className="branch-form-field">
                <InputField
                  label="Contraseña"
                  type="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(event) => handleInputChange('password', event.target.value)}
                />
              </div>
            </div>
            <div className="branch-form-field">
              <InputField
                label="Email"
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
                  value={formData.phone_additional}
                  onChange={(event) => handleInputChange('phone_additional', formatPhone(event.target.value))}
                  error={formData.phone_additional.trim().length > 0 && !isPhoneAdditionalValid ? 'Formato inválido. Ej: 541130475755' : undefined}
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
