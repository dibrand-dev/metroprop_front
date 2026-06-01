'use client';

import { useState } from 'react';
import './Alerts.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import CreateAlertModal from '@/components/CreateAlertModal/CreateAlertModal';
import Paginator from '@/components/Paginator/Paginator';
import InputField2 from '@/ui/InputField2/InputField2';
import { FREQUENCY_OPTIONS, type CreateProperty } from '@/types/propiedad';
import LocationAutocompleteInput from '@/components/LocationAutocompleteInput/LocationAutocompleteInput';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';

const iconArrowBack = '/icons/arrow.svg';
const iconTrash = '/icons/trash.svg';
const iconEdit = '/icons/pencil.svg';

interface PropertyItem {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  status: string;
  organization?: {
    id: number;
    company_name: string;
    company_logo: string;
  };
  user_id: number;
  images?: { url: string }[];
  actions: ('delete')[];
}

const LIMIT = 20;

export default function Alerts() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; propertyId: number | null; propertyTitle: string }>({ open: false, propertyId: null, propertyTitle: '' });
  const [editAlertModal, setEditAlertModal] = useState<{ open: boolean; alertId: number; name: string; frequency: string } | null>(null);
   
  const deleteMutation = useMutation({
    mutationFn: (propertyId: number) =>
      apiFetch(`${API_BASE_URL}/properties/${propertyId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, propertyId: null, propertyTitle: '' });
      queryClient.invalidateQueries({ queryKey: ['all-properties'] });
    },
  });
/*
  const { data: propertiesData } = useQuery<any>({
    queryKey: ['all-properties', currentPage, searchId],
    queryFn: async () => {
      if (searchId !== null) {
        const property: CreateProperty = await apiFetch<CreateProperty>(`${API_BASE_URL}/properties/${searchId}`);
        // /properties/filter?page=1&limit=20&q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=1
        return { data: [property], total: 1 };
      }
      return apiFetch(`${API_BASE_URL}/properties`, {
        params: { offset: currentPage * LIMIT, limit: LIMIT },
      });
    },
    staleTime: 5 * 60 * 1000,
  });
  */

// http://localhost:3000/properties/filter?page=1&limit=20&q=Argentina+%7C+Capital+Federal&location_id=146&operation_type=1
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['my-properties', currentPage, searchId/*, activeFilters, selectedBranchId*/],
    queryFn: async () => {
      if (searchId !== null) {
        const property: CreateProperty = await apiFetch<CreateProperty>(`${API_BASE_URL}/properties/${searchId}`, {
         // params: { id: searchId },
        });
        return { data: [property], total: 1 };
      }
      return apiFetch(`${API_BASE_URL}/properties/filter`, {
        params: { order_by: 'created_at:desc', page: currentPage, limit: LIMIT/*, ...activeFilters, ...branchFilterParam */},
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  const rawData: any = propertiesData;
  const rawProperties: CreateProperty[] = rawData?.data ?? []; //Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const total: number = rawData?.total ?? rawProperties.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const properties: PropertyItem[] = rawProperties.map((prop: CreateProperty) => {
    const locationParts = [prop.street, prop.number].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(' ') : 'Ubicación no especificada';

    // API returns organization object even though type doesn't specify it
    const propAny = prop as any;

    return {
      id: prop.id ?? 0,
      title: prop.publication_title ?? 'Sin titulo',
      price: prop.price ?? 0,
      currency: prop.currency ?? 'USD',
      location: location,
      status: prop.status ? String(prop.status) : 'DRAFT',
      organization: propAny.organization,
      user_id: prop.user_id ?? 0,
      actions: ['delete'] as const,
      images: prop.images ?? [],
    };
  }) ?? [];

  return (
      <div className="collaborators-container">        
        <div className="collaborators-content">
          <div className="collaborators-header">
            <div>
              <h1>Búsquedas y alertas</h1>              
            </div>
          </div>
          <div className="collaborators-list">
            {properties.map((property) => (
              <div key={property.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  <p className="collaborators-card-subtitle">
                    Guardado el 11/22/3231
                  </p>
                  <p className="collaborators-card-title">
                    {property.title}
                  </p>
                  
                  <div className="property-owner-info">
                    <Button variant="outline" label={property.organization?.company_name ?? 'Sin inmobiliaria'} onClick={() => {}} />
                    <Button variant="outline" label={property.organization?.company_name ?? 'Sin inmobiliaria'} onClick={() => {}} />
                    <Button variant="outline" label={property.organization?.company_name ?? 'Sin inmobiliaria'} onClick={() => {}} />
                  </div>
                </div>
                <div className="collaborators-card-actions">
                  <Select
                    options={FREQUENCY_OPTIONS}
                    value={'Inmediata'}
                    onChange={() => {}}
                    placeholder="Inmediata"
                    label="Frecuencia de alerta"
                  />
                  <div className="collaborators-card-tools">                    
                    <button
                      className="collaborators-action-button"
                      type="button"
                      aria-label="Editar alerta"
                      onClick={() => {
                        
                      }}
                    >
                      <img src={iconEdit} alt="" />
                    </button>
                    <button
                      className="collaborators-action-button"
                      type="button"
                      aria-label="Eliminar alerta"
                      onClick={() => {
                        setDeleteModal({ open: true, propertyId: property.id, propertyTitle: property.title });
                      }}
                    >
                      <img src={iconTrash} alt="" />
                    </button>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {deleteModal.open && (
        <AreYouSureModal
          title="Eliminar Propiedad"
          subTitle={`¿Está seguro que desea eliminar "${deleteModal.propertyTitle}"?`}
          text="Esta acción no se puede deshacer."
          icon={iconTrash}
          onCancel={() => setDeleteModal({ open: false, propertyId: null, propertyTitle: '' })}
          onAccept={() => {
            if (deleteModal.propertyId) deleteMutation.mutate(deleteModal.propertyId);
          }}
          acceptText={deleteMutation.isPending ? 'Eliminando...' : 'Aceptar'}
        />
      )}
      {editAlertModal?.open && (
        <CreateAlertModal
          alertId={editAlertModal.alertId}
          initialName={editAlertModal.name}
          initialFrequency={editAlertModal.frequency}
          onClose={() => setEditAlertModal(null)}
        />
      )}
      </div>
  );
}
