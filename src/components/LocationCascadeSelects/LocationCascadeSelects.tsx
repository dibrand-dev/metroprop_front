'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Select from '@/ui/Select/Select';
import { API_BASE_URL } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';
import './LocationCascadeSelects.scss';

export interface LocationCascadeValue {
  state_id?: number;
  location_id?: number;
  sub_location_id?: number;
  neighborhood_id?: number;
  sub_neighborhood_id?: number;
}

export interface LocationCascadeNames {
  stateName: string;
  locationName: string;
  subLocationName: string;
  neighborhoodName: string;
  subNeighborhoodName: string;
}

interface LocationCascadeSelectsProps {
  value: LocationCascadeValue;
  onChange: (value: LocationCascadeValue) => void;
  /** Called whenever option labels change (e.g. after data loads), useful for building a full map address string. */
  onNamesChange?: (names: LocationCascadeNames) => void;
  disabled?: boolean;
  provinceRequired?: boolean;
  /** Pending province name from address autocomplete — component resolves it and clears via onPendingResolved. */
  pendingStateName?: string;
  /** Pending city name from address autocomplete — component resolves it and clears via onPendingResolved. */
  pendingCityName?: string;
  onPendingResolved?: (field: 'state' | 'city') => void;
  className?: string;
}

const EMPTY_ARRAY: any[] = [];

