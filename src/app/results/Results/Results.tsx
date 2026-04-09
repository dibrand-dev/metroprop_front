'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PropertyCardMapList from './PropertyCardMapList';
import PropertyCardGridList from './PropertyCardGridList';
import FilterBar from './FilterBar';
import SortDropdown from './SortDropdown';
import ResultsMap from './ResultsMap';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import './Results.scss';
import { fetchProperties, searchParamsToFilterParams } from '@/lib/properties';
// import type { PropertyListItem } from '@/types/property-api';
import { CreateProperty } from '@/types/propiedad';
import type { MapDataItem } from '@/types/property-api';


export default function Results() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('relevant');

  // ─── Fetch properties whenever filters change (without route reload) ──────
  const searchParams = useSearchParams();
  const [activeSearch, setActiveSearch] = useState(searchParams.toString());
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get('page') ?? '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  useEffect(() => {
    // Sync with URL changes coming from navigation / deep-linking.
    setActiveSearch(searchParams.toString());
    const p = parseInt(searchParams.get('page') ?? '1', 10);
    setCurrentPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  useEffect(() => {
    const handleFiltersChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ search?: string }>).detail;
      const nextSearch = detail?.search;
      setActiveSearch(typeof nextSearch === 'string' ? nextSearch : window.location.search.slice(1));
    };
    const handlePopState = () => {
      setActiveSearch(window.location.search.slice(1));
    };

    window.addEventListener('results:filters-changed', handleFiltersChanged as EventListener);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('results:filters-changed', handleFiltersChanged as EventListener);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const activeSearchParams = useMemo(() => new URLSearchParams(activeSearch), [activeSearch]);

  const limit = parseInt(activeSearchParams.get('limit') ?? '20', 10) || 20;

  const hasFilters = useMemo(() => {
    const ignored = new Set(['page', 'limit']);
    let hasRelevant = false;
    for (const key of activeSearchParams.keys()) {
      if (!ignored.has(key)) hasRelevant = true;
    }
    if (!hasRelevant) return false;
    // Require a location (q or location_id) or explicit map bounds
    const q = activeSearchParams.get('q')?.trim();
    const locationId = activeSearchParams.get('location_id')?.trim();
    if (q || locationId) return true;
    const hasBounds = ['northEastLat', 'northEastLng', 'southWestLat', 'southWestLng']
      .every(k => !!activeSearchParams.get(k)?.trim());
    return hasBounds;
  }, [activeSearchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['properties', activeSearch, currentPage],
    queryFn: () => fetchProperties({
      ...searchParamsToFilterParams(new URLSearchParams(activeSearch)),
      page: currentPage,
      limit,
    }),
    staleTime: 30_000,
    enabled: hasFilters,
  });

  const locationQuery = activeSearchParams.get('q')?.trim() ?? '';

  const initialBoundsFromUrl = useMemo(() => {
    const northEastLat = parseFloat(activeSearchParams.get('northEastLat') ?? '');
    const northEastLng = parseFloat(activeSearchParams.get('northEastLng') ?? '');
    const southWestLat = parseFloat(activeSearchParams.get('southWestLat') ?? '');
    const southWestLng = parseFloat(activeSearchParams.get('southWestLng') ?? '');
    if ([northEastLat, northEastLng, southWestLat, southWestLng].some(isNaN)) return null;
    return { northEastLat, northEastLng, southWestLat, southWestLng };
  }, [activeSearchParams]);

  const properties: CreateProperty[] = (data?.data ?? []);
  const totalProperties = data?.total ?? 0;
  const totalPages = Math.ceil(totalProperties / limit);

  // ─── Stable mapData — only updates when filters change, not on pagination ─
  const filterKey = useMemo(() => {
    const p = new URLSearchParams(activeSearch);
    p.delete('page');
    return p.toString();
  }, [activeSearch]);
  const stableMapDataRef = useRef<{ key: string; items: MapDataItem[] }>({ key: '', items: [] });
  if (!isLoading && data?.mapData && stableMapDataRef.current.key !== filterKey) {
    stableMapDataRef.current = { key: filterKey, items: data.mapData };
  }
  const mapData = stableMapDataRef.current.items;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const params = new URLSearchParams(activeSearch);
    params.set('page', String(page));
    const nextSearch = params.toString();
    window.history.replaceState(window.history.state, '', `/results?${nextSearch}`);
    window.dispatchEvent(new CustomEvent('results:filters-changed', { detail: { search: nextSearch } }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginatorPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 4) pages.push('...');
    for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(activeSearch);
    params.set('order_by', value);
    const nextSearch = params.toString();
    window.history.replaceState(window.history.state, '', `/results?${nextSearch}`);
    window.dispatchEvent(new CustomEvent('results:filters-changed', { detail: { search: nextSearch } }));
  };

  const handleToggleFavorite = (propertyId: number) => {
    // Implement favorite toggle
    console.log('Toggle favorite:', propertyId);
  };

  return (
    <div className="results-page">
      {/* Filter Bar - Desktop only */}
      <FilterBar setViewMode={setViewMode} viewMode={viewMode} mapData={mapData} />

      {/* Error state */}
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
            <ResultsMap properties={properties} mapData={mapData} initialLocationQuery={locationQuery} initialBounds={initialBoundsFromUrl} />
          </div>
        </div>

        {/* List View - Always visible on desktop, toggle on mobile */}
        <div className={`list-view ${viewMode === 'list' ? 'active' : ''} ${layoutMode === 'grid' ? 'full-width' : ''}`}>
          <div className="list-header" style={{ display: !hasFilters ? 'none' : 'flex' }}>
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
          {/* Grid / List Layout */}
          {!hasFilters ? (
            <div className="results-no-filters">
              <img src="/images/no_filtros.svg" alt="Sin filtros" className="results-no-filters-img" />
              <p className="results-no-filters-text">Para continuar ingresa algún filtro a tu búsqueda</p>
            </div>
          ) : isLoading ? (
            <PropertyCardSkeleton layout={layoutMode} count={limit} />
          ) : layoutMode === 'grid' ? (
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
          ) : (
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

          {/* Paginator */}
          {totalPages > 1 && (
            <div className="results-paginator">
              <button
                className="results-paginator-btn results-paginator-arrow"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                ‹
              </button>

              {getPaginatorPages().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="results-paginator-ellipsis">…</span>
                ) : (
                  <button
                    key={page}
                    className={`results-paginator-btn ${currentPage === page ? 'is-active' : ''}`}
                    onClick={() => handlePageChange(page as number)}
                    aria-label={`Página ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="results-paginator-btn results-paginator-arrow"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Página siguiente"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
