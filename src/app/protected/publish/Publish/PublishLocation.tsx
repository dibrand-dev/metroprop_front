'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import './PublishLocation.scss';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import Select from '@/ui/Select/Select';
import InputField from '@/ui/InputField/InputField';
import { API_BASE_URL } from '@/utils/utils';

const iconChevron = '/icons/chevron-up.svg';
const iconClose = '/icons/close.svg';
const mapImage = '/images/mapa_google.png';

// API service functions
const fetchCountries = async () => {
  const response = await fetch(`${API_BASE_URL}/location/countries`);
  if (!response.ok) {
    throw new Error('Error fetching countries');
  }
  return response.json();
};

const fetchCountryStates = async (countryId: number) => {
  const response = await fetch(`${API_BASE_URL}/location/getCountryStates?countryId=${countryId}`);
  if (!response.ok) {
    throw new Error('Error fetching states');
  }
  return response.json();
};

const fetchStateLocations = async (stateId: number) => {
  const response = await fetch(`${API_BASE_URL}/location/getStateLocations?stateId=${stateId}`);
  if (!response.ok) {
    throw new Error('Error fetching locations');
  }
  return response.json();
};

const fetchLocationChildren = async (locationId: number) => {
  const response = await fetch(`${API_BASE_URL}/location/getLocationChildrens?locationId=${locationId}`);
  if (!response.ok) {
    throw new Error('Error fetching location children');
  }
  return response.json();
};

interface PublishLocationProps {
  wizardData: any;
  updateWizardData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PublishLocation({
  wizardData,
  updateWizardData,
  onNext,
  onBack,
}: PublishLocationProps) {
  const [address, setAddress] = useState(wizardData.location?.address || '');
  const [countryId, setCountryId] = useState<number | null>(wizardData.location?.countryId || null);
  const [provinceId, setProvinceId] = useState<number | null>(wizardData.location?.provinceId || null);
  const [localidadId, setLocalidadId] = useState<number | null>(wizardData.location?.localidadId || null);
  const [zoneId, setZoneId] = useState<number | null>(wizardData.location?.zoneId || null);
  const [postalCode, setPostalCode] = useState(wizardData.location?.postalCode || '');
  const [showExactLocation, setShowExactLocation] = useState(
    wizardData.location?.showExactLocation !== undefined ? wizardData.location.showExactLocation : true
  );

  // Query for countries (loads on component mount)
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  // Query for states/provinces (loads when country is selected)
  const { data: provinces = [], isLoading: loadingProvinces } = useQuery({
    queryKey: ['provinces', countryId],
    queryFn: () => fetchCountryStates(countryId!),
    enabled: !!countryId,
  });

  // Query for locations (loads when province is selected)
  const { data: locations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ['locations', provinceId],
    queryFn: () => fetchStateLocations(provinceId!),
    enabled: !!provinceId,
  });

  // Query for zones (loads when location is selected)
  const { data: zones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['zones', localidadId],
    queryFn: () => fetchLocationChildren(localidadId!),
    enabled: !!localidadId,
  });

  const hasAddress = useMemo(() => address.trim().length > 0, [address]);
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
    const selectedCountryId = value ? parseInt(value) : null;
    setCountryId(selectedCountryId);
    setProvinceId(null); // Reset province
    setLocalidadId(null); // Reset location
    setZoneId(null); // Reset zone
  };

  const handleProvinceChange = (value: string | null) => {
    const selectedProvinceId = value ? parseInt(value) : null;
    setProvinceId(selectedProvinceId);
    setLocalidadId(null); // Reset location
    setZoneId(null); // Reset zone
  };

  const handleLocationChange = (value: string | null) => {
    const selectedLocationId = value ? parseInt(value) : null;
    setLocalidadId(selectedLocationId);
    setZoneId(null); // Reset zone
  };

  const handleZoneChange = (value: string | null) => {
    const selectedZoneId = value ? parseInt(value) : null;
    setZoneId(selectedZoneId);
  };

  // Update wizard data when location data changes
  useEffect(() => {
    updateWizardData({
      location: {
        address,
        countryId,
        provinceId,
        localidadId,
        zoneId,
        postalCode,
        showExactLocation,
        // Store readable names for display purposes
        countryName: countries.find(c => c.id === countryId)?.name || '',
        provinceName: provinces.find(p => p.id === provinceId)?.name || '',
        localidadName: locations.find(l => l.id === localidadId)?.name || '',
        zoneName: zones.find(z => z.id === zoneId)?.name || '',
      },
    });
  }, [address, countryId, provinceId, localidadId, zoneId, postalCode, showExactLocation, countries, provinces, locations, zones, updateWizardData]);

  const handleBack = () => {
    onBack();
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="publish-location">
      <div className="publish-location-inner">
        <div className="publish-location-card">
          <div className="publish-location-top">
            <p className="publish-location-label">{wizardData.operation} - {wizardData.propertyType} {wizardData.propertySubtype}</p>
            <button className="publish-location-link" type="button">
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
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  type="text"
                />
              </div>

              <div className="publish-location-row">
                <div className="publish-location-field">
                  <Select
                    label="País*"
                    options={countryOptions}
                    value={countryId ? countryId.toString() : null}
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
                    value={provinceId ? provinceId.toString() : null}
                    onChange={handleProvinceChange}
                    placeholder={loadingProvinces ? "Cargando provincias..." : "Seleccionar provincia"}
                    disabled={!hasAddress || !countryId || loadingProvinces}
                    required
                  />
                </div>
              </div>

              <div className="publish-location-row">
                <div className="publish-location-field">
                  <Select
                    label="Localidad"
                    options={locationOptions}
                    value={localidadId ? localidadId.toString() : null}
                    onChange={handleLocationChange}
                    placeholder={loadingLocations ? "Cargando localidades..." : "Seleccionar localidad"}
                    disabled={!hasAddress || !provinceId || loadingLocations}
                  />
                </div>

                <div className="publish-location-field">
                  <Select
                    label="Zona"
                    options={zoneOptions}
                    value={zoneId ? zoneId.toString() : null}
                    onChange={handleZoneChange}
                    placeholder={loadingZones ? "Cargando zonas..." : "Seleccionar zona"}
                    disabled={!hasAddress || !localidadId || loadingZones}
                  />
                </div>
              </div>

              {showMapPreview ? (
                <div className="publish-location-row">                  
                  <InputField
                    label="Código postal"
                    placeholder="Código postal"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
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
                    checked={showExactLocation}
                    onChange={setShowExactLocation}
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
