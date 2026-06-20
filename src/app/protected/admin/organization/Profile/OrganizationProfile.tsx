'use client';

import { useEffect, useRef, useState } from 'react';
import './OrganizationProfile.scss';
import InputField2 from '@/ui/InputField2/InputField2';
import { useAdminMenu } from '../../AdminLayoutClient';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { API_BASE_URL, getIdentificador, setImagePath } from '@/utils/utils';
import Select from '@/ui/Select/Select';
import { LOCATION_ARGENTINA_ID } from '@/app/constants';
import { apiFetch } from '@/lib/apiFetch';
import Button from '@/ui/Button/Button';

const iconEditPencil = "/icons/pencil.svg";
const iconArrowBack = "/icons/arrow.svg";

interface PropertyData {
  [key: string]: string;
}

interface OrganizationProfileProps {
  organizationId?: number;
}

const formatNumeric = (value: string): string => value.replace(/\D/g, '');

export default function OrganizationProfile({ organizationId: propOrganizationId }: OrganizationProfileProps = {}) {
  const { data: sessionData } = useSession();
  const [activeSection, setActiveSection] = useState<'generales' | 'ubicacion' | 'descripcion'>('generales');
  const { showMenu, setShowMenu } = useAdminMenu();
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [organizationId, setOrganizationId] = useState<number | null>(propOrganizationId ?? null);
  const [country_id, setCountry_id] = useState<number | undefined>(LOCATION_ARGENTINA_ID);
  const [state_id, setState_id] = useState<number | undefined>(undefined);
  const [location_id, setLocation_id] = useState<number | undefined>(undefined);
  const [sub_location_id, setSub_location_id] = useState<number | undefined>(undefined);
  const [properties, setProperties] = useState<any>({
    // Generales
    email: '',
    name: '',
    phone: '',
    alternative_phone: '',
    social_reason: '',
    // cuit: '',
    fiscal_condition: '',
    license_number: '',
    // Ubicación
    address: '',
    // Descripción
    description: '',
  });


  const { data: provinces = [], isLoading: loadingProvinces } = useQuery({
    queryKey: ['provinces', country_id],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getCountryStates`, { params: { countryId: country_id } }),
    enabled: !!country_id,
  });

  const { data: locations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ['locations', state_id],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getStateLocations`, { params: { stateId: state_id } }),
    enabled: !!state_id,
  });

  const { data: zones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['zones', location_id],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getLocationChildrens`, { params: { locationId: location_id } }),
    enabled: !!location_id,
  });

  const provinceOptions = provinces.map((p: any) => ({ value: p.id.toString(), label: p.name }));
  const locationOptions = locations.map((l: any) => ({ value: l.id.toString(), label: l.name }));
  const zoneOptions = zones.map((z: any) => ({ value: z.id.toString(), label: z.name }));

  const orgId = propOrganizationId ?? (sessionData?.user as any)?.organization?.id ?? null;

  const { data: organizationData } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      console.log("Fetching organization data for orgId:", orgId);
      return apiFetch(`${API_BASE_URL}/organizations/${orgId}`);
    },
    enabled: !!orgId,
  });

  console.log("organizationData",organizationData)

  useEffect(() => {
    if (!orgId) return;
    setOrganizationId(orgId);
  }, [orgId]);

  useEffect(() => {
    if (!organizationData) return;
    const org = organizationData;
    if (org.country_id) setCountry_id(org.country_id);
    if (org.state_id) setState_id(org.state_id);
    if (org.location_id) setLocation_id(org.location_id);
    if (org.sub_location_id) setSub_location_id(org.sub_location_id);
    if (org.company_logo) setLogoPreview(setImagePath(org.company_logo));
    setProperties({
      email: org.email ?? '',
      company_name: org.company_name ?? org.name ?? '',
      phone: org.phone ?? '',
      alternative_phone: org.alternative_phone ?? org.alternative_phone ?? '',
      address: org.address ?? '',
      description: org.description ?? '',
      social_reason: org.social_reason ?? '',
      // cuit: org.cuit ?? '',
      fiscal_condition: org.fiscal_condition ?? '',
      license_number: org.license_number ?? '',
    });
  }, [organizationData]);

  const updateOrganizationMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!organizationId) throw new Error('No organization id');
      const payload = new FormData();
      if (data.email) payload.append('email', data.email);
      if (data.company_name) payload.append('company_name', data.company_name);
      if (data.phone) payload.append('phone', data.phone);
      if (data.alternative_phone) payload.append('alternative_phone', data.alternative_phone);
      if (country_id) payload.append('country_id', String(country_id));
      if (state_id) payload.append('state_id', String(state_id));
      if (location_id) payload.append('location_id', String(location_id));
      if (sub_location_id) payload.append('sub_location_id', String(sub_location_id));
      if (data.address) payload.append('address', data.address);
      if (data.description) payload.append('description', data.description);
      if (data.social_reason) payload.append('social_reason', data.social_reason);
      // if (data.cuit) payload.append('cuit', data.cuit);
      if (data.fiscal_condition) payload.append('fiscal_condition', data.fiscal_condition);
      if (data.license_number) payload.append('license_number', data.license_number);
      if (logoFile) {
        payload.append('company_logo', logoFile);
      } else if (logoPreview) {
        payload.append('company_logo', logoPreview);
      }
      const res = await apiFetch(`${API_BASE_URL}/organizations/${organizationId}`, {
        method: 'PATCH',
        body: payload,
      });
      return res;
    },
    onSuccess: () => {
      setSuccessMessage('Organización editada correctamente');
      setErrorMessage('');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: () => {
      setErrorMessage('Error al guardar los cambios. Por favor intenta de nuevo.');
      setSuccessMessage('');
    },
  });

  const handleInputChange = (field: string, value: string) => {
    const nextValue = ['telefono', 'telefonoAdicional'].includes(field)
      ? formatNumeric(value)
      : value;
    setProperties(prev => ({
      ...prev,
      [field]: nextValue
    }));
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

  const handleSave = () => {
    updateOrganizationMutation.mutate(properties);
  };

  const handleEditSection = (section: 'generales' | 'ubicacion' | 'descripcion') => {
    setActiveSection(section);
    setIsEditing(true);
  };
 
  return (
      <div className={`professional-profile-container ${showMenu ? 'mobile-hidden' : ''}`}>
        {/* Header */}
        <div className="professional-profile-header">
          <button className="professional-profile-back-button" onClick={() => setShowMenu(true)}>
            <img src={iconArrowBack} alt="Back"  />
          </button>
          <span className='professional-profile-title'>Datos de inmobiliaria</span>
        </div>
        <div className="profile-header">
          <div>
            <h1 className='professional-profile-title'>Datos de inmobiliaria</h1>
          </div>
          <Button label={updateOrganizationMutation.isPending ? 'Guardando...' : 'Guardar cambios'} onClick={handleSave} disabled={updateOrganizationMutation.isPending} />
        </div>
        

        {/* Main Content */}
        <div className={`professional-profile-content ${isEditing ? 'is-editing' : ''}`}>
          {/* Generales Section */}
          <section className="professional-profile-section">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Generales</h2>
              <button
                className="professional-profile-edit-button"
                onClick={() => handleEditSection('generales')}
              >
                <img src={iconEditPencil} alt="Edit" />
              </button>
            </div>
            
            <div className="professional-profile-fields">               
              {organizationData?.id && (
                <div className="professional-profile-identifier-text">
                  <p className="professional-profile-label">Identificador:</p>
                  <p className="professional-profile-value">{getIdentificador(organizationData.id)}</p>
                </div>
              )}
              <div className="branch-form-logo">
                <button
                  className="branch-form-logo-upload"
                  type="button"
                  onClick={handleLogoClick}
                  disabled={!(isEditing && activeSection === 'generales')}
                >
                  <img src={'/icons/upload.svg'} alt="" />
                  <span>{logoFile ? 'Cambiar logo' : 'Agregar logo'}</span>
                </button>
                {logoPreview && (
                  <div className="branch-form-logo-preview">
                    <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                {logoPreview && isEditing && activeSection === 'generales' && (
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
            </div>
            <div className="professional-profile-fields">              
              <InputField2
                type="text"
                placeholder="Nombre"
                value={properties.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Nombre"
              />
              <InputField2
                type="text"
                placeholder="Razón social"
                value={properties.social_reason}
                onChange={(e) => handleInputChange('social_reason', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Razón social"
              />          
              <Select
                disabled={!(isEditing && activeSection === 'generales')}
                placeholder="Seleccionar"
                value={properties.fiscal_condition}
                onChange={(value) => handleInputChange('fiscal_condition', value)}
                options={[                  
                  { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
                  { value: 'Monotributo', label: 'Monotributista' },
                  { value: 'Exento', label: 'Exento' },
                  { value: 'Consumidor Final', label: 'Consumidor Final' },
                  { value: 'No Responsable', label: 'No Responsable' }
                ]}                
              />
              <InputField2
                type="text"
                placeholder="Número de matrícula"
                value={properties.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Número de matrícula"
              />
              <InputField2
                type="email"
                placeholder="Email"
                value={properties.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Email"
              />
              <InputField2
                type="tel"
                placeholder="Teléfono"
                value={properties.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Teléfono"
              />
              <InputField2
                type="tel"
                placeholder="Teléfono adicional"
                value={properties.alternative_phone}
                onChange={(e) => handleInputChange('alternative_phone', e.target.value)}
                disabled={!(isEditing && activeSection === 'generales')}
                label="Teléfono adicional"
              />
            </div>
          </section>

          <hr className="professional-profile-divider" />

          {/* Ubicación Section */}
          <section className="professional-profile-section">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Ubicación</h2>
              <button
                className="professional-profile-edit-button"
                onClick={() => handleEditSection('ubicacion')}
              >
                <img src={iconEditPencil} alt="Edit" />
              </button>
            </div>

            <div className="professional-profile-fields">
              <InputField2
                type="text"
                placeholder="Dirección"
                value={properties.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!(isEditing && activeSection === 'ubicacion')}
                label="Dirección"
              />              
              <Select
                label=""
                options={provinceOptions}
                value={state_id ? state_id.toString() : undefined}
                onChange={(v) => { setState_id(v ? parseInt(v) : undefined); setLocation_id(undefined); setSub_location_id(undefined); }}
                placeholder={loadingProvinces ? 'Cargando provincias...' : 'Seleccionar provincia'}
                disabled={!(isEditing && activeSection === 'ubicacion') || loadingProvinces}
              />
              <Select
                label=""
                options={locationOptions}
                value={location_id ? location_id.toString() : undefined}
                onChange={(v) => { setLocation_id(v ? parseInt(v) : undefined); setSub_location_id(undefined); }}
                placeholder={loadingLocations ? 'Cargando barrios...' : 'Seleccionar barrio'}
                disabled={!(isEditing && activeSection === 'ubicacion') || !state_id || loadingLocations}
              />
              {zoneOptions.length > 0 && (
                <Select
                  label=""
                  options={zoneOptions}
                  value={sub_location_id ? sub_location_id.toString() : undefined}
                  onChange={(v) => setSub_location_id(v ? parseInt(v) : undefined)}
                  placeholder={loadingZones ? 'Cargando zonas...' : 'Seleccionar zona'}
                  disabled={!(isEditing && activeSection === 'ubicacion') || !location_id || loadingZones}
                />
              )}
              
            </div>
          </section>

          <hr className="professional-profile-divider" />

          {/* Descripción Section }
          <section className="professional-profile-section descripcion">
            <div className="professional-profile-section-header">
              <h2 className="professional-profile-section-title">Descripción</h2>
              <button
                className="professional-profile-edit-button"
                onClick={() => handleEditSection('descripcion')}
              >
                <img src={iconEditPencil} alt="Edit" />
              </button>
            </div>

            <InputField2
              multiline={true}
              rows={5}
              placeholder="Descripción"
              value={properties.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={!(isEditing && activeSection === 'descripcion')}
              label="Descripción"
            />
          </section> */}

          {/* Save Button */}
          {isEditing && (<div className="professional-profile-save-button-mobile-container"> 
            <Button label={updateOrganizationMutation.isPending ? 'Guardando...' : 'Guardar cambios'} className="w-full" onClick={handleSave} disabled={updateOrganizationMutation.isPending} />
          </div>)}

          {successMessage && (
            <div className="profile-feedback profile-feedback--success">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="profile-feedback profile-feedback--error">{errorMessage}</div>
          )}
        </div>
      </div>
  );
}
