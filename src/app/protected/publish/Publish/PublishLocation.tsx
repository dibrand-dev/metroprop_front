'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import './PublishLocation.scss';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import InputField from '@/ui/InputField/InputField';
import { API_BASE_URL } from '@/utils/utils';
import LocationCascadeSelects, { LocationCascadeValue, LocationCascadeNames } from '@/components/LocationCascadeSelects/LocationCascadeSelects';
import { 
  OPERATION_TYPE_LABELS, 
  PROPERTY_TYPE_LABELS, 
  PROPERTY_SUBTYPE_LABELS, 
  CreatePropertyDraft
} from '@/types/propiedad';
import PublishLocationMap from './PublishLocationMap/PublishLocationMap';
import InputField2 from '@/ui/InputField2/InputField2';
import { apiFetch } from '@/lib/apiFetch';
import Button from '@/ui/Button/Button';

const iconChevron = '/icons/chevron-up.svg';
const iconClose = '/icons/close.svg';

// ── Address autocomplete input ───────────────────────────────────────────────
interface PlaceData {
  street: string;
  countryName: string;
  stateName: string;
  cityName: string;
}

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onPlaceSelect?: (data: PlaceData) => void;
  onSuggestionSelectionChange?: (selected: boolean) => void;
  disabled?: boolean;
}

