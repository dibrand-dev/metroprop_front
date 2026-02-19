'use client';

import { useState, useMemo } from 'react';
import PropertyCard from '../PropertyCard/PropertyCard'; 
import PropertyCardMapList from './PropertyCardMapList';
import PropertyCardGridList from './PropertyCardGridList';
import FilterBar from './FilterBar';
import SortDropdown from './SortDropdown';
import './Results.scss';

interface Property {
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
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function Results() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevant');

  // Mock data - in production this would come from API/search results
  // useMemo prevents recreating the array on every render (infinite loop fix)
  const properties: Property[] = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: `property-${i + 1}`,
    price: 198000,
    currency: 'USD' as const,
    pricePerSqm: 2100,
    title: 'Juan Francisco Segu 4500',
    address: 'Juan Francisco Segu 4500',
    rooms: 4,
    bathrooms: 2,
    area: 310,
    image: '/images/property-placeholder.png',
    agencyLogo: '/images/remax.png',
    isFavorite: false,
    coordinates: {
      lat: -34.5835 + (i * 0.003),
      lng: -58.4227 + (i * 0.003),
    },
  })), []);

  const totalProperties = 76500;

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Implement sorting logic
  };

  const handleToggleFavorite = (propertyId: string) => {
    // Implement favorite toggle
    console.log('Toggle favorite:', propertyId);
  };

  return (
    <div className="results-page">
      {/* Filter Bar - Desktop only */}
      <FilterBar />

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
            {properties.map((property, index) => (
              <div
                key={property.id}
                className="map-marker"
                style={{
                  top: `${50 + (index % 6 - 2.5) * 8}%`,
                  left: `${50 + (Math.floor(index / 6) - 1) * 12}%`,
                }}
              >
                <div className="marker-bubble">
                  ${property.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* List View - Always visible on desktop, toggle on mobile */}
        <div className={`list-view ${viewMode === 'list' ? 'active' : ''} ${layoutMode === 'grid' ? 'full-width' : ''}`}>
          <div className="list-header">
            <div className="results-count">
              {totalProperties.toLocaleString()} propiedades
              
              {/* Grid/List toggle - Desktop only */}
              <div className="layout-toggle">
                <button
                  className={`layout-btn ${layoutMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setLayoutMode('grid')}
                  title="Vista de cuadrícula"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
                    <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
                    <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
                    <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </button>
                <button
                  className={`layout-btn ${layoutMode === 'list' ? 'active' : ''}`}
                  onClick={() => setLayoutMode('list')}
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
                <PropertyCardGridList 
                  key={property.id}
                  property={property}
                  onFavorite={() => handleToggleFavorite(property.id)}
                />
              ))}
            </div>
          )}

          {/* List Layout */}
          {layoutMode === 'list' && (
            <div className="property-list">
              {properties.map((property) => (
                <div key={property.id} className="property-wrapper">
                    <PropertyCardMapList
                      property={property}
                      onFavorite={() => handleToggleFavorite(property.id)}
                    />  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
