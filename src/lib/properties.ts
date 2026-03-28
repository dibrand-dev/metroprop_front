import { API_BASE_URL } from '@/utils/utils';
import type { PropertyFilterParams, PropertiesResponse } from '@/types/property-api';

/**
 * Fetch properties from the API using the given filter params.
 * Undefined/null/empty values are omitted from the query string.
 */
export async function fetchProperties(
  params: PropertyFilterParams,
): Promise<PropertiesResponse> {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  });

  const res = await fetch(`${API_BASE_URL}/properties/filter?${qs.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch properties: ${res.status}`);
  }

  return res.json() as Promise<PropertiesResponse>;
}

/**
 * Convert a plain URLSearchParams / ReadonlyURLSearchParams to PropertyFilterParams.
 * Handles string→number coercion for numeric fields.
 */
export function searchParamsToFilterParams(
  sp: URLSearchParams | { get(key: string): string | null; forEach(cb: (value: string, key: string) => void): void },
): PropertyFilterParams {
  const NUM_FIELDS = new Set([
    'page', 'limit', 'organization_id', 'country_id', 'state_id',
    'location_id', 'sub_location_id',
    'price_min', 'price_max', 'price_m2_min', 'price_m2_max',
    'roofed_surface_min', 'roofed_surface_max', 'total_surface_min', 'total_surface_max',
    'age_min', 'age_max',
    'northEastLat', 'northEastLng', 'southWestLat', 'southWestLng',
  ]);

  // Bbox URL param → API param name mapping
  const BBOX_MAP: Record<string, string> = {
    northEastLat: 'northEastLat',
    northEastLng: 'northEastLng',
    southWestLat: 'southWestLat',
    southWestLng: 'southWestLng',
  };

  const result: PropertyFilterParams = {
    page: 1,
    limit: 20
  };

  sp.forEach((value: string, key: string) => {
    if (value === '') return;
    const apiKey = BBOX_MAP[key] ?? key;
    if (NUM_FIELDS.has(key)) {
      const num = Number(value);
      if (!isNaN(num)) (result as Record<string, unknown>)[apiKey] = num;
    } else {
      (result as Record<string, unknown>)[apiKey] = value;
    }
  });

  return result;
}
