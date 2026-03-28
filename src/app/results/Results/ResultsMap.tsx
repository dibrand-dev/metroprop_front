'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { APIProvider, Map, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useQuery } from '@tanstack/react-query';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { CreateProperty } from '@/types/propiedad';
import type { MapDataItem } from '@/types/property-api';
import './ResultsMap.scss';
import { API_BASE_URL } from '@/utils/utils';
import PropertyCardGridList from './PropertyCardGridList';

interface Bounds {
  northEastLat: number;
  northEastLng: number;
  southWestLat: number;
  southWestLng: number;
}

interface ResultsMapProps {
  properties: CreateProperty[];
  mapData: MapDataItem[];
  initialLocationQuery?: string;
  initialBounds?: Bounds | null;
}

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires
const DEFAULT_ZOOM = 13;

interface MapBehaviorProps {
  initialLocationQuery?: string;
  initialBounds?: Bounds | null;
  onMapReady?: (map: google.maps.Map) => void;
}

function logViewportCorners(map: google.maps.Map) {
  const bounds = map.getBounds();
  if (!bounds) return;

  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();

  const corners = {
    northWest: { lat: northEast.lat(), lng: southWest.lng() },
    northEast: { lat: northEast.lat(), lng: northEast.lng() },
    southWest: { lat: southWest.lat(), lng: southWest.lng() },
    southEast: { lat: southWest.lat(), lng: northEast.lng() },
  };

  console.log('Results map viewport corners after requested center:', corners);
}

function MapBehavior({ initialLocationQuery, initialBounds, onMapReady }: MapBehaviorProps) {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const hasFittedBoundsRef = useRef(!initialBounds); // true means "skip fitting" — only fit if bounds were present on mount

  useEffect(() => {
    if (!map) return;
    onMapReady?.(map);
  }, [map, onMapReady]);

  // Fit map to bounding box only once on initial load
  useEffect(() => {
    if (!map || !initialBounds || hasFittedBoundsRef.current) return;
    hasFittedBoundsRef.current = true;
    map.fitBounds({
      north: initialBounds.northEastLat,
      east: initialBounds.northEastLng,
      south: initialBounds.southWestLat,
      west: initialBounds.southWestLng,
    });
  }, [map, initialBounds]);

  useEffect(() => {
    if (geocodingLib && !geocoder.current) {
      geocoder.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib]);

  useEffect(() => {
    if (!map || !geocoder.current || !initialLocationQuery?.trim() || initialBounds) return;

    const rawQuery = initialLocationQuery.trim();
    const query = /argentina/i.test(rawQuery) ? rawQuery : `${rawQuery}, Argentina`;

    geocoder.current.geocode({
      address: query,
      componentRestrictions: { country: 'AR' },
      region: 'ar',
    }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        map.panTo({ lat: location.lat(), lng: location.lng() });
        map.setZoom(DEFAULT_ZOOM);

        // Wait for map movement to settle, then print the final viewport corners once.
        google.maps.event.addListenerOnce(map, 'idle', () => {
          logViewportCorners(map);
        });
      }
    });
  }, [map, initialLocationQuery, geocodingLib, initialBounds]);

  return null;
}

// ─── Clustered Markers ───────────────────────────────────────────────────────

interface ClusteredMarkersProps {
  mapData: MapDataItem[];
  selectedId: number | null;
  onMarkerClick: (id: number) => void;
}

