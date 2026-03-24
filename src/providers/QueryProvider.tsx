'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { LOCATIONS_QUERY_KEY, fetchLocations } from '@/lib/locations';

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
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
      staleTime:0, //  60 * 60 * 1000, // 1 hour
      gcTime:0 // 24 * 60 * 60 * 1000, // 24 hours
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}