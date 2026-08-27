import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import type { AmenityTag } from '@/types/propiedad';

export const TAGS_QUERY_KEY = ['tags'] as const;

export function useTags() {
  return useQuery<AmenityTag[]>({
    queryKey: TAGS_QUERY_KEY,
    queryFn: () => apiFetch<AmenityTag[]>(`${API_BASE_URL}/tags`),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
  });
}