function findBestMatch(options: { value: string; label: string }[], name: string): string | undefined {
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

export default function LocationCascadeSelects({
  value,
  onChange,
  onNamesChange,
  disabled = false,
  provinceRequired = false,
  pendingStateName,
  pendingCityName,
  onPendingResolved,
  className,
}: LocationCascadeSelectsProps) {
  const { state_id, location_id, sub_location_id, neighborhood_id, sub_neighborhood_id } = value;

  const { data: provinces = EMPTY_ARRAY, isLoading: loadingProvinces } = useQuery({
    queryKey: ['provinces', 1],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getCountryStates`, { params: { countryId: 1 } }),
  });

  const { data: locations = EMPTY_ARRAY, isLoading: loadingLocations } = useQuery({
    queryKey: ['locations', state_id],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getStateLocations`, { params: { stateId: state_id } }),
    enabled: !!state_id,
  });

  const { data: zones = EMPTY_ARRAY, isLoading: loadingZones } = useQuery({
    queryKey: ['zones', location_id],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getLocationChildrens`, { params: { locationId: location_id } }),
    enabled: !!location_id,
  });

  const { data: neighborhoods = EMPTY_ARRAY, isLoading: loadingNeighborhoods } = useQuery({
    queryKey: ['neighborhoods', sub_location_id],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getLocationChildrens`, { params: { locationId: sub_location_id } }),
    enabled: !!sub_location_id,
  });

  const { data: sub_neighborhoods = EMPTY_ARRAY, isLoading: loadingSubNeighborhoods } = useQuery({
    queryKey: ['sub_neighborhoods', neighborhood_id],
    queryFn: async () => apiFetch(`${API_BASE_URL}/location/getLocationChildrens`, { params: { locationId: neighborhood_id } }),
    enabled: !!neighborhood_id,
  });

  const provinceOptions = useMemo(() => provinces.map((p: any) => ({ value: p.id.toString(), label: p.name })), [provinces]);
  const locationOptions = useMemo(() => locations.map((l: any) => ({ value: l.id.toString(), label: l.name })), [locations]);
  const zoneOptions = useMemo(() => zones.map((z: any) => ({ value: z.id.toString(), label: z.name })), [zones]);
  const neighborhoodOptions = useMemo(() => neighborhoods.map((n: any) => ({ value: n.id.toString(), label: n.name })), [neighborhoods]);
  const subNeighborhoodOptions = useMemo(() => sub_neighborhoods.map((sn: any) => ({ value: sn.id.toString(), label: sn.name })), [sub_neighborhoods]);

  // Notify parent of current label names whenever options or selected IDs change (e.g. for building a map address string)
  useEffect(() => {
    onNamesChange?.({
      stateName: provinceOptions.find(o => o.value === state_id?.toString())?.label ?? '',
      locationName: locationOptions.find(o => o.value === location_id?.toString())?.label ?? '',
      subLocationName: zoneOptions.find(o => o.value === sub_location_id?.toString())?.label ?? '',
      neighborhoodName: neighborhoodOptions.find(o => o.value === neighborhood_id?.toString())?.label ?? '',
      subNeighborhoodName: subNeighborhoodOptions.find(o => o.value === sub_neighborhood_id?.toString())?.label ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state_id, location_id, sub_location_id, neighborhood_id, sub_neighborhood_id, provinceOptions, locationOptions, zoneOptions, neighborhoodOptions, subNeighborhoodOptions]);

  // Resolve pending province name coming from address autocomplete
  useEffect(() => {
    if (!pendingStateName || provinceOptions.length === 0) return;
    const match = findBestMatch(provinceOptions, pendingStateName);
    if (match) {
      onChange({ state_id: parseInt(match), location_id: undefined, sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
      onPendingResolved?.('state');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceOptions, pendingStateName]);

  // Resolve pending city name coming from address autocomplete
  useEffect(() => {
    if (!pendingCityName || locationOptions.length === 0) return;
    const match = findBestMatch(locationOptions, pendingCityName);
    if (match) {
      onChange({ state_id, location_id: parseInt(match), sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
      onPendingResolved?.('city');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationOptions, pendingCityName]);

  const handleStateChange = (v: string | null) => {
    onChange({ state_id: v ? parseInt(v) : undefined, location_id: undefined, sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
  };

  const handleLocationChange = (v: string | null) => {
    onChange({ state_id, location_id: v ? parseInt(v) : undefined, sub_location_id: undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
  };

  const handleSubLocationChange = (v: string | null) => {
    onChange({ state_id, location_id, sub_location_id: v ? parseInt(v) : undefined, neighborhood_id: undefined, sub_neighborhood_id: undefined });
  };

  const handleNeighborhoodChange = (v: string | null) => {
    onChange({ state_id, location_id, sub_location_id, neighborhood_id: v ? parseInt(v) : undefined, sub_neighborhood_id: undefined });
  };

  const handleSubNeighborhoodChange = (v: string | null) => {
    onChange({ state_id, location_id, sub_location_id, neighborhood_id, sub_neighborhood_id: v ? parseInt(v) : undefined });
  };

  return (
    <div className={`location-cascade-selects${className ? ` ${className}` : ''}`}>
      <div className="location-cascade-row">
        <Select
          label={provinceRequired ? 'Provincia*' : 'Provincia'}
          options={provinceOptions}
          value={state_id ? state_id.toString() : undefined}
          onChange={handleStateChange}
          placeholder={loadingProvinces ? 'Cargando provincias...' : provinceOptions.length > 0 ? 'Seleccionar provincia' : 'No hay provincias disponibles'}
          disabled={disabled || loadingProvinces}
          required={provinceRequired}
        />
        <Select
          label="Ciudad"
          options={locationOptions}
          value={location_id ? location_id.toString() : undefined}
          onChange={handleLocationChange}
          placeholder={loadingLocations ? 'Cargando ciudades...' : locationOptions.length > 0 ? 'Seleccionar ciudad' : 'No hay ciudades disponibles'}
          disabled={disabled || !state_id || loadingLocations || locationOptions.length === 0}
        />
      </div>
      <div className="location-cascade-row">
        <Select
          label="Barrio"
          options={zoneOptions}
          value={sub_location_id ? sub_location_id.toString() : undefined}
          onChange={handleSubLocationChange}
          placeholder={loadingZones ? 'Cargando barrios...' : zoneOptions.length > 0 ? 'Seleccionar barrio' : 'No hay barrios disponibles'}
          disabled={disabled || !location_id || loadingZones || zoneOptions.length === 0}
        />
        <Select
          label="Zona"
          options={neighborhoodOptions}
          value={neighborhood_id ? neighborhood_id.toString() : undefined}
          onChange={handleNeighborhoodChange}
          placeholder={loadingNeighborhoods ? 'Cargando zonas...' : neighborhoodOptions.length > 0 ? 'Seleccionar zona' : 'No hay zonas disponibles'}
          disabled={disabled || !sub_location_id || loadingNeighborhoods || neighborhoodOptions.length === 0}
        />
      </div>
      <div className="location-cascade-row location-cascade-row--single">
        <Select
          label="Sub-zona"
          options={subNeighborhoodOptions}
          value={sub_neighborhood_id ? sub_neighborhood_id.toString() : undefined}
          onChange={handleSubNeighborhoodChange}
          placeholder={loadingSubNeighborhoods ? 'Cargando sub-zonas...' : subNeighborhoodOptions.length > 0 ? 'Seleccionar sub-zona' : 'No hay sub-zonas disponibles'}
          disabled={disabled || !neighborhood_id || loadingSubNeighborhoods || subNeighborhoodOptions.length === 0}
        />
      </div>
    </div>
  );
}
