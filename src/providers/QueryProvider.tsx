'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LOCATIONS_QUERY_KEY, fetchLocations } from '@/lib/locations';
import { FAVORITE_IDS_QUERY_KEY } from '@/lib/useFavoriteIds';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';

interface QueryProviderProps {
  children: React.ReactNode;
}

function PrefetchOnSession({ queryClient }: { queryClient: QueryClient }) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    if (!isLoggedIn) return;
    queryClient.prefetchQuery({
      queryKey: FAVORITE_IDS_QUERY_KEY,
      queryFn: () => apiFetch<number[]>(`${API_BASE_URL}/favourites/list-ids`),
      staleTime: 5 * 60 * 1000,
    });
  }, [isLoggedIn, queryClient]);

  return null;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  // Prefetch locations on provider mount (app startup)
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: LOCATIONS_QUERY_KEY,
      queryFn: fetchLocations,
      staleTime: 60 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
    });
  }, [queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <PrefetchOnSession queryClient={queryClient} />
      {children}
    </QueryClientProvider>
  );
}