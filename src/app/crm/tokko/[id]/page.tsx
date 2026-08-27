'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, getPropertyDetailPath } from '@/utils/utils';
import { useQuery } from '@tanstack/react-query';
import { CreateProperty } from '@/types/propiedad';
import { Location } from '@/lib/locations';

interface TokkoPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default function TokkoPropertyPage({ params }: TokkoPropertyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: property, isLoading, isError } = useQuery<CreateProperty>({
    queryKey: ['property', id],
    queryFn: async () => apiFetch<CreateProperty>(`${API_BASE_URL}/properties/tokko/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando...</p>;
  if (isError) return <p style={{ padding: '2rem', color: 'red' }}>Error: {error}</p>;
  if (!property) {
    return <p style={{ padding: '2rem', color: 'red' }}>Propiedad no encontrada</p>;
  } else {
    const result = property as any;
    const locations: Location[] = result.locations ?? [];
    const locationLabels = locations.length > 0 ? {
      neighborhood: result.neighborhood_id ? locations.find(l => l.id === result.neighborhood_id)?.name : undefined,
      subLocation: result.sub_location_id ? locations.find(l => l.id === result.sub_location_id)?.name : undefined,
      location: result.location_id ? locations.find(l => l.id === result.location_id)?.name : undefined,
      state: result.state_id ? locations.find(l => l.id === result.state_id)?.name : undefined,
    } : undefined;
    router.replace(getPropertyDetailPath(result, locationLabels));
  }
  return ('');
}
