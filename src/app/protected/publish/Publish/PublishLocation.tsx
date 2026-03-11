'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const iconChevron = '/icons/chevron-up.svg';
const iconClose = '/icons/close.svg';
const mapImage = '/images/mapa_google.png';

// API service functions replaced with useQuery hooks
// ...existing code...

interface PublishLocationProps {
  wizardData: CreatePropertyDraft;
  updateWizardData: (data: Partial<CreatePropertyDraft>) => void;
  onNext: (locationUpdate: any) => void;
  onBack: () => void;
  onSaveAndExit: () => void;
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
      return response.json();
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

  // Update wizard data when location data changes
  useEffect(() => {
    updateWizardData({
      street,
      country_id,
      state_id,
      location_id,
      sub_location_id,
      postal_code,
      show_exact_location
    });
  }, [street, country_id, state_id, location_id, sub_location_id, postal_code, show_exact_location]);

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
      sub_location_id
    }
    onNext(locationUpdate);
  };

  return (
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
                <InputField
                  label="Calle y numero*"
                  placeholder="Dirección"
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  type="text"
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
                    disabled={!hasAddress || loadingCountries}
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
                    disabled={!hasAddress || !country_id || loadingProvinces}
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
                    disabled={!hasAddress || !state_id || loadingLocations}
                  />
                </div>

                <div className="publish-location-field">
                  <Select
                    label="Zona"
                    options={zoneOptions}
                    value={sub_location_id ? sub_location_id.toString() : undefined}
                    onChange={handleSubLocationChange}
                    placeholder={loadingZones ? "Cargando zonas..." : "Seleccionar zona"}
                    disabled={!hasAddress || !location_id || loadingZones}
                  />
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

          {showMapPreview ? (
            <div className="publish-location-preview">
              <div className="publish-location-preview-header">
                <h2>Vista previa del aviso</h2>
                <div className="publish-location-toggle">
                  <span>Mostrar la ubicacion exacta</span>
                  <SwitchToggle
                    checked={show_exact_location}
                    onChange={setShow_exact_location}
                    ariaLabel="Mostrar ubicacion exacta"
                  />
                </div>
              </div>

              <div className="publish-location-map">
                <img src={mapImage} alt="Mapa" />
                <div className="publish-location-map-note">
                  <p>Arrastra el marcador para ajustar la ubicacion</p>
                  <button type="button" aria-label="Cerrar">
                    <img src={iconClose} alt="" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="publish-location-footer">
            <button className="publish-location-back" type="button" onClick={handleBack}>
              <img src={iconChevron} alt="" />
              Volver
            </button>
            <button className="publish-location-continue" type="button" onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
