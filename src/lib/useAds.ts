import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import type { AdBanner } from '@/types/propiedad';

export const ADS_QUERY_KEY = ['ads'] as const;
export const ADS_STALE_TIME = 5 * 60 * 1000;

export function useAds() {
  const { data, isLoading, isError } = useQuery<AdBanner[]>({
    queryKey: ADS_QUERY_KEY,
    queryFn: () => apiFetch<AdBanner[]>(`${API_BASE_URL}/ads-banners`),
    staleTime: ADS_STALE_TIME,
  });

  return { adsData: data ?? [], isAdsLoading: isLoading, isAdsError: isError };
}
