import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiFetch } from './apiFetch';
import { API_BASE_URL } from '@/utils/utils';

export const FAVORITE_IDS_QUERY_KEY = ['favorite-ids'] as const;

/**
 * Returns the set of property IDs the logged-in user has favorited.
 * Uses a single shared React Query cache entry — calling this hook from multiple
 * components causes exactly ONE network request (React Query deduplicates).
 * Returns an empty Set when the user is not logged in.
 */
export function useFavoriteIds(): Set<number> {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const { data } = useQuery<number[]>({
    queryKey: FAVORITE_IDS_QUERY_KEY,
    queryFn: () => apiFetch<number[]>(`${API_BASE_URL}/favourites/list-ids`),
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  return new Set(data ?? []);
}

/**
 * Returns a function to toggle a favorite and invalidate the shared cache.
 * Call this once at the page level, pass the returned handler down as a prop.
 */
export function useToggleFavorite() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return async (propertyId: number) => {
    if (!session?.user) return;
    try {
      await apiFetch(`${API_BASE_URL}/favourites/toggle`, {
        method: 'POST',
        body: { property_id: propertyId },
      });
      queryClient.invalidateQueries({ queryKey: FAVORITE_IDS_QUERY_KEY });
    } catch {
      // silently ignore
    }
  };
}