function AddressAutocompleteInput({ value, onChange, onPlaceSelect, onSuggestionSelectionChange, disabled }: AddressAutocompleteInputProps) {
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
      if (!placesServiceRef.current && attrDivRef.current) {
        placesServiceRef.current = new placesLib.PlacesService(attrDivRef.current);
      }
    }
  }, [placesLib]);

  // Keep input value in sync when parent sets it (e.g. after drag reverse-geocode)
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    onSuggestionSelectionChange?.(false);
    setSuggestions([]);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3 || !serviceRef.current) return;
    debounceRef.current = setTimeout(() => {
      serviceRef.current!.getPlacePredictions(
        {
          input: val,
          types: ['address'],
          componentRestrictions: { country: 'ar' },
          language: 'es',
        },
        (predictions, status) => {
          if (status === 'OK' && predictions?.length) {
            setSuggestions(predictions);
            setOpen(true);
          }
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
        const countryName = get('country');
        const stateName = get('administrative_area_level_1');
        const cityName =
          get('locality') ||
          get('sublocality_level_1') ||
          get('administrative_area_level_2');
        onChange(street);
        if (inputRef.current) inputRef.current.value = street;
        onPlaceSelect?.({ street, countryName, stateName, cityName });
      }
    );
  }, [onChange, onPlaceSelect, onSuggestionSelectionChange]);

  const handleBlur = () => {
    // Small delay so onClick on suggestion fires before blur hides it
    setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="publish-location-autocomplete">
      {/* Hidden div required by PlacesService for API attribution */}
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
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        disabled={disabled}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="publish-location-suggestions" role="listbox">
          {suggestions.map((p) => (
            <li
              key={p.place_id}
              className="publish-location-suggestion-item"
              role="option"
              onMouseDown={() => handleSelect(p)}
            >
              <span className="suggestion-main">{p.structured_formatting.main_text}</span>
              <span className="suggestion-secondary">{p.structured_formatting.secondary_text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function findBestMatch(
  options: { value: string; label: string }[],
  name: string
): string | undefined {
  if (!name) return undefined;
  const norm = name.toLowerCase().trim();
  const exact = options.find(o => o.label.toLowerCase().trim() === norm);
  if (exact) return exact.value;
  const partial = options.find(o => {
    const l = o.label.toLowerCase().trim();
    return l.includes(norm) || norm.includes(l);
  });
  return partial?.value;
}

interface PublishLocationProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (locationUpdate: any) => void;
  onBack: () => void;
  onSaveAndExit: (locationUpdate: any) => void;
  isEditMode?: boolean;
}

export default function PublishLocation({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit,
  isEditMode,
}: PublishLocationProps) {
  const [street, setStreet] = useState(wizardData.street || '');
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
  const [postal_code, setPostal_code] = useState(wizardData.postal_code || '');
  const [show_exact_location, setShow_exact_location] = useState(
    wizardData.show_exact_location !== undefined ? wizardData.show_exact_location : true
  );
  const [showMapNote, setShowMapNote] = useState(true);
  const [geo_lat, setGeo_lat] = useState<number | undefined>(wizardData.geo_lat);
  const [geo_long, setGeo_long] = useState<number | undefined>(wizardData.geo_long);
  const [pendingStateName, setPendingStateName] = useState('');
  const [pendingCityName, setPendingCityName] = useState('');
  const [hasSelectedAutocompleteLocation, setHasSelectedAutocompleteLocation] = useState(
    Boolean(wizardData.location_id || wizardData.state_id || wizardData.geo_lat || wizardData.geo_long)
  );
  const [mapInteractive, setMapInteractive] = useState(false);

  const hasAddress = useMemo(() => street.trim().length > 0, [street]);
  const showMapPreview = hasAddress;

  const fullMapAddress = useMemo(() => {
    return [street, locationNames.subNeighborhoodName, locationNames.neighborhoodName, locationNames.subLocationName, locationNames.locationName, locationNames.stateName, 'Argentina'].filter(Boolean).join(', ');
  }, [street, locationNames]);

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setGeo_lat(lat);
    setGeo_long(lng);
    setHasSelectedAutocompleteLocation(true);
  };

  const handlePlaceSelect = useCallback((data: PlaceData) => {
    setStreet(data.street);
    setMapInteractive(false);
    setLocationData({ state_id: undefined, location_id: undefined, sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
    let stateName = data.stateName;
    if (data.stateName === 'Ciudad Autónoma de Buenos Aires') stateName = 'Capital Federal';
    setPendingStateName(stateName);
    setPendingCityName(data.cityName);
  }, []);

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
    });
  }, [street, locationData, postal_code, show_exact_location, geo_lat, geo_long]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = (continueFlag = true) => {
    const locationUpdate = {
      postal_code,
      street,
      country_id: 1,
      state_id: locationData.state_id,
      location_id: locationData.location_id,
      sub_location_id: locationData.sub_location_id,
      neighborhood_id: locationData.neighborhood_id,
      sub_neighborhood_id: locationData.sub_neighborhood_id,
      show_exact_location,
      geo_lat,
      geo_long
    }

    if (!continueFlag) {
      onSaveAndExit(locationUpdate);
    } else {
      onNext(locationUpdate);
    }
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
    <div className="publish-location">
      <div className="publish-location-inner">
        <div className="publish-location-card">
          <div className="publish-location-top">
            <p className="publish-location-label">{wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : ''} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : ''} {wizardData.property_subtype ?  '- ' +PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : ''}</p>
            <button className="publish-location-link" type="button" onClick={() => handleContinue(false)}>
              Guardar y salir
            </button>
          </div>

          <div className="publish-location-status">
            <div className="publish-location-track">
              <span className="publish-location-segment" />
              <span className="publish-location-segment" />
              <span className="publish-location-segment" />
              <span className="publish-location-fill" />
            </div>
          </div>

          <div className="publish-location-section">
            <div className="publish-location-title">
              <h1>Ingresá la ubicación de la propiedad</h1>
              <span className={showMapPreview ? 'hide-desktop' : ''}>Datos obligatorios(*)</span>
            </div>

            <div className="publish-location-fields">
              <div className="publish-location-field">
                <AddressAutocompleteInput
                  value={street}
                  onChange={setStreet}
                  onPlaceSelect={handlePlaceSelect}
                  onSuggestionSelectionChange={setHasSelectedAutocompleteLocation}
                />
              </div>

              <LocationCascadeSelects
                value={locationData}
                onChange={setLocationData}
                onNamesChange={setLocationNames}
                disabled={!hasSelectedAutocompleteLocation}
                provinceRequired
                pendingStateName={pendingStateName}
                pendingCityName={pendingCityName}
                onPendingResolved={(field) => {
                  if (field === 'state') setPendingStateName('');
                  else setPendingCityName('');
                }}
              />

          {showMapPreview ? (
            <div className="publish-location-row">                  
              <InputField
                label="Código postal"
                placeholder="Código postal"
                value={postal_code}
                onChange={(event) => setPostal_code(event.target.value)}
                type="text"
              />
            </div>
          ) : null}
            </div>
          </div>

          <div className="publish-location-preview">
            <div className="publish-location-preview-header">
              <h2>Vista previa del aviso</h2>
              {showMapPreview && (
                <div className="publish-location-toggle">
                  <span>Mostrar la ubicación exacta</span>
                  <SwitchToggle
                    checked={show_exact_location}
                    onChange={setShow_exact_location}
                    ariaLabel="Mostrar ubicación exacta"
                  />
                </div>
              )}
            </div>

            <div className="publish-location-map">
              <PublishLocationMap
                fullAddress={hasSelectedAutocompleteLocation ? fullMapAddress : ''}
                onStreetChange={setStreet}
                onCoordinatesChange={handleCoordinatesChange}
                disabled={!hasSelectedAutocompleteLocation}
                interactive={mapInteractive}
                onActivate={() => setMapInteractive(true)}
              />
              {showMapPreview && showMapNote && mapInteractive && (
                <div className="publish-location-map-note">
                  <p>Arrastra el marcador para ajustar la ubicación</p>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={() => setShowMapNote(false)}
                  >
                    <img src={iconClose} alt="" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="publish-location-footer">
            <button className="publish-location-back" type="button" onClick={handleBack} disabled={isEditMode}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <Button label="Continuar" type="button" onClick={() => handleContinue(true)} disabled={!hasSelectedAutocompleteLocation} />
          </div>
        </div>
      </div>
    </div>
    </APIProvider>
  );
}
