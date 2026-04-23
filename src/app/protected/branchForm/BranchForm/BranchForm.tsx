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
  const [branchName, setBranchName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sameForRent, setSameForRent] = useState(false);
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const { data: provinces = [] } = useQuery({
    queryKey: ['provinces', LOCATION_ARGENTINA_ID],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/location/getCountryStates?countryId=${LOCATION_ARGENTINA_ID}`);
      if (!res.ok) throw new Error('Error fetching provinces');
      return res.json();
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['locations', province],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/location/getStateLocations?stateId=${province}`);
      if (!res.ok) throw new Error('Error fetching cities');
      return res.json();
    },
    enabled: !!province,
  });

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ['zones', city],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/location/getLocationChildrens?locationId=${city}`);
      if (!res.ok) throw new Error('Error fetching neighborhoods');
      return res.json();
    },
    enabled: !!city,
  });

  const provinceOptions = provinces.map((p: any) => ({ value: String(p.id), label: p.name }));
  const cityOptions = cities.map((c: any) => ({ value: String(c.id), label: c.name }));
  const neighborhoodOptions = neighborhoods.map((n: any) => ({ value: String(n.id), label: n.name }));

  const isEditing = Boolean(branchId);
  const pageTitle = isEditing ? 'Modificar sucursal' : 'Agregar sucursal';
  const formatPhone = (value: string) => value.replace(/\D/g, '');
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const isPhoneValid = phoneRegex.test(contactPhone.trim());
  const isFormValid = branchName.trim().length > 0 && isPhoneValid;

  useEffect(() => {
    if (!branchId) return;
    const branches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
    const branch = branches.find((b: any) => String(b.id) === String(branchId));
    if (!branch) return;
    setBranchName(branch.branch_name ?? '');
    setContactEmail(branch.email ?? '');
    setContactPhone(formatPhone(branch.phone ?? ''));
    setAddress(branch.address ?? '');
    setProvince(branch.state_id != null ? String(branch.state_id) : '');
    setCity(branch.location_id != null ? String(branch.location_id) : '');
    setNeighborhood(branch.sub_location_id != null ? String(branch.sub_location_id) : '');
  }, [branchId, sessionData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const organizationId = (sessionData?.user as any)?.organization?.id ?? null;
      const payload: any = {
        address: address || null,
        alternative_phone: null,
        branch_logo: null,
        branch_name: branchName,
        contact_time: null,
        country_id: LOCATION_ARGENTINA_ID,
        email: contactEmail || null,
        external_reference: false,
        full_location: null,
        geo_lat: null,
        geo_long: null,
        location_id: city ? parseInt(city) : null,
        phone: contactPhone,
        state_id: province ? parseInt(province) : null,
        sub_location_id: neighborhood ? parseInt(neighborhood) : null,
      };
      if (!isEditing && organizationId) {
        payload.organizationId = organizationId;
      }
      const url = isEditing
        ? `${API_BASE_URL}/branches/${branchId}`
        : `${API_BASE_URL}/branches`;
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        setBranchName('');
        setContactEmail('');
        setContactPhone('');
        setSameForRent(false);
        setAddress('');
        setProvince('');
        setCity('');
        setNeighborhood('');
        setLogoFileName('');
      }
    },
    onError: (err: any) => {
      setErrorMessage(err?.message ?? 'Error al guardar la sucursal. Intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoFileName(file?.name || '');
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
              value={branchName}
              onChange={(event) => setBranchName(event.target.value)}
              required={true}
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
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
              </div>
              <div className="branch-form-field">
                <InputField
                  label="Teléfono"
                  type="tel"
                  placeholder="Número de teléfono"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(formatPhone(event.target.value))}
                  required={true}
                  error={contactPhone.trim().length > 0 && !isPhoneValid ? 'Formato inválido. Ej: 541130475755' : undefined}
                />
                <button className="branch-form-link" type="button">
                  + Agregar otro teléfono
                </button>
              </div>
            </div>
            <Checkbox
              label="Los datos de contacto para venta son los mismos que para alquiler"
              checked={sameForRent}
              onChange={setSameForRent}
            />
          </div>

          <div className="branch-form-section">
            <h2>Agregar logo</h2>
            <div className="branch-form-logo">
              <div className="branch-form-logo-preview" />
              <button
                className="branch-form-logo-upload"
                type="button"
                onClick={handleLogoClick}
              >
                <span>{logoFileName || 'Agregar logo'}</span>
              </button>
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
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              <div className="branch-form-field">
                <Select
                  label="Provincia (opcional)"
                  placeholder="Seleccionar"
                  value={province}
                  onChange={(value) => { setProvince(value); setCity(''); setNeighborhood(''); }}
                  options={provinceOptions}
                />
              </div>
              <div className="branch-form-field">
                <Select
                  label="Ciudad (opcional)"
                  placeholder="Seleccionar"
                  value={city}
                  onChange={(value) => { setCity(value); setNeighborhood(''); }}
                  options={cityOptions}
                  disabled={!province}
                />
              </div>
              <div className="branch-form-field">
                <Select
                  label="Barrio (opcional)"
                  placeholder="Seleccionar"
                  value={neighborhood}
                  onChange={(value) => setNeighborhood(value)}
                  options={neighborhoodOptions}
                  disabled={!city}
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
