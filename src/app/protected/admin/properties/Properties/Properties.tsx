'use client';

import { useState } from 'react';
import './Properties.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import InputField2 from '@/ui/InputField2/InputField2';
import type { CreateProperty } from '@/types/propiedad';
import LocationAutocompleteInput from '@/components/LocationAutocompleteInput/LocationAutocompleteInput';
import Select from '@/ui/Select/Select';

const iconArrowBack = '/icons/arrow.svg';
const iconTrash = '/icons/trash.svg';
const iconView = '/icons/verDetalle.svg';
const propertiesDescription = 'Aca podes ver la lista de todas las propiedades en el sistema y eliminarlas.';

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

export default function Properties() {
  const queryClient = useQueryClient();
  const { showMenu, setShowMenu } = useAdminMenu();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; propertyId: number | null; propertyTitle: string }>({ open: false, propertyId: null, propertyTitle: '' });
  const [locationText, setLocationText] = useState('');
  
  const deleteMutation = useMutation({
    mutationFn: (propertyId: number) =>
      apiFetch(`${API_BASE_URL}/properties/${propertyId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, propertyId: null, propertyTitle: '' });
      queryClient.invalidateQueries({ queryKey: ['all-properties'] });
    },
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() === '') {
      setSearchId(null);
    }
  };

  const handleSearchById = () => {
    const trimmed = searchQuery.trim();
    const num = Number(trimmed);
    if (trimmed && !Number.isNaN(num) && num > 0) {
      setSearchId(num);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchById();
  };
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
    <>
      <div className={`collaborators-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="collaborators-mobile-header">
          <button
            className="collaborators-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Propiedades</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div>
              <h1>Propiedades</h1>
              <p>{propertiesDescription}</p>
            </div>
          </div>

         <div className="collaborators-filters">
            {/* <div className="filter-search-location">
              <LocationAutocompleteInput
                value={locationText}
                onChange={setLocationText}
                placeholder="Buscar por ubicación"
                // onSubmit={(value, locationId) => router.replace(`/protected?${value ? `q=${encodeURIComponent(value)}&` : ''}${locationId != null ? `location_id=${locationId}&` : ''}operation_type=${searchActive}&page=1&limit=20`)}
              />
            </div>
*/}
            <div className="filter-search-id">
              <InputField2
                  placeholder="ID"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleSearchKeyDown}
                  icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
                  iconPosition="right"
                  onIconClick={handleSearchById}
              />
            </div>
{/*
            <div className="filter-select-operation">
              <Select
                label="Operación"
                options={operationOptions}
                value={operationType ?? ''}
                onChange={(value) => {
                  setOperationType(value || null);
                  setCurrentPage(1);
                }}
                placeholder="Todas"
              />
            </div>

            <div className="filter-select-type">
              <Select
                label="Tipo"
                options={propertyTypeOptions}
                value={propertyType ?? ''}
                onChange={(value) => {
                  setPropertyType(value || null);
                  setCurrentPage(1);
                }}
                placeholder="Todos"
              />
            </div>

            <button
              type="button"
              className="filter-clear-btn"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>*/}
          </div>

          <div className="collaborators-list">
            {properties.map((property) => (
              <div key={property.id} className="collaborators-card">
                <div className='flex gap-4'>
                  {property.images?.[0] && <img src={property.images[0].url ? setImagePath(property.images[0].url) : '/images/default-property.jpg'} alt={property.title} width={80} height={80} style={{ objectFit: 'cover'}} />}
                  <div className="collaborators-card-info">
                    <p className="collaborators-card-title">
                      {property.title}
                    </p>
                    <p className="collaborators-card-subtitle">
                      ID: {property.id} | {property.currency} {property.price.toLocaleString('es-AR')} | {property.location}
                    </p>
                    <div className="property-owner-info">
                      {property.organization ? (
                        <div className="property-organization">
                          {property.organization.company_logo && (
                            <img 
                              src={setImagePath(property.organization.company_logo)} 
                              alt={property.organization.company_name}
                              className="organization-logo"
                            />
                          )}
                          <span className="organization-name">{property.organization.company_name}</span>
                        </div>
                      ) : (
                        <span className="property-user-id">Usuario ID: {property.user_id}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="collaborators-card-actions">
                  {/*<span className="collaborators-role-chip">{property.status}</span>*/}
                  <div className="collaborators-card-tools">
                    <button
                      className="collaborators-action-button"
                      type="button"
                      aria-label="Eliminar propiedad"
                      onClick={() => {
                        setDeleteModal({ open: true, propertyId: property.id, propertyTitle: property.title });
                      }}
                    >
                      <img src={iconTrash} alt="" />
                    </button>
                    <button
                      className="collaborators-action-button"
                      type="button"
                      aria-label="Ver detalle"
                      onClick={() => {
                        window.open(`/properties/${property.id}`, '_blank');
                      }}
                    >
                      <img src={iconView} alt="" />
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

        <div className="collaborators-mobile-footer">
          {/* Footer content */}
        </div>
      </div>

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
    </>
  );
}
