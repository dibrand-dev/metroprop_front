'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import './PublishEmprendimiento.scss';
import InputField from '@/ui/InputField/InputField';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import PublishLocationMap from './PublishLocationMap/PublishLocationMap';
import { CreateImage, CreateImagePlans, CreatePropertyDraft, DevelopmentType, LABELS_DEVELOPMENT_TYPE, PropertyType } from '@/types/propiedad';
import { apiFetch } from '@/lib/apiFetch';

const iconTrash = '/icons/trash.svg';
const iconUpload = '/icons/upload.svg';
const iconChevronUp = '/icons/chevron-up.svg';

const emprendimientoAccordionItems = [
  { id: 'planos', title: 'Planos', description: 'Formato HEIC, JFIF, PNG, JPG, JPEG, WEBP, PDF, máximo 20 MB.' },
  { id: 'recorrido', title: 'Recorrido 360', description: 'Agrega un recorrido 360° para mostrar los detalles de la propiedad.' },
];

// ── Address autocomplete ──────────────────────────────────────────────────────
interface PlaceData {
  street: string;
  countryName: string;
  stateName: string;
  cityName: string;
}

function AddressAutocompleteInput({ value, onChange, onPlaceSelect, onSuggestionSelectionChange, disabled }: {
  value: string;
  onChange: (val: string) => void;
  onPlaceSelect?: (data: PlaceData) => void;
  onSuggestionSelectionChange?: (selected: boolean) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const attrDivRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (placesLib) {
      if (!serviceRef.current) serviceRef.current = new placesLib.AutocompleteService();
      if (!placesServiceRef.current && attrDivRef.current)
        placesServiceRef.current = new placesLib.PlacesService(attrDivRef.current);
    }
  }, [placesLib]);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current)
      inputRef.current.value = value;
  }, [value]);

  const handleChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    onSuggestionSelectionChange?.(false);
    setSuggestions([]);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || !serviceRef.current) return;
    debounceRef.current = setTimeout(() => {
      serviceRef.current!.getPlacePredictions(
        { input: val, types: ['address'], componentRestrictions: { country: 'ar' }, language: 'es' },
        (predictions, status) => {
          if (status === 'OK' && predictions?.length) { setSuggestions(predictions); setOpen(true); }
        }
      );
    }, 300);
  };

  const handleSelect = useCallback((prediction: google.maps.places.AutocompletePrediction) => {
    const fallbackStreet = prediction.description.split(',')[0].trim();
    onSuggestionSelectionChange?.(true);
    onChange(fallbackStreet);
    if (inputRef.current) inputRef.current.value = fallbackStreet;
    setSuggestions([]);
    setOpen(false);
    if (!placesServiceRef.current) return;
    placesServiceRef.current.getDetails(
      { placeId: prediction.place_id, fields: ['address_components'] },
      (place, status) => {
        if (status !== 'OK' || !place?.address_components) return;
        const comps = place.address_components;
        const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name ?? '';
        const route = get('route');
        const streetNum = get('street_number');
        const street = route ? (streetNum ? `${route} ${streetNum}` : route) : fallbackStreet;
        onChange(street);
        if (inputRef.current) inputRef.current.value = street;
        onPlaceSelect?.({
          street,
          countryName: get('country'),
          stateName: get('administrative_area_level_1'),
          cityName: get('locality') || get('sublocality_level_1') || get('administrative_area_level_2'),
        });
      }
    );
  }, [onChange, onPlaceSelect, onSuggestionSelectionChange]);

  return (
    <div className="publish-location-autocomplete">
      <div ref={attrDivRef} style={{ display: 'none' }} aria-hidden="true" />
      <InputField2
        ref={inputRef}
        type="text"
        label="Calle y número*"
        placeholder="Dirección"
        value={value}
        onChange={handleChangeAddress}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        disabled={disabled}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="publish-location-suggestions" role="listbox">
          {suggestions.map((p) => (
            <li key={p.place_id} className="publish-location-suggestion-item" role="option" onMouseDown={() => handleSelect(p)}>
              <span className="suggestion-main">{p.structured_formatting.main_text}</span>
              <span className="suggestion-secondary">{p.structured_formatting.secondary_text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function findBestMatch(options: { value: string; label: string }[], name: string): string | undefined {
  if (!name) return undefined;
  const norm = name.toLowerCase().trim();
  const exact = options.find(o => o.label.toLowerCase().trim() === norm);
  if (exact) return exact.value;
  return options.find(o => { const l = o.label.toLowerCase().trim(); return l.includes(norm) || norm.includes(l); })?.value;
}

interface PublishEmprendimientoProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (emprendimientoUpdate: Partial<CreatePropertyDraft>) => void;
  onBack: () => void;
}

export default function PublishEmprendimiento({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishEmprendimientoProps) {

  // General data state
  const [nombreEmprendimiento, setNombreEmprendimiento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [tipoEmprendimiento, setTipoEmprendimiento] = useState<DevelopmentType | null>(null);
  const [totalUnidades, setTotalUnidades] = useState<number | null>(null);
  const [entrega, setEntrega] = useState('');

  // Location state
  const [street, setStreet] = useState('');
  const [postal_code, setPostal_code] = useState('');
  const [country_id, setCountry_id] = useState<number | undefined>(undefined);
  const [state_id, setState_id] = useState<number | undefined>(undefined);
  const [location_id, setLocation_id] = useState<number | undefined>(undefined);
  const [sub_location_id, setSub_location_id] = useState<number | undefined>(undefined);
  const [geo_lat, setGeo_lat] = useState<number | undefined>(undefined);
  const [geo_long, setGeo_long] = useState<number | undefined>(undefined);
  const [show_exact_location, setShow_exact_location] = useState(false);
  const [hasSelectedAddress, setHasSelectedAddress] = useState(false);
  const [pendingStateName, setPendingStateName] = useState('');
  const [pendingCityName, setPendingCityName] = useState('');

  // Images / plans / multimedia state
  const [images, setImages] = useState<CreateImage[]>([]);
  const [plans, setPlans] = useState<CreateImagePlans[]>([]);
  const [multimedia360, setMultimedia360] = useState<string[]>(['']);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedPlans, setUploadedPlans] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<'image' | 'plan' | null>(null);
  const [dragOverGrid, setDragOverGrid] = useState<'image' | 'plan' | null>(null);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageGridInputRef = useRef<HTMLInputElement>(null);
  const plansInputRef = useRef<HTMLInputElement>(null);

  // Update wizard data when location data changes
  useEffect(() => {
    updateWizardData({
      street,
      country_id,
      state_id,
      location_id,
      sub_location_id,
      postal_code,
      show_exact_location,
      geo_lat,
      geo_long,
      publication_title: nombreEmprendimiento,
      description: descripcion,
      development_type: tipoEmprendimiento,
      development_units_total: totalUnidades,
      development_delivery_date: entrega,
      property_type: PropertyType.EMPRENDIMIENTO,
      is_development: true
    });
  }, [street, country_id, state_id, location_id, sub_location_id, postal_code, show_exact_location, geo_lat, geo_long, nombreEmprendimiento, descripcion, tipoEmprendimiento, totalUnidades, entrega]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
  };

  const validateFile = (file: File, type: 'image' | 'plan'): boolean => {
    if (file.size > 20 * 1024 * 1024) { alert('El archivo excede el tamaño máximo de 20MB'); return false; }
    const imageFormats = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png'];
    const planFormats = ['image/heic', 'image/jfif', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    const allowed = type === 'image' ? imageFormats : planFormats;
    if (!allowed.includes(file.type)) {
      alert(`Formato no permitido. Solo se aceptan: ${type === 'image' ? 'JPG, JPEG, WEBP, PNG' : 'HEIC, JFIF, PNG, JPG, JPEG, WEBP, PDF'}`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'plan') => {
    const files = event.target.files;
    if (!files) return;
    const valid: File[] = [];
    for (let i = 0; i < files.length; i++) if (validateFile(files[i], type)) valid.push(files[i]);
    if (type === 'image') setUploadedImages(prev => [...prev, ...valid]);
    else setUploadedPlans(prev => [...prev, ...valid]);
    event.target.value = '';
  };

  const removeUploadedFile = (index: number, type: 'image' | 'plan') => {
    if (type === 'image') setUploadedImages(prev => prev.filter((_, i) => i !== index));
    else setUploadedPlans(prev => prev.filter((_, i) => i !== index));
  };

  const removePlan = (index: number, from: 'api' | 'local') => {
    if (from === 'api') setPlans(prev => prev.filter((_, i) => i !== index));
    else removeUploadedFile(index, 'plan');
  };

  const handleDragStart = (e: React.DragEvent, index: number, type: 'image' | 'plan') => {
    setDraggedIndex(index); setDraggedType(type); e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleGridDragOver = (e: React.DragEvent, type: 'image' | 'plan') => {
    e.preventDefault();
    if (draggedType === type) { setDragOverGrid(type); e.dataTransfer.dropEffect = 'move'; }
  };
  const handleGridDragLeave = (e: React.DragEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom) setDragOverGrid(null);
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number, type: 'image' | 'plan') => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type) return;
    if (type === 'image') {
      type IE = { kind: 'api'; data: CreateImage } | { kind: 'local'; data: File };
      const unified: IE[] = [
        ...images.map(d => ({ kind: 'api' as const, data: d })),
        ...uploadedImages.map(d => ({ kind: 'local' as const, data: d })),
      ];
      const item = unified[draggedIndex]; unified.splice(draggedIndex, 1); unified.splice(dropIndex, 0, item);
      setImages(unified.filter(e => e.kind === 'api').map(e => e.data as CreateImage));
      setUploadedImages(unified.filter(e => e.kind === 'local').map(e => e.data as File));
    } else {
      const arr = [...uploadedPlans]; const item = arr[draggedIndex]; arr.splice(draggedIndex, 1); arr.splice(dropIndex, 0, item); setUploadedPlans(arr);
    }
    setDraggedIndex(null); setDraggedType(null); setDragOverGrid(null);
  };
  const handleDragEnd = () => { setDraggedIndex(null); setDraggedType(null); setDragOverGrid(null); };

  const addUrl = (index: number) => {
    if (!multimedia360[index]?.trim() || multimedia360.length >= 10) return;
    setMultimedia360(prev => [...prev, '']);
  };
  const removeUrl = (index: number) => {
    if (multimedia360.length > 1) setMultimedia360(prev => prev.filter((_, i) => i !== index));
  };
  const updateUrl = (index: number, value: string) => {
    setMultimedia360(prev => prev.map((item, i) => i === index ? value : item));
  };

  const uploadMultimediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}/save-multimedia`, { method: 'POST', body: formData });
    },
  });

  const handleFormSubmit = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      images.forEach(img => { if (img.url) formData.append('images', setImagePath(img.url)); });
      uploadedImages.forEach(file => formData.append('images', file));
      plans.forEach(plan => { if (plan.file_url) formData.append('attached', setImagePath(plan.file_url)); });
      uploadedPlans.forEach(file => formData.append('attached', file));
      formData.append('multimedia360', JSON.stringify(multimedia360));
      const result = await uploadMultimediaMutation.mutateAsync(formData);
      if (result.images) setImages(result.images);
      onNext(wizardData);
    } catch {
      alert('Error al subir los archivos. Por favor, intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Location queries ──────────────────────────────────────────────────────
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/countries`),
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

  const countryOptions = useMemo(() => countries.map((c: any) => ({ value: c.id.toString(), label: c.name })), [countries]);
  const provinceOptions = useMemo(() => provinces.map((p: any) => ({ value: p.id.toString(), label: p.name })), [provinces]);
  const locationOptions = useMemo(() => locations.map((l: any) => ({ value: l.id.toString(), label: l.name })), [locations]);
  const zoneOptions = useMemo(() => zones.map((z: any) => ({ value: z.id.toString(), label: z.name })), [zones]);

  const fullMapAddress = useMemo(() => {
    type Opt = { value: string; label: string };
    const countryName = countryOptions.find((o: Opt) => o.value === country_id?.toString())?.label ?? '';
    const stateName = provinceOptions.find((o: Opt) => o.value === state_id?.toString())?.label ?? '';
    const locationName = locationOptions.find((o: Opt) => o.value === location_id?.toString())?.label ?? '';
    const zoneName = zoneOptions.find((o: Opt) => o.value === sub_location_id?.toString())?.label ?? '';
    return [street, zoneName, locationName, stateName, countryName].filter(Boolean).join(', ');
  }, [street, country_id, state_id, location_id, sub_location_id, countryOptions, provinceOptions, locationOptions, zoneOptions]);

  const handlePlaceSelect = useCallback((data: PlaceData) => {
    setStreet(data.street);
    const countryMatch = findBestMatch(countryOptions, data.countryName);
    if (countryMatch) {
      setCountry_id(parseInt(countryMatch));
      setState_id(undefined);
      setLocation_id(undefined);
      setSub_location_id(undefined);
    }
    let stateName = data.stateName;
    if (stateName === 'Ciudad Autónoma de Buenos Aires') stateName = 'Capital Federal';
    setPendingStateName(stateName);
    setPendingCityName(data.cityName);
  }, [countryOptions]);

  useEffect(() => {
    if (!pendingStateName || provinceOptions.length === 0) return;
    const match = findBestMatch(provinceOptions, pendingStateName);
    if (match) { setState_id(parseInt(match)); setPendingStateName(''); setLocation_id(undefined); setSub_location_id(undefined); }
  }, [provinceOptions, pendingStateName]);

  useEffect(() => {
    if (!pendingCityName || locationOptions.length === 0) return;
    const match = findBestMatch(locationOptions, pendingCityName);
    if (match) { setLocation_id(parseInt(match)); setPendingCityName(''); setSub_location_id(undefined); }
  }, [locationOptions, pendingCityName]);

  const handleGuardarBorrador = () => { onBack(); };

  const handleContinuar = async () => {
    if (uploadedImages.length > 0 || uploadedPlans.length > 0) {
      await handleFormSubmit();
    } 
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
    <div className="publish-emprendimiento">
      <div className="publish-emprendimiento-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-text">Emprendimientos</span>
        </div>

        {/* Header */}
        <div className="header">
          <h1 className="title">Publicar emprendimiento</h1>
          <span className="required-text">Datos obligatorios(*)</span>
        </div>

        {/* Secondary Menu / Tabs */}
        <div className="secondary-menu">
          <button
            className="tab active"
          >
            Datos principales
          </button>
          <button
            className="tab"
            onClick={() => console.log('Navigate to amenidades')}
          >
            Amenidades
          </button>
          <button
            className="tab"
            onClick={() => console.log('Navigate to unidades')}
          >
            Unidades
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/tipos-de-unidad')}
          >
            Tipos de unidad
          </button>
          <button
            className="tab"
            onClick={() => router.push('/protected/publish/emprendimiento/vista-al-precio')}
          >
            Vista al precio
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* General Data Section */}
          <section className="section">
            <h2 className="section-title">Datos generales del emprendimiento</h2>

            <div className="form-group">
              <div className="form-field full-width">
                <InputField
                  label="Nombre del emprendimiento*"
                  placeholder="Título de la publicación*"
                  value={nombreEmprendimiento}
                  onChange={(e) => setNombreEmprendimiento(e.target.value)}
                  required
                />
                <span className="character-count">{nombreEmprendimiento.length}/100</span>
              </div>
            </div>

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Descripción*</label>
                <textarea
                  className="textarea-field"
                  placeholder="Contanos sobre el emprendimiento"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={6}
                  maxLength={10000}
                />
                <div className="textarea-footer">
                  {descripcion.length < 150 && (
                    <span className="helper-text">
                      La descripción debe tener al menos 150 caracteres
                    </span>
                  )}
                  <span className="character-count">{descripcion.length}/10000</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Agregar logo del emprendimiento</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="file-input"
                  />
                  <label htmlFor="logo-upload" className="file-label">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Agregar foto</span>
                  </label>
                  {logoFile && <span className="file-name">{logoFile.name}</span>}
                </div>
                <span className="helper-text">
                  Tamaño recomendado 138px por 75px. Peso máximo 200 KB.
                </span>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <Select
                    label="Tipo de emprendimiento"
                    options={Object.entries(LABELS_DEVELOPMENT_TYPE).map(([value, label]) => ({ value, label }))}
                    value={tipoEmprendimiento}
                    onChange={setTipoEmprendimiento}
                    placeholder="Seleccionar"
                  />
                </div>                
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <InputField
                    label="Total de unidades"
                    type='number'
                    value={totalUnidades}
                    onChange={e => setTotalUnidades(e.target.value)}
                    placeholder="Total de unidades"
                  />                  
                </div>
                <div className="form-field half-width">
                  <InputField
                    label="Fecha de entrega"
                    type='date'
                    value={entrega}
                    onChange={e => setEntrega((e.target as HTMLInputElement).value)}
                    placeholder="Seleccionar"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="section">
            <h2 className="section-title">Ubicación del emprendimiento</h2>

            {/* Address autocomplete */}
            <div className="form-group">
              <AddressAutocompleteInput
                value={street}
                onChange={setStreet}
                onPlaceSelect={handlePlaceSelect}
                onSuggestionSelectionChange={setHasSelectedAddress}
              />
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <Select
                    label="País*"
                    options={countryOptions}
                    value={country_id ? country_id.toString() : undefined}
                    onChange={(v) => { setCountry_id(v ? parseInt(v) : undefined); setState_id(undefined); setLocation_id(undefined); setSub_location_id(undefined); }}
                    placeholder={loadingCountries ? 'Cargando países...' : 'Seleccionar país'}
                    disabled={!hasSelectedAddress || loadingCountries}
                    required
                  />
                </div>
                <div className="form-field half-width">
                  <Select
                    label="Provincia*"
                    options={provinceOptions}
                    value={state_id ? state_id.toString() : undefined}
                    onChange={(v) => { setState_id(v ? parseInt(v) : undefined); setLocation_id(undefined); setSub_location_id(undefined); }}
                    placeholder={loadingProvinces ? 'Cargando provincias...' : 'Seleccionar provincia'}
                    disabled={!hasSelectedAddress || !country_id || loadingProvinces}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <Select
                    label="Localidad"
                    options={locationOptions}
                    value={location_id ? location_id.toString() : undefined}
                    onChange={(v) => { setLocation_id(v ? parseInt(v) : undefined); setSub_location_id(undefined); }}
                    placeholder={loadingLocations ? 'Cargando localidades...' : 'Seleccionar localidad'}
                    disabled={!hasSelectedAddress || !state_id || loadingLocations || locationOptions.length === 0}
                  />
                </div>
                <div className="form-field half-width">
                  {zoneOptions.length > 0 && (
                    <Select
                      label="Zona"
                      options={zoneOptions}
                      value={sub_location_id ? sub_location_id.toString() : undefined}
                      onChange={(v) => setSub_location_id(v ? parseInt(v) : undefined)}
                      placeholder={loadingZones ? 'Cargando zonas...' : 'Seleccionar zona'}
                      disabled={!hasSelectedAddress || !location_id || loadingZones}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <InputField2
                    label="Código postal"
                    placeholder="Código postal"
                    value={postal_code}
                    onChange={(e) => setPostal_code(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Map Preview */}
            <div className="form-group">
              <div className="map-section">
                <div className="map-header">
                  <h3 className="map-title">Vista previa del aviso</h3>
                  <div className="map-toggle">
                    <span className="toggle-label">Mostrar la ubicación exacta</span>
                    <SwitchToggle
                      checked={show_exact_location}
                      onChange={setShow_exact_location}
                    />
                  </div>
                </div>
                <div className="map-container">
                  <PublishLocationMap
                    fullAddress={hasSelectedAddress ? fullMapAddress : ''}
                    onStreetChange={setStreet}
                    onCoordinatesChange={(lat, lng) => { setGeo_lat(lat); setGeo_long(lng); }}
                    disabled={!hasSelectedAddress}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Images Section */}
          <section className="section">
            <h2 className="section-title">Agregar imágenes del emprendimiento</h2>

            {/* Fotos */}
            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Fotos</label>
                <span className="helper-text">Formato JPG, JPEG, WEBP, PNG, máximo 20 MB.</span>
                <input ref={imageInputRef} type="file" multiple accept=".jpg,.jpeg,.webp,.png" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'image')} />
                <input ref={imageGridInputRef} type="file" multiple accept=".jpg,.jpeg,.webp,.png" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'image')} />
                {images.length === 0 && uploadedImages.length === 0 ? (
                  <button type="button" className="publish-content-upload-card" onClick={() => imageInputRef.current?.click()}>
                    <img src={iconUpload} alt="" />
                    <span>Agregar fotos</span>
                  </button>
                ) : (
                  <div
                    className={`publish-content-upload-grid ${dragOverGrid === 'image' ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleGridDragOver(e, 'image')}
                    onDragLeave={handleGridDragLeave}
                    onDrop={(e) => { e.preventDefault(); setDragOverGrid(null); }}
                  >
                    <button type="button" className="publish-content-upload-card" onClick={() => imageGridInputRef.current?.click()}>
                      <img src={iconUpload} alt="" />
                      <span>Agregar fotos</span>
                    </button>
                    {images.map((image, index) => {
                      const isCompleted = image.upload_status === 'completed';
                      const isUp = image.upload_status === 'uploading' || image.upload_status === 'pending';
                      const hasError = image.upload_status === 'failed' || image.error_message;
                      return (
                        <div key={`${image.id || image.url}-${index}`}
                          className={`publish-content-thumb ${hasError ? 'has-error' : ''} ${draggedIndex === index && draggedType === 'image' ? 'dragging' : ''}`}
                          draggable onDragStart={(e) => handleDragStart(e, index, 'image')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index, 'image')} onDragEnd={handleDragEnd}
                        >
                          {index === 0 && <div className="publish-content-thumb-main-label">Foto principal</div>}
                          {isUp ? <div className="publish-content-upload-loading"><div className="spinner" /><span>Subiendo...</span></div>
                            : isCompleted ? <img src={setImagePath(image.url)} alt="Foto" />
                            : hasError ? <div className="publish-content-upload-error"><span className="error-icon">!</span><small>{image.error_message || 'Error'}</small></div>
                            : null}
                          <button type="button" className="publish-content-thumb-action" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}><img src={iconTrash} alt="" /></button>
                        </div>
                      );
                    })}
                    {uploadedImages.map((file, index) => {
                      const ui = images.length + index;
                      return (
                        <div key={`up-img-${index}`}
                          className={`publish-content-thumb ${draggedIndex === ui && draggedType === 'image' ? 'dragging' : ''}`}
                          draggable onDragStart={(e) => handleDragStart(e, ui, 'image')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, ui, 'image')} onDragEnd={handleDragEnd}
                        >
                          {ui === 0 && <div className="publish-content-thumb-main-label">Foto principal</div>}
                          <img src={URL.createObjectURL(file)} alt="Foto" />
                          <button type="button" className="publish-content-thumb-action" onClick={() => removeUploadedFile(index, 'image')}><img src={iconTrash} alt="" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Planos + Recorrido 360 accordion */}
            <div className="form-group">
              <div className="publish-content-accordion">
                {emprendimientoAccordionItems.map((item) => (
                  <div key={item.id} className={`publish-content-accordion-item ${openAccordions.includes(item.id) ? 'is-open' : ''}`}>
                    <button type="button" className="publish-content-accordion-header" onClick={() => setOpenAccordions(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}>
                      <span>{item.title}</span>
                      <div className="chevron-container"><img src={iconChevronUp} alt="" /></div>
                    </button>
                    {openAccordions.includes(item.id) && (
                      <div className="publish-content-accordion-body">
                        <p>{item.description}</p>
                        {item.id === 'planos' && (
                          <div
                            className={`publish-content-upload-grid compact ${dragOverGrid === 'plan' ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleGridDragOver(e, 'plan')}
                            onDragLeave={handleGridDragLeave}
                            onDrop={(e) => { e.preventDefault(); setDragOverGrid(null); }}
                          >
                            <input ref={plansInputRef} type="file" multiple accept=".heic,.jfif,.png,.jpg,.jpeg,.webp,.pdf" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'plan')} />
                            <button type="button" className="publish-content-upload-card" onClick={() => plansInputRef.current?.click()}>
                              <img src={iconUpload} alt="" />
                              <span>Agregar planos</span>
                            </button>
                            {plans.map((plan, index) => {
                              const isCompleted = plan.upload_status === 'completed';
                              const isUp = plan.upload_status === 'uploading' || plan.upload_status === 'pending';
                              const hasError = plan.upload_status === 'failed' || plan.error_message;
                              return (
                                <div key={`${plan.id || plan.file_url}-${index}`} className={`publish-content-thumb ${hasError ? 'has-error' : ''}`}>
                                  {isUp ? <div className="publish-content-upload-loading"><div className="spinner" /><span>Subiendo...</span></div>
                                    : isCompleted ? (plan.file_url?.toLowerCase().endsWith('.pdf')
                                      ? <div className="publish-content-pdf-thumb"><span>PDF</span><small>{plan.file_url.split('/').pop()}</small></div>
                                      : <img src={plan.file_url} alt="Plano" />)
                                    : hasError ? <div className="publish-content-upload-error"><span className="error-icon">!</span><small>{plan.error_message || 'Error'}</small></div>
                                    : null}
                                  <button type="button" className="publish-content-thumb-action" onClick={() => removePlan(index, 'api')}><img src={iconTrash} alt="" /></button>
                                </div>
                              );
                            })}
                            {uploadedPlans.map((file, index) => {
                              const pi = (plans.length) + index;
                              return (
                                <div key={`up-plan-${index}`}
                                  className={`publish-content-thumb ${draggedIndex === pi && draggedType === 'plan' ? 'dragging' : ''}`}
                                  draggable onDragStart={(e) => handleDragStart(e, pi, 'plan')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, pi, 'plan')} onDragEnd={handleDragEnd}
                                >
                                  {file.type === 'application/pdf'
                                    ? <div className="publish-content-pdf-thumb"><span>PDF</span><small>{file.name}</small></div>
                                    : <img src={URL.createObjectURL(file)} alt="Plan" />}
                                  <button type="button" className="publish-content-thumb-action" onClick={() => removeUploadedFile(index, 'plan')}><img src={iconTrash} alt="" /></button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {item.id === 'recorrido' && (
                          <div className="publish-content-videos-container">
                            {multimedia360.map((url, index) => (
                              <div key={index} className="publish-content-input-row">
                                <InputField
                                  placeholder="Copiá y pegá la URL del recorrido acá"
                                  value={url}
                                  onChange={(e) => updateUrl(index, e.target.value)}
                                />
                                {index === multimedia360.length - 1 && multimedia360.length < 10 ? (
                                  <Button label="Agregar" variant="primary" buttonType="1" onClick={() => addUrl(index)} disabled={!url.trim()} />
                                ) : (
                                  <button type="button" className="publish-content-remove-btn" onClick={() => removeUrl(index)} aria-label="Eliminar">
                                    <img src={iconTrash} alt="" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {multimedia360.length >= 10 && <p className="publish-content-limit-message">Máximo 10 recorridos permitidos</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Guardar como borrador"
            variant="secondary"
            buttonType="2"
            onClick={handleGuardarBorrador}
            fullWidth={false}
          />
          <Button
            label={isUploading ? 'Subiendo...' : 'Continuar'}
            variant="primary"
            buttonType="2"
            onClick={handleContinuar}
            fullWidth={false}
            disabled={isUploading || uploadedImages.length === 0 || uploadedPlans.length === 0}
          />
        </div>
      </div>
    </div>
    </APIProvider>
  );
}
