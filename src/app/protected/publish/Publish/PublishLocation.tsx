'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import './PublishLocation.scss';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import { API_BASE_URL } from '@/utils/utils';
import { 
  OPERATION_TYPE_LABELS, 
  PROPERTY_TYPE_LABELS, 
  PROPERTY_SUBTYPE_LABELS, 
  CreatePropertyDraft
} from '@/types/propiedad';
import PublishLocationMap from './PublishLocationMap/PublishLocationMap';
import InputField2 from '@/ui/InputField2/InputField2';

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
    if (!val.trim() || !serviceRef.current) return;
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
    }, 2000);
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
      <InputField2
        ref={inputRef}
        type="text"
        label="Calle y numero*"
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
}

export default function PublishLocation({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
  onSaveAndExit,
}: PublishLocationProps) {
  const [street, setStreet] = useState(wizardData.street || '');
  const [country_id, setCountry_id] = useState<number | undefined>(wizardData.country_id || undefined);
  const [state_id, setState_id] = useState<number | undefined>(wizardData.state_id || undefined);
  const [location_id, setLocation_id] = useState<number | undefined>(wizardData.location_id || undefined);
  const [sub_location_id, setSub_location_id] = useState<number | undefined>(wizardData.sub_location_id || undefined);
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
    Boolean(wizardData.location_id || wizardData.state_id || wizardData.country_id || wizardData.geo_lat || wizardData.geo_long)
  );

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setGeo_lat(lat);
    setGeo_long(lng);
    setHasSelectedAutocompleteLocation(true);
  };

  // Query for countries (loads on component mount)
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/location/countries`);
      if (!response.ok) throw new Error('Error fetching countries');
      return response.json();
    },
  });

  // Query for states/provinces (loads when country is selected)
  const { data: provinces = [], isLoading: loadingProvinces } = useQuery({
    queryKey: ['provinces', country_id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/location/getCountryStates?countryId=${country_id}`);
      if (!response.ok) throw new Error('Error fetching states');
      return response.json();
    },
    enabled: !!country_id,
  });

  // Query for locations (loads when province is selected)
  const { data: locations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ['locations', state_id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/location/getStateLocations?stateId=${state_id}`);
      if (!response.ok) throw new Error('Error fetching locations');
      const locations = await response.json();
      return locations;
    },
    enabled: !!state_id,
  });

  // Query for zones (loads when location is selected)
  const { data: zones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['zones', sub_location_id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/location/getLocationChildrens?locationId=${location_id}`);
      if (!response.ok) throw new Error('Error fetching location children');
      return response.json();
    },
    enabled: !!sub_location_id,
  });
  
  const hasAddress = useMemo(() => street.trim().length > 0, [street]);
  const showMapPreview = hasAddress;

  // Transform data for Select components
  const countryOptions = countries.map((country: any) => ({
    value: country.id.toString(),
    label: country.name,
  }));

  const provinceOptions = provinces.map((province: any) => ({
    value: province.id.toString(),
    label: province.name,
  }));

  const locationOptions = locations.map((location: any) => ({
    value: location.id.toString(),
    label: location.name,
  }));

  const zoneOptions = zones.map((zone: any) => ({
    value: zone.id.toString(),
    label: zone.name,
  }));

  // Build full address string for geocoding (country + state + location + zone + street)
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
    // Immediately try to match country; if found cascade state/city via pending
    const countryMatch = findBestMatch(countryOptions, data.countryName);
    if (countryMatch) {
      const newId = parseInt(countryMatch);
      setCountry_id(newId);
      setState_id(undefined);
      setLocation_id(undefined);
      setSub_location_id(undefined);
    }
    // Store pending names regardless — effects will apply them when options load
    let stateName = data.stateName
    if (data.stateName === "Ciudad Autónoma de Buenos Aires") stateName = "Capital Federal"
    setPendingStateName(stateName);
    setPendingCityName(data.cityName);
  }, [countryOptions]);

  // Handle selection changes and reset dependent selects
  const handleCountryChange = (value: string | null) => {
    const selectedCountryId = value ? parseInt(value) : undefined;
    setCountry_id(selectedCountryId);
    setState_id(undefined); // Reset state
    setLocation_id(undefined); // Reset location
    setSub_location_id(undefined); // Reset sub-location
  };

  const handleStateChange = (value: string | null) => {
    const selectedStateId = value ? parseInt(value) : undefined;
    setState_id(selectedStateId);
    setLocation_id(undefined); // Reset location
    setSub_location_id(undefined); // Reset sub-location
  };

  const handleLocationChange = (value: string | null) => {
    const selectedLocationId = value ? parseInt(value) : undefined;
    setLocation_id(selectedLocationId);
    setSub_location_id(undefined); // Reset sub-location
  };

  const handleSubLocationChange = (value: string | null) => {
    const selectedSubLocationId = value ? parseInt(value) : undefined;
    setSub_location_id(selectedSubLocationId);
  };

  // When provinces load, apply the pending state name from autocomplete selection
  useEffect(() => {
    if (!pendingStateName || provinceOptions.length === 0) return;
    const match = findBestMatch(provinceOptions, pendingStateName);
    if (match) {
      setState_id(parseInt(match));
      setPendingStateName('');
      setLocation_id(undefined);
      setSub_location_id(undefined);
    }
  }, [provinceOptions, pendingStateName]);

  // When locations load, apply the pending city name from autocomplete selection
  useEffect(() => {
    if (!pendingCityName || locationOptions.length === 0) return;
    const match = findBestMatch(locationOptions, pendingCityName);
    if (match) {
      setLocation_id(parseInt(match));
      setPendingCityName('');
      setSub_location_id(undefined);
    }
  }, [locationOptions, pendingCityName]);

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
    });
  }, [street, country_id, state_id, location_id, sub_location_id, postal_code, show_exact_location, geo_lat, geo_long]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    const locationUpdate = { 
      postal_code,
      street,
      country_id,
      state_id,
      location_id,
      sub_location_id,
      geo_lat,
      geo_long
    }
    onNext(locationUpdate);
  };
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
    <div className="publish-location">
      <div className="publish-location-inner">
        <div className="publish-location-card">
          <div className="publish-location-top">
            <p className="publish-location-label">{wizardData.operation_type ? OPERATION_TYPE_LABELS[wizardData.operation_type] : 'No especificado'} - {wizardData.property_type ? PROPERTY_TYPE_LABELS[wizardData.property_type] : 'No especificado'} {wizardData.property_subtype ? PROPERTY_SUBTYPE_LABELS[wizardData.property_subtype] : 'No especificado'}</p>
            <button className="publish-location-link" type="button" onClick={onSaveAndExit}>
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
              <h1>Ingresa la ubicacion de la propiedad</h1>
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

              <div className="publish-location-row">
                <div className="publish-location-field">
                  <Select
                    label="País*"
                    options={countryOptions}
                    value={country_id ? country_id.toString() : undefined}
                    onChange={handleCountryChange}
                    placeholder={loadingCountries ? "Cargando países..." : "Seleccionar país"}
                    disabled={!hasSelectedAutocompleteLocation || loadingCountries}
                    required
                  />
                </div>

                <div className="publish-location-field">
                  <Select
                    label="Provincia*"
                    options={provinceOptions}
                    value={state_id ? state_id.toString() : undefined}
                    onChange={handleStateChange}
                    placeholder={loadingProvinces ? "Cargando provincias..." : "Seleccionar provincia"}
                    disabled={!hasSelectedAutocompleteLocation || !country_id || loadingProvinces}
                    required
                  />
                </div>
              </div>

              <div className="publish-location-row">
                <div className="publish-location-field">
                  <Select
                    label="Localidad"
                    options={locationOptions}
                    value={location_id ? location_id.toString() : undefined}
                    onChange={handleLocationChange}
                    placeholder={loadingLocations ? "Cargando localidades..." : "Seleccionar localidad"}
                    disabled={!hasSelectedAutocompleteLocation || !state_id || loadingLocations || locationOptions.length === 0}
                  />
                </div>

                <div className="publish-location-field">
                  {zoneOptions.length > 0 && <Select
                    label="Zona"
                    options={zoneOptions}
                    value={sub_location_id ? sub_location_id.toString() : undefined}
                    onChange={handleSubLocationChange}
                    placeholder={loadingZones ? "Cargando zonas..." : "Seleccionar zona"}
                    disabled={!hasSelectedAutocompleteLocation || !location_id || loadingZones}
                  />}
                </div>
              </div>

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
                  <span>Mostrar la ubicacion exacta</span>
                  <SwitchToggle
                    checked={show_exact_location}
                    onChange={setShow_exact_location}
                    ariaLabel="Mostrar ubicacion exacta"
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
              />
              {showMapPreview && showMapNote && (
                <div className="publish-location-map-note">
                  <p>Arrastra el marcador para ajustar la ubicacion</p>
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
            <button className="publish-location-back" type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <button className="publish-location-continue" type="button" onClick={handleContinue} disabled={!hasSelectedAutocompleteLocation}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
    </APIProvider>
  );
}
