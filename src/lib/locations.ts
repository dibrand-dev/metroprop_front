import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';
import { LOCATION_ARGENTINA_ID } from '@/app/constants';
import { apiFetch } from '@/lib/apiFetch';
import { getCachedLocations, setCachedLocations } from './indexedDB';

export interface Location {
  id: number;
  name: string;
  iso_code?: string;
  sap_code?: number;
  full_location?: string;
  zip_code?: string;
  short_location?: string;
  parent_id?: number;
  state_id?: number;
  type?: string;
  migrated?: boolean;
  status?: string;
}

export const LOCATIONS_QUERY_KEY = ['locations-global'];

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const cached = await getCachedLocations<Location[]>();
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  } catch (err) {
    console.warn('Error reading locations from cache, falling back to network:', err);
  }

  const data = await apiFetch<Location[]>(`${API_BASE_URL}/location/getAllLocations`, {
    params: { country_id: LOCATION_ARGENTINA_ID },
  });

  if (data && Array.isArray(data) && data.length > 0) {
    setCachedLocations(data).catch((err) => {
      console.error('Error saving locations to cache:', err);
    });
  }

  return data;
};

/**
 * Custom hook to access globally cached locations
 * Data is prefetched on app load and cached for 1 hour
 */
export const useLocations = () => {
  return useQuery({
    queryKey: LOCATIONS_QUERY_KEY,
    queryFn: fetchLocations,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (was cacheTime in older versions)
    refetchOnWindowFocus: false,
  });
};
