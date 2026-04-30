'use client';

import { useEffect, useRef, useState } from 'react';
import './BranchForm.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import Select from '@/ui/Select/Select';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import { useSession } from 'next-auth/react';
import InputField from '@/ui/InputField/InputField';
import { useQuery, useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import { LOCATION_ARGENTINA_ID } from '@/app/constants';

const iconArrowBack = '/icons/arrow.svg';

interface BranchFormProps {
  branchId?: string;
}

export default function BranchForm({ branchId }: BranchFormProps) {
  const { data: sessionData, update: updateSession } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<any>({
    branch_name: '',
    email: '',
    phone: '',
    alternative_phone: '',
    sameForRent: false,
    address: '',
    province: '',
    city: '',
    neighborhood: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const { data: provinces = [] } = useQuery({
    queryKey: ['provinces', LOCATION_ARGENTINA_ID],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/location/getCountryStates?countryId=${LOCATION_ARGENTINA_ID}`);
      if (!res.ok) throw new Error('Error fetching provinces');
      return res.json();
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['locations', formData.province],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/location/getStateLocations?stateId=${formData.province}`);
      if (!res.ok) throw new Error('Error fetching cities');
      return res.json();
    },
    enabled: !!formData.province,
  });

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ['zones', formData.city],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/location/getLocationChildrens?locationId=${formData.city}`);
      if (!res.ok) throw new Error('Error fetching neighborhoods');
      return res.json();
    },
    enabled: !!formData.city,
  });

  const provinceOptions = provinces.map((p: any) => ({ value: String(p.id), label: p.name }));
  const cityOptions = cities.map((c: any) => ({ value: String(c.id), label: c.name }));
  const neighborhoodOptions = neighborhoods.map((n: any) => ({ value: String(n.id), label: n.name }));

  const isEditing = Boolean(branchId);
  const pageTitle = isEditing ? 'Modificar sucursal' : 'Agregar sucursal';
  const formatPhone = (value: string) => value.replace(/\D/g, '');
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const isPhoneValid = phoneRegex.test(formData.phone.trim());
  const isAlternativePhoneValid = phoneRegex.test(formData.alternative_phone.trim());
  const isFormValid = formData.branch_name.trim().length > 0 && isPhoneValid;

  useEffect(() => {
    if (!branchId) return;
    fetch(`${API_BASE_URL}/branches/${branchId}`)
      .then(res => res.json())
      .then(branch => {
        setFormData({
          branch_name: branch.branch_name ?? '',
          email: branch.email ?? '',
          phone: formatPhone(branch.phone ?? ''),
          alternative_phone: formatPhone(branch.alternative_phone ?? ''),
          sameForRent: false,
          address: branch.address ?? '',
          province: branch.state_id != null ? String(branch.state_id) : '',
          city: branch.location_id != null ? String(branch.location_id) : undefined,
          neighborhood: branch.sub_location_id != null ? String(branch.sub_location_id) : undefined,
        });
        if (branch.branch_logo) setLogoPreview(branch.branch_logo);
      });
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
      payload.append('external_reference', 'false');
      formData.city ? payload.append('location_id', String(parseInt(formData.city))) : null;
      payload.append('phone', formData.phone || '');
      formData.province ? payload.append('state_id', String(parseInt(formData.province))) : null;
      formData.sub_location_id ? payload.append('sub_location_id', String(parseInt(formData.sub_location_id))) : null;
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
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        body: payload,
      });
      if (!res.ok) throw new Error('Error al guardar la sucursal');
      return { status: res.status, data: await res.json() };
    },
    onSuccess: (result) => {
      setSuccessMessage(isEditing ? 'Sucursal actualizada correctamente.' : 'Sucursal creada correctamente.');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 4000);
      // Update session with new/updated branch
      const currentBranches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
      const savedBranch = result.data;
      const updatedBranches = isEditing
        ? currentBranches.map((b) => (String(b.id) === String(branchId) ? savedBranch : b))
        : [...currentBranches, savedBranch];
      const currentOrg = (sessionData?.user as any)?.organization ?? {};
      updateSession({ organization: { ...currentOrg, branches: updatedBranches } });
      if (!isEditing && result.status === 201) {
        setFormData({
          branch_name: '',
          email: '',
          phone: '',
          alternative_phone: '',
          sameForRent: false,
          address: '',
          province: '',
          city: '',
          neighborhood: '',
        });
        setLogoFile(null);
        setLogoPreview('');
      }
    },
    onError: (err: any) => {
      setErrorMessage(err?.message ?? 'Error al guardar la sucursal. Intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
    setLogoPreview(URL.createObjectURL(file));
    event.target.value = '';
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
                  label="Email (opcional)"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(event) => handleInputChange('email', event.target.value)}
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

        {successMessage && (
          <div className="branch-form-feedback branch-form-feedback--success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="branch-form-feedback branch-form-feedback--error">{errorMessage}</div>
        )}

        <div className="branch-form-mobile-footer">
          <Button
            label={saveMutation.isPending ? 'Guardando...' : 'Guardar sucursal'}
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
