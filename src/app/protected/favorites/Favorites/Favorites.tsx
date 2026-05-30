'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import { CreateProperty } from '@/types/propiedad';
import './Favorites.scss';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import { useToggleFavorite } from '@/lib/useFavoriteIds';
import ContactForm from '@/components/ContactForm/ContactForm';
import { useState } from 'react';

export default function Favorites() {
  const queryClient = useQueryClient();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalInfo, setContactModalInfo] = useState({ phoneNumber: '', propertyId: 0, userId: 0, organizationId: 0 });

  const { data, isLoading } = useQuery<CreateProperty[]>({
    queryKey: ['my-favourites'],
    queryFn: () => apiFetch<CreateProperty[]>(`${API_BASE_URL}/favourites/my-favourites`),
  });
  
  const toggleFavorite = useToggleFavorite();
  const handleToggleFavorite = async (id: number) => {
    await toggleFavorite(id);
    queryClient.invalidateQueries({ queryKey: ['my-favourites'] });
  };
  const favourites = data ?? [];

  return (
    <div className="favorites-container">
      <h1>Mis Favoritos</h1>
      {isLoading && <p>Cargando favoritos...</p>}
      <div className="favorites-list">
        {favourites.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            cardType="favorites"
            isLoggedIn={true}
            onFavorite={() => handleToggleFavorite(property.id ?? 0)} 
            onWhatsapp={() => {
              console.log("onWhatsapp", property);
              setContactModalInfo({ phoneNumber: property.user ? property.user.phone : property.owner_phone ?? '', propertyId: property.id ?? 0, userId: property.user_id ?? 0, organizationId: property.organization_id ?? 0 });
              setIsContactModalOpen(true);
            }}
          />
        ))}
        {!isLoading && favourites.length === 0 && (
          <p>No tenés propiedades guardadas como favoritas.</p>
        )}
      </div>
      {isContactModalOpen && <div className="contact-modal-overlay">
        <div className="contact-modal">
           <ContactForm
            isModal
            propertyId={contactModalInfo.propertyId}
            userId={contactModalInfo.userId}
            organizationId={contactModalInfo.organizationId}
            onClose={() => setIsContactModalOpen(false)}
          />
        </div>
      </div>}
    </div>
  );
}