'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import './BranchForm.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import SuccessModal from '@/components/SuccessModal/SuccessModal';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { useSession } from 'next-auth/react';
import InputField from '@/ui/InputField/InputField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import { LOCATION_ARGENTINA_ID } from '@/app/constants';
import { apiFetch } from '@/lib/apiFetch';
import LocationCascadeSelects, { LocationCascadeValue } from '@/components/LocationCascadeSelects/LocationCascadeSelects';

const iconArrowBack = '/icons/arrow.svg';

interface BranchFormProps {
  branchId?: string;
}

export default function BranchForm({ branchId }: BranchFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: sessionData, update: updateSession } = useSession();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [submitted, setSubmitted] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<any>({
    branch_name: '',
    email: '',
    phone: '',
    alternative_phone: '',
    sameForRent: false,
    address: '',
  });
  const [locationData, setLocationData] = useState<LocationCascadeValue>({ state_id: undefined, location_id: undefined, sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const isEditing = Boolean(branchId);
  const pageTitle = isEditing ? 'Modificar sucursal' : 'Agregar sucursal';
  const formatPhone = (value: string) => value.replace(/\D/g, '');
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const isPhoneValid = phoneRegex.test(formData.phone.trim());
  const isAlternativePhoneValid = phoneRegex.test(formData.alternative_phone.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isFormValid = formData.branch_name.trim().length > 0 && formData.email.trim().length > 0 && isEmailValid && isPhoneValid;

  useEffect(() => {
    if (!branchId) return;
    apiFetch<any>(`${API_BASE_URL}/branches/${branchId}`)
      .then(branch => {
        setFormData({
          branch_name: branch.branch_name ?? '',
          email: branch.email ?? '',
          phone: formatPhone(branch.phone ?? ''),
          alternative_phone: formatPhone(branch.alternative_phone ?? ''),
          sameForRent: false,
          address: branch.address ?? '',
        });
        setLocationData({
          state_id: branch.state_id != null ? branch.state_id : undefined,
          location_id: branch.location_id != null ? branch.location_id : undefined,
          sub_location_id: branch.sub_location_id != null ? branch.sub_location_id : undefined,
          neighborhood_id: branch.neighborhood_id != null ? branch.neighborhood_id : undefined,
          sub_neighborhood_id: branch.sub_neighborhood_id != null ? branch.sub_neighborhood_id : undefined,
        });
        if (branch.branch_logo) setLogoPreview(setImagePath(branch.branch_logo));
      })
      .catch(console.error);
  }, [branchId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const organizationId = (sessionData?.user as any)?.organization?.id ?? null;
      const payload = new FormData();
      payload.append('address', formData.address || '');
      if (formData.alternative_phone !== '') payload.append('alternative_phone', formData.alternative_phone);
      payload.append('branch_name', formData.branch_name);
      payload.append('contact_time', '');
      payload.append('country_id', String(LOCATION_ARGENTINA_ID));
      payload.append('email', formData.email || '');
      if (locationData.location_id) payload.append('location_id', String(locationData.location_id));
      payload.append('phone', formData.phone || '');
      if (locationData.state_id) payload.append('state_id', String(locationData.state_id));
      if (locationData.sub_location_id) payload.append('sub_location_id', String(locationData.sub_location_id));
      if (locationData.neighborhood_id) payload.append('neighborhood_id', String(locationData.neighborhood_id));
      if (locationData.sub_neighborhood_id) payload.append('sub_neighborhood_id', String(locationData.sub_neighborhood_id));
      if (logoFile) {
        payload.append('branch_logo', logoFile);
      } else if (logoPreview) {
        payload.append('branch_logo', logoPreview);
      }
      if (!isEditing && organizationId) {
        payload.append('organizationId', String(organizationId));
      }
      const url = isEditing
        ? `${API_BASE_URL}/branches/${branchId}`
        : `${API_BASE_URL}/branches`;
      const data = await apiFetch<any>(url, {
        method: isEditing ? 'PATCH' : 'POST',
        body: payload,
      });
      return { status: isEditing ? 200 : 201, data };
    },
    onSuccess: (result) => {
      setErrorMessage('');
      const organizationId = (sessionData?.user as any)?.organization?.id ?? null;
      queryClient.invalidateQueries({ queryKey: ['branches', organizationId] });
      // Update session with new/updated branch
      const currentBranches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
      const savedBranch = result.data;
      const updatedBranches = isEditing
        ? currentBranches.map((b) => (String(b.id) === String(branchId) ? savedBranch : b))
        : [...currentBranches, savedBranch];
      const currentOrg = (sessionData?.user as any)?.organization ?? {};
      updateSession({ organization: { ...currentOrg, branches: updatedBranches } });
      if (!isEditing) {
        setFormData({
          branch_name: '',
          email: '',
          phone: '',
          alternative_phone: '',
          sameForRent: false,
          address: '',
        });
        setLocationData({ state_id: undefined, location_id: undefined, sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
        setLogoFile(null);
        setLogoPreview('');
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/protected/admin/branches');
      }, 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message ?? 'Error al guardar la sucursal. Intenta de nuevo.');
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isFormValid) return;
    saveMutation.mutate();
  };

  const handleMobileSubmit = () => {
    setSubmitted(true);
    if (!isFormValid) return;
    saveMutation.mutate();
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(setImagePath(URL.createObjectURL(file)));
    event.target.value = '';
  };

  return (
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
            <h1>{pageTitle}</h1>
            <Button
              label={saveMutation.isPending ? 'Guardando...' : 'Guardar sucursal'}
              type="submit"
              variant="primary"
              buttonType="1"
              size="medium"
              disabled={!isFormValid || saveMutation.isPending}
            />
          </div>

          <div className="branch-form-section">
            <InputField
              label="Nombre de la sucursal"
              type="text"
              placeholder="Nombre de la sucursal"
              value={formData.branch_name}
              onChange={(event) => handleInputChange('branch_name', event.target.value)}
              error={submitted && formData.branch_name.trim().length === 0 ? 'El nombre es obligatorio' : undefined}
            />
          </div>

          <div className="branch-form-section">
            <h2>Datos de contacto para venta</h2>
            <div className="branch-form-grid">
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
            <Checkbox
              label="Los datos de contacto para venta son los mismos que para alquiler"
              checked={formData.sameForRent}
              onChange={(v) => handleInputChange('sameForRent', v)}
            />
          </div>

          <div className="branch-form-section">
            <label className="branch-form-logo-label">Agregar logo</label>
            <div className="branch-form-logo">
              <button
                className="branch-form-logo-upload"
                type="button"
                onClick={handleLogoClick}
              >
                <img src={'/icons/upload.svg'} alt="" />
                <span>{logoFile ? 'Cambiar logo' : 'Agregar logo'}</span>
              </button>
              {logoPreview && (
                <div className="branch-form-logo-preview">
                  <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
              {logoPreview && (
                <button
                  className="branch-form-logo-remove"
                  type="button"
                  onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                >
                  Quitar logo
                </button>
              )}
              <input
                ref={logoInputRef}
                className="branch-form-logo-input"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
            <p className="branch-form-help">
              Tamaño recomendado 138px por 75px. Peso máximo 200 KB.
            </p>
          </div>

          <div className="branch-form-section">
            <div className="branch-form-grid">
              <div className="branch-form-field">
                <InputField
                  label="Dirección (opcional)"
                  type="text"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={(event) => handleInputChange('address', event.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <LocationCascadeSelects
              value={locationData}
              onChange={setLocationData}
            />
          </div>
        </form>

        {showSuccessModal && (
          <SuccessModal
            title={isEditing ? '¡Sucursal actualizada!' : '¡Sucursal creada!'}
            text={isEditing ? 'Los datos de la sucursal fueron guardados exitosamente.' : 'La sucursal fue creada exitosamente.'}
          />
        )}
        {errorMessage && (
          <div className="branch-form-feedback branch-form-feedback--error">{errorMessage}</div>
        )}

        <div className="branch-form-mobile-footer">
          <Button
            label={saveMutation.isPending ? 'Guardando...' : 'Guardar sucursal'}
            type="button"
            onClick={handleMobileSubmit}
            variant="primary"
            buttonType="1"
            fullWidth={true}
            size="medium"
            disabled={!isFormValid || saveMutation.isPending}
          />
        </div>
      </div>
  );
}
