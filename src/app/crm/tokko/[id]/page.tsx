'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, getPropertyDetailPath } from '@/utils/utils';
import { useQuery } from '@tanstack/react-query';
import { CreateProperty } from '@/types/propiedad';
import { Location } from '@/lib/locations';

export default function TokkoPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: property,
    isLoading,
    isError,
  } = useQuery<CreateProperty>({
    queryKey: ['property', id],
    queryFn: async () =>
      apiFetch<CreateProperty>(
        `${API_BASE_URL}/properties/tokko/${id}`
      ),
    enabled: !!id,
  });

  useEffect(() => {
    if (!property) return;

    const result = property as any;

    const locations: Location[] = result.locations ?? [];

    const locationLabels =
      locations.length > 0
        ? {
            neighborhood: result.neighborhood_id
              ? locations.find(
                  l => l.id === result.neighborhood_id
                )?.name
              : undefined,

            subLocation: result.sub_location_id
              ? locations.find(
                  l => l.id === result.sub_location_id
                )?.name
              : undefined,

            location: result.location_id
              ? locations.find(
                  l => l.id === result.location_id
                )?.name
              : undefined,

            state: result.state_id
              ? locations.find(
                  l => l.id === result.state_id
                )?.name
              : undefined,
          }
        : undefined;

    router.replace(
      getPropertyDetailPath(result, locationLabels)
    );
  }, [property, router]);

  if (isLoading) {
    return <p style={{ padding: '2rem' }}>Cargando...</p>;
  }

  if (isError) {
    return (
      <p style={{ padding: '2rem', color: 'red' }}>
        Ha ocurrido un error
      </p>
    );
  }

  if (!property) {
    return (
      <p style={{ padding: '2rem', color: 'red' }}>
        Propiedad no encontrada
      </p>
    );
  }

  return null;
}