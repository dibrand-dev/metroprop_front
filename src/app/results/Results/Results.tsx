'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PropertyCardMapList from './PropertyCardMapList';
import PropertyCardGridList from './PropertyCardGridList';
import FilterBar from './FilterBar';
import SortDropdown from './SortDropdown';
import ResultsMap from './ResultsMap';
import './Results.scss';
import { fetchProperties, searchParamsToFilterParams } from '@/lib/properties';
// import type { PropertyListItem } from '@/types/property-api';
import { CreateProperty } from '@/types/propiedad';

// ─── Card-compatible display type ────────────────────────────────────────────
/*
interface DisplayProperty {
  id: string;
  price: number;
  currency: 'USD' | 'ARS' | 'EUR';
  pricePerSqm?: number;
  title: string;
  address: string;
  rooms: number;
  bathrooms: number;
  area: number;
  image: string;
  agencyLogo?: string;
  isFavorite: boolean;
  coordinates?: { lat: number; lng: number };
}

function toDisplayProperty(item: PropertyListItem): CreateProperty {
  return {
    id: item.id,
    price: item.price,
    currency: (item.currency as DisplayProperty['currency']) || 'USD',
    pricePerSqm: item.price_square_meter,
    title: item.publication_title,
    address: [item.street, item.number].filter(Boolean).join(' ') || item.publication_title,
    rooms: item.room_amount ?? 0,
    bathrooms: item.bathroom_amount ?? 0,
    area: item.total_surface ?? item.roofed_surface ?? 0,
    image: item.images?.[0]?.url ?? '',
    agencyLogo: item.organization?.logo_url,
    isFavorite: false,
    coordinates:
      item.geo_lat && item.geo_long
        ? { lat: item.geo_lat, lng: item.geo_long }
        : undefined,
  };
}*/

export default function Results() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('relevant');

  // ─── Fetch properties whenever the URL search params change ───────────────
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['properties', searchParams.toString()],
    queryFn: () => fetchProperties(searchParamsToFilterParams(searchParams)),
    staleTime: 30_000,
  });

  const properties: CreateProperty[] = (data?.data ?? [])//.map(toDisplayProperty);
  const totalProperties = data?.total ?? 0;

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Implement sorting logic
  };

  const handleToggleFavorite = (propertyId: number) => {
    // Implement favorite toggle
    console.log('Toggle favorite:', propertyId);
  };

  return (
    <div className="results-page">
      {/* Filter Bar - Desktop only */}
      <FilterBar />

      {/* Loading / Error states */}
      {isLoading && (
        <div className="results-loading">
          <span>Cargando propiedades...</span>
        </div>
      )}
      {isError && (
        <div className="results-error">
          <span>No se pudieron cargar las propiedades. Intente nuevamente.</span>
        </div>
      )}

      {/* Mobile Header with View Toggle */}
      <div className="results-header">
        <div className="results-count">
          {totalProperties.toLocaleString()} propiedades encontradas
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="3" width="14" height="2" fill="currentColor" />
              <rect x="2" y="8" width="14" height="2" fill="currentColor" />
              <rect x="2" y="13" width="14" height="2" fill="currentColor" />
            </svg>
            Lista
          </button>
          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 5l5-3 6 3 5-3v12l-5 3-6-3-5 3V5z" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            Mapa
          </button>
        </div>
      </div>

      <div className="results-content">
        {/* Map View - Always visible on desktop (unless grid layout), toggle on mobile */}
        <div className={`map-view ${viewMode === 'map' ? 'active' : ''} ${layoutMode === 'grid' ? 'hidden-grid' : ''}`}>
          <div className="map-container">
            <ResultsMap properties={properties} />
          </div>
        </div>

        {/* List View - Always visible on desktop, toggle on mobile */}
        <div className={`list-view ${viewMode === 'list' ? 'active' : ''} ${layoutMode === 'grid' ? 'full-width' : ''}`}>
          <div className="list-header">
              <span className="results-count">{totalProperties.toLocaleString()} propiedades</span>
              <div className='flex items-center h-full gap-4'>
                <SortDropdown value={sortBy} onChange={handleSortChange} />
                {/* Grid/List toggle - Desktop only */}
                <div className="layout-toggle">
                  <button
                    className={`layout-btn ${layoutMode === 'list' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('list')}
                    title="Vista de mapa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 3.00001V17.5M15 6.50001V20.5M5.253 4.19601L4.026 4.90801C3.037 5.48101 2.543 5.76801 2.272 6.24501C2 6.72201 2 7.30201 2 8.46401V16.628C2 18.154 2 18.918 2.342 19.342C2.57 19.624 2.889 19.814 3.242 19.877C3.772 19.972 4.422 19.595 5.72 18.842C6.602 18.331 7.45 17.799 8.505 17.944C8.985 18.009 9.442 18.237 10.358 18.692L14.171 20.588C14.996 20.998 15.004 21 15.921 21H18C19.886 21 20.828 21 21.414 20.401C22 19.803 22 18.839 22 16.911V10.171C22 8.24401 22 7.28101 21.414 6.68101C20.828 6.08301 19.886 6.08301 18 6.08301H15.921C15.004 6.08301 14.996 6.08101 14.171 5.67101L10.84 4.01501C9.449 3.32301 8.753 2.97701 8.012 3.00001C7.271 3.02301 6.6 3.41501 5.253 4.19601Z" stroke="#006AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className={`layout-btn ${layoutMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('grid')}
                    title="Vista de lista"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="2" fill="currentColor" />
                        <rect x="3" y="11" width="18" height="2" fill="currentColor" />
                        <rect x="3" y="17" width="18" height="2" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
          </div>  
          {/* Grid Layout */}
          {layoutMode === 'grid' && (
            <div className="property-grid">
              {properties.map((property) => (
                <a href={`/propertyDetail/${property.id}`} key={property.id} className="property-link">
                  <PropertyCardGridList 
                    key={property.id}
                    property={property}
                    onFavorite={() => handleToggleFavorite(property.id ?? 0)}
                  />
                </a>
              ))}
            </div>
          )}

          {/* List Layout */}
          {layoutMode === 'list' && (
            <div className="property-list">
              {properties.map((property) => (
                <a href={`/propertyDetail/${property.id}`} key={property.id} className="property-link">
                  <div className="property-wrapper">
                    <PropertyCardMapList
                      property={property}
                      onFavorite={() => handleToggleFavorite(property.id ?? 0)}
                    />  
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