function ClusteredMarkers({ mapData, selectedId, onMarkerClick }: ClusteredMarkersProps) {
  const map = useMap();
  const markerLib = useMapsLibrary('marker');
  const markersRef = useRef<Record<number, google.maps.marker.AdvancedMarkerElement>>({});
  const prevSelectedRef = useRef<number | null>(null);

  // Create / recreate clusterer and all markers whenever map or data changes
  useEffect(() => {
    if (!map || !markerLib) return;

    const clusterer = new MarkerClusterer({
      map,
      renderer: {
        render: ({ count, position }) => {
          const div = document.createElement('div');
          div.style.cssText = [
            'width:40px', 'height:40px', 'border-radius:50%',
            'background:#020D4B', 'color:#fff',
            'display:flex', 'align-items:center', 'justify-content:center',
            'font-size:13px', 'font-weight:600', 'cursor:pointer',
            'border:2px solid rgba(255,255,255,0.7)',
            'box-shadow:0 2px 8px rgba(0,0,0,0.4)',
          ].join(';');
          div.textContent = String(count);
          return new markerLib.AdvancedMarkerElement({ position, content: div });
        },
      },
      onClusterClick: (_e, cluster) => {
        if (cluster.bounds) map.fitBounds(cluster.bounds, 80);
      },
    });

    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    const newMarkersById: Record<number, google.maps.marker.AdvancedMarkerElement> = {};

    mapData.forEach(item => {
      const dot = document.createElement('div');
      dot.style.cssText = [
        'width:24px', 'height:24px', 'border-radius:50%',
        `background:${selectedId === item.id ? '#0041D9' : '#020D4B'}`,
        'cursor:pointer',
      ].join(';');
      const marker = new markerLib.AdvancedMarkerElement({
        position: { lat: item.lat, lng: item.lng },
        content: dot,
      });
      marker.addListener('click', () => onMarkerClick(item.id));
      newMarkersById[item.id] = marker;
      markers.push(marker);
    });

    clusterer.addMarkers(markers);
    markersRef.current = newMarkersById;
    prevSelectedRef.current = selectedId;

    return () => {
      clusterer.clearMarkers();
      clusterer.setMap(null);
      markers.forEach(m => { m.map = null; });
      markersRef.current = {};
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markerLib, mapData, onMarkerClick]);

  // Update only the dot color when selection changes (no full re-render)
  useEffect(() => {
    const prev = prevSelectedRef.current;
    if (prev !== null && markersRef.current[prev]) {
      (markersRef.current[prev].content as HTMLDivElement).style.backgroundColor = '#020D4B';
    }
    if (selectedId !== null && markersRef.current[selectedId]) {
      (markersRef.current[selectedId].content as HTMLDivElement).style.backgroundColor = '#0041D9';
    }
    prevSelectedRef.current = selectedId;
  }, [selectedId]);

  return null;
}

export default function ResultsMap({ properties, mapData, initialLocationQuery, initialBounds }: ResultsMapProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const propertiesById = useMemo(() => {
    const acc: Record<number, CreateProperty> = {};
    for (const p of properties) {
      if (p.id != null) acc[p.id] = p;
    }
    return acc;
  }, [properties]);

  const center = useMemo(() => {
    if (mapData.length === 0) return DEFAULT_CENTER;
    const avgLat = mapData.reduce((s, p) => s + p.lat, 0) / mapData.length;
    const avgLng = mapData.reduce((s, p) => s + p.lng, 0) / mapData.length;
    return { lat: avgLat, lng: avgLng };
  }, [mapData]);

  const selectedInProperties = selectedId !== null ? (propertiesById[selectedId] ?? null) : null;
  const needsFetch = selectedId !== null && selectedInProperties === null;

  const { data: fetchedProperty, isLoading: isFetchingProperty } = useQuery<CreateProperty>({
    queryKey: ['property', selectedId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/properties/${selectedId}`);
      if (!res.ok) throw new Error('Error fetching property');
      return res.json();
    },
    enabled: needsFetch,
    staleTime: 60_000,
  });

  const selectedProperty = selectedInProperties ?? (needsFetch ? (fetchedProperty ?? null) : null);

  const handleMarkerClick = useCallback((id: number) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const handleSearchInThisArea = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();

    const params = new URLSearchParams(window.location.search);
    // Clear text-based location search — bbox takes over as the spatial filter
    params.delete('q');
    params.delete('location_id');
    params.set('northEastLat', String(northEast.lat()));
    params.set('northEastLng', String(northEast.lng()));
    params.set('southWestLat', String(southWest.lat()));
    params.set('southWestLng', String(southWest.lng()));

    const nextSearch = params.toString();
    window.history.replaceState(window.history.state, '', `/results?${nextSearch}`);
    window.dispatchEvent(
      new CustomEvent('results:filters-changed', { detail: { search: nextSearch } })
    );
  }, []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <div className="results-map-shell">
        <Map
          defaultCenter={center}
          defaultZoom={DEFAULT_ZOOM}
          mapId="DEMO_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          onClick={() => setSelectedId(null)}
        >
          <MapBehavior
            initialLocationQuery={initialLocationQuery}
            initialBounds={initialBounds}
            onMapReady={(map) => {
              mapRef.current = map;
            }}
          />
          <ClusteredMarkers
            mapData={mapData}
            selectedId={selectedId}
            onMarkerClick={handleMarkerClick}
          />
          {(() => {
            const selectedItem = selectedId !== null ? mapData.find(i => i.id === selectedId) ?? null : null;
            if (!selectedItem) return null;
            return (
              <InfoWindow
                position={{ lat: selectedItem.lat, lng: selectedItem.lng }}
                onCloseClick={() => setSelectedId(null)}
              >
                {isFetchingProperty && !selectedProperty ? (
                  <div style={{ padding: '8px' }}>Cargando...</div>
                ) : selectedProperty ? (
                  <PropertyCardGridList property={selectedProperty} />
                ) : null}
              </InfoWindow>
            );
          })()}
        </Map>
        <button
          type="button"
          className="results-map-search-area-btn"
          onClick={handleSearchInThisArea}
        >
          Buscar en esta ubicacion
        </button>
      </div>
    </APIProvider>
  );
}
