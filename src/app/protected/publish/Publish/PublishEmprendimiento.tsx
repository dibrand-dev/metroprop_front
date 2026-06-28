'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './PublishContent.scss';
import EmprendimientoImages, { EmprendimientoImagesRef } from './EmprendimientoImages';
import EmprendimientoTabs, { EmprendimientoStep } from './EmprendimientoTabs';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import LocationCascadeSelects, { LocationCascadeValue, LocationCascadeNames } from '@/components/LocationCascadeSelects/LocationCascadeSelects';
import Button from '@/ui/Button/Button';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import './PublishEmprendimiento.scss';
import InputField from '@/ui/InputField/InputField';
import { API_BASE_URL } from '@/utils/utils';
import PublishLocationMap from './PublishLocationMap/PublishLocationMap';
import { CreatePropertyDraft, DevelopmentType, LABELS_DEVELOPMENT_TYPE, PropertyType, VideoPreview } from '@/types/propiedad';
import { apiFetch } from '@/lib/apiFetch';
 
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
    if (val.trim().length < 3 || !serviceRef.current) return;
    debounceRef.current = setTimeout(() => {
      serviceRef.current!.getPlacePredictions(
        { input: val, types: ['address'], componentRestrictions: { country: 'ar' }, language: 'es' },
        (predictions, status) => {
          if (status === 'OK' && predictions?.length) { setSuggestions(predictions); setOpen(true); }
        }
      );
    }, 500);
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
      <label htmlFor="address-autocomplete" className="input-label">
        Calle y número*
      </label>
      <InputField2
        id="address-autocomplete"
        ref={inputRef}
        type="text"
        label="Dirección"
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
  onSaveAndExit: (emprendimientoUpdate: Partial<CreatePropertyDraft>) => void;
  goToStep: (step: EmprendimientoStep) => void;
}

