'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import { CreateProperty } from '@/types/propiedad';
import PropertyCardFavoritesList from './PropertyCardFavoritesList';
import './Favorites.scss';

export default function Favorites() {
  const { data, isLoading } = useQuery<CreateProperty[]>({
    queryKey: ['my-favourites'],
    queryFn: () => apiFetch<CreateProperty[]>(`${API_BASE_URL}/favourites/my-favourites`),
  });

  const favourites = data ?? [];

  return (
    <div className="favorites-container">
      <h1>Mis Favoritos</h1>
      {isLoading && <p>Cargando favoritos...</p>}
      <div className="favorites-list">
        {favourites.map(property => (
          <PropertyCardFavoritesList key={property.id} property={property} />
        ))}
        {!isLoading && favourites.length === 0 && (
          <p>No tenés propiedades guardadas como favoritas.</p>
        )}
      </div>
    </div>
  );
}