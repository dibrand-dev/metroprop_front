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

type Tab = 'contactos' | 'contactados';

export default function Contacts() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('contactos');
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappModalInfo, setWhatsappModalInfo] = useState({ phoneNumber: '', propertyId: 0 });

  const { data: contactosData, isLoading: loadingContactos } = useQuery<CreateProperty[]>({
    queryKey: ['leads'],
    queryFn: () => apiFetch<CreateProperty[]>(`${API_BASE_URL}/leads`),
  });

  const { data: contactadosData, isLoading: loadingContactados } = useQuery<CreateProperty[]>({
    queryKey: ['leads-my-contacts'],
    queryFn: () => apiFetch<CreateProperty[]>(`${API_BASE_URL}/leads/my-contacts`),
  });

  const toggleFavorite = useToggleFavorite();
  const handleToggleFavorite = async (id: number) => {
    await toggleFavorite(id);
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['leads-my-contacts'] });
  };

  const leads = (activeTab === 'contactos' ? contactosData : contactadosData) ?? [];
  const isLoading = activeTab === 'contactos' ? loadingContactos : loadingContactados;

  return (
    <div className="contacts-container">
      <h1>Mis Contactos</h1>

      <div className="contacts-tabs">
        <button
          type="button"
          className={`contacts-tab${activeTab === 'contactos' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('contactos')}
        >
          Contactos
        </button>
        <button
          type="button"
          className={`contacts-tab${activeTab === 'contactados' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('contactados')}
        >
          Contactados
        </button>
      </div>

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

