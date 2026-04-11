import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/utils/utils';

export interface Location {
  id: number;
  name: string;
  iso_code?: string;
  sap_code?: number;
  full_location?: string;
  zip_code?: string;
  short_location?: string;
  parent_id?: number;
  type?: string;
  migrated?: boolean;
  status?: string;
}

export const LOCATIONS_QUERY_KEY = ['locations-global'];

/**
 * Fetch all locations from the API
 */
export const fetchLocations = async (): Promise<Location[]> => {
  const response = await fetch(`${API_BASE_URL}/location/getAllLocations?country_id=1`);
  if (!response.ok) throw new Error('Error fetching locations');
  return response.json();
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