export default function PublishEmprendimiento({
  wizardData,
  updateWizardData,
  onNext,
  onSaveAndExit,
  goToStep,
}: PublishEmprendimientoProps) {

  // General data state
  const [nombreEmprendimiento, setNombreEmprendimiento] = useState(wizardData.publication_title || '');
  const [descripcion, setDescripcion] = useState(wizardData.description || '');
  //const [logoFile, setLogoFile] = useState<File | null>(null);
  const [tipoEmprendimiento, setTipoEmprendimiento] = useState<DevelopmentType | null>(wizardData.development_type || null);
  const [totalUnidades, setTotalUnidades] = useState<number | null>(wizardData.development_units_total || null);
  const [entrega, setEntrega] = useState(wizardData.development_delivery_date || '');

  // Location state
  const [street, setStreet] = useState(wizardData.street || '');
  const [postal_code, setPostal_code] = useState(wizardData.postal_code || '');
  const [locationData, setLocationData] = useState<LocationCascadeValue>({
    state_id: wizardData.state_id || undefined,
    location_id: wizardData.location_id || undefined,
    sub_location_id: wizardData.sub_location_id || undefined,
    neighborhood_id: wizardData.neighborhood_id || undefined,
    sub_neighborhood_id: wizardData.sub_neighborhood_id || undefined,
  });
  const [locationNames, setLocationNames] = useState<LocationCascadeNames>({
    stateName: '', locationName: '', subLocationName: '', neighborhoodName: '', subNeighborhoodName: '',
  });
  const [geo_lat, setGeo_lat] = useState<number | undefined>(wizardData.geo_lat || undefined);
  const [geo_long, setGeo_long] = useState<number | undefined>(wizardData.geo_long || undefined);
  const [show_exact_location, setShow_exact_location] = useState(wizardData.show_exact_location || false);
  const [hasSelectedAddress, setHasSelectedAddress] = useState(!!wizardData.street);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [pendingStateName, setPendingStateName] = useState('');
  const [pendingCityName, setPendingCityName] = useState('');

  // Images component ref
  const imagesRef = useRef<EmprendimientoImagesRef>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  const [hasPlans, setHasPlans] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isFormValid = nombreEmprendimiento.trim() !== '' && entrega.trim() !== '' && tipoEmprendimiento !== null && totalUnidades !== null && hasImages && hasSelectedAddress;
  useEffect(() => {
    setTipoEmprendimiento(wizardData.development_type || null);
  }, [wizardData.development_type]);

  const handleImagesStatusChange = useCallback((status: { hasImages: boolean; hasPlans: boolean }) => {
    setHasImages(status.hasImages);
    setHasPlans(status.hasPlans);
  }, []);

  // Load already-uploaded multimedia into the images component (mirrors PublishContent behaviour)
  useEffect(() => {
    if (!wizardData.draft_id) return;
    apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}/multimedia`)
      .then(data => {
        const imgs = (data as any)?.images;
        const attached = (data as any)?.attached;
        if (imgs && Array.isArray(imgs) && imgs.length > 0) {
          imagesRef.current?.setExistingImages(imgs, attached ?? []);
          updateWizardData({ images: imgs, attached: attached ?? [] });
        }
      })
      .catch(err => console.error('Error loading existing multimedia:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardData.draft_id]);

  // Update wizard data when location data changes
  useEffect(() => {
    updateWizardData({
      street,
      country_id: 1,
      state_id: locationData.state_id,
      location_id: locationData.location_id,
      sub_location_id: locationData.sub_location_id,
      neighborhood_id: locationData.neighborhood_id,
      sub_neighborhood_id: locationData.sub_neighborhood_id,
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
  }, [street, locationData, postal_code, show_exact_location, geo_lat, geo_long, nombreEmprendimiento, descripcion, tipoEmprendimiento, totalUnidades, entrega]);

/*  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
  };*/

  const fullMapAddress = useMemo(() => {
    return [street, locationNames.subNeighborhoodName, locationNames.neighborhoodName, locationNames.subLocationName, locationNames.locationName, locationNames.stateName, 'Argentina'].filter(Boolean).join(', ');
  }, [street, locationNames]);

  const handlePlaceSelect = useCallback((data: PlaceData) => {
    setStreet(data.street);
    setMapInteractive(false);
    setLocationData({ state_id: undefined, location_id: undefined, sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
    let stateName = data.stateName;
    if (stateName === 'Ciudad Autónoma de Buenos Aires') stateName = 'Capital Federal';
    setPendingStateName(stateName);
    setPendingCityName(data.cityName);
  }, []);

  const handleContinuar = async (nextStep: boolean) => {
    setSubmitted(true);
    if (!isFormValid) return;
    if (hasImages || hasPlans) {
      setIsUploading(true);
      try {
        await imagesRef.current?.submit();
        // Re-fetch so wizardData.images is up to date for the preview step
        if (wizardData.draft_id) {
          const mediaData = await apiFetch(`${API_BASE_URL}/properties/${wizardData.draft_id}/multimedia`);
          const imgs = (mediaData as any)?.images;
          const attached = (mediaData as any)?.attached;
          if (imgs && Array.isArray(imgs)) {
            imagesRef.current?.setExistingImages(imgs, attached ?? []);
            updateWizardData({ images: imgs, attached: attached ?? [] });
          }
        }
      } catch {
        alert('Error al subir los archivos. Por favor, intenta nuevamente.');
      } finally {
        setIsUploading(false);
      }
    }
    if (nextStep) {
      onNext(wizardData);
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
        <EmprendimientoTabs currentStep="emprendimiento" goToStep={async (step) => { await handleContinuar(false); goToStep(step); }} disabled={isUploading || !isFormValid} />

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
                  error={submitted && !nombreEmprendimiento.trim() ? 'Este campo es obligatorio' : ''}
                />
                <span className="character-count">{nombreEmprendimiento.length}/100</span>
              </div>
            </div>

            <div className="form-group">
              <div className="form-field full-width">
                <label className="field-label">Descripción</label>
                <textarea
                  className="textarea-field"
                  placeholder="Contanos sobre el emprendimiento"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={6}
                  maxLength={10000}
                />               
              </div>
            </div>

            {/*<div className="form-group">
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
            </div>*/}

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <Select
                    label="Tipo de emprendimiento*"
                    options={Object.entries(LABELS_DEVELOPMENT_TYPE).map(([value, label]) => ({ value, label }))}
                    value={tipoEmprendimiento ? String(tipoEmprendimiento) : undefined}
                    onChange={(value) => setTipoEmprendimiento(value ? parseInt(value) as DevelopmentType : null)}
                    placeholder="Seleccionar"
                    error={submitted && !tipoEmprendimiento ? 'Este campo es obligatorio' : ''}
                  />
                </div>                
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="form-field half-width">
                  <InputField
                    label="Total de unidades*"
                    type='number'
                    value={totalUnidades ?? null}
                    onChange={e => setTotalUnidades(Number(e.target.value) || null)}
                    placeholder="Total de unidades"
                    error={submitted && !totalUnidades ? 'Este campo es obligatorio' : ''}
                  />                  
                </div>
                <div className="form-field half-width">
                  <InputField
                    label="Fecha de entrega*"
                    type='date'
                    value={entrega}
                    onChange={e => setEntrega((e.target as HTMLInputElement).value)}
                    placeholder="Seleccionar"
                    error={submitted && !entrega ? 'Este campo es obligatorio' : ''}
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
              <LocationCascadeSelects
                value={locationData}
                onChange={setLocationData}
                onNamesChange={setLocationNames}
                disabled={!hasSelectedAddress}
                provinceRequired
                pendingStateName={pendingStateName}
                pendingCityName={pendingCityName}
                onPendingResolved={(field) => {
                  if (field === 'state') setPendingStateName('');
                  else setPendingCityName('');
                }}
              />
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
                    interactive={mapInteractive}
                    onActivate={() => setMapInteractive(true)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Images Section */}
          <EmprendimientoImages
            ref={imagesRef}
            draftId={wizardData.draft_id}
            onUploadStatusChange={handleImagesStatusChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            label="Guardar como borrador"
            variant="secondary"
            buttonType="2"
            onClick={() => handleContinuar(false)}
            fullWidth={false}
            disabled={isUploading || !isFormValid}
          />
          <Button
            label={isUploading ? 'Subiendo...' : 'Continuar'}
            variant="primary"
            buttonType="2"
            onClick={() => handleContinuar(true)}
            fullWidth={false}
            disabled={isUploading || !isFormValid}
          />
        </div>
      </div>
    </div>
    </APIProvider>
  );
}
