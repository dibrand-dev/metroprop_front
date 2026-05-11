'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import { CreateProperty } from '@/types/propiedad';
import './Contacts.scss';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import { useToggleFavorite } from '@/lib/useFavoriteIds';
import WhatsappModal from '@/components/WhatsappModal/WhatsappModal';

export default function Contacts() {
  const queryClient = useQueryClient();
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappModalInfo, setWhatsappModalInfo] = useState({ phoneNumber: '', propertyId: 0 });
  const { data, isLoading } = useQuery<CreateProperty[]>({
    queryKey: ['leads'],
    queryFn: () => apiFetch<CreateProperty[]>(`${API_BASE_URL}/leads`),
  });
  
  const toggleFavorite = useToggleFavorite();
  const handleToggleFavorite = async (id: number) => {
    await toggleFavorite(id);
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };
  const leads = data ?? [];

  return (
    <div className="contacts-container">
      <h1>Mis Contactos</h1>
      {isLoading && <p>Cargando contactos...</p>}
      <div className="contacts-list">
        {leads.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            cardType="contacts"
            isLoggedIn={true}
            onFavorite={() => handleToggleFavorite(property.id ?? 0)}
            onWhatsapp={() => {
              setWhatsappModalInfo({ phoneNumber: property.user ? property.user.phone : property.owner_phone ?? '', propertyId: property.id ?? 0 });
              setIsWhatsappModalOpen(true);
            }}
          />
        ))}
        {!isLoading && leads.length === 0 && (
          <p>No tenés contactos.</p>
        )}
      </div>
      <WhatsappModal
        isOpen={isWhatsappModalOpen}
        onClose={() => setIsWhatsappModalOpen(false)}
        phoneNumber={whatsappModalInfo.phoneNumber}
        propertyId={whatsappModalInfo.propertyId}
      />
    </div>
  );
}