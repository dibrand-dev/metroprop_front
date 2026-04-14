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
            'background:#006aff', 'color:#fff',
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
        `background:${selectedId === item.id ? '#020D4B' : '#006aff'}`,
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
  const drawingPoints = useRef<google.maps.LatLngLiteral[]>([]);
  const drawingOverlay = useRef<google.maps.Polyline | null>(null);
  const drawListenersRef = useRef<google.maps.MapsEventListener[]>([]);

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
      const res = await fetch(`${API_BASE_URL}/properties/${selectedId}?format=card`);
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

    // Clear drawn polygon if present
    if (drawnPolygon) {
      drawnPolygon.setMap(null);
      setDrawnPolygon(null);
    }

    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();

    const params = new URLSearchParams(window.location.search);
    // Clear text-based location search — bbox takes over as the spatial filter
    params.delete('q');
    params.delete('location_id');
    params.delete('polygon');
    params.set('northEastLat', String(northEast.lat()));
    params.set('northEastLng', String(northEast.lng()));
    params.set('southWestLat', String(southWest.lat()));
    params.set('southWestLng', String(southWest.lng()));
    params.set('page', '1');

    const nextSearch = params.toString();
    window.history.replaceState(window.history.state, '', `/results?${nextSearch}`);
    window.dispatchEvent(
      new CustomEvent('results:filters-changed', { detail: { search: nextSearch } })
    );
  }, [drawnPolygon]);

  const startDrawing = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clean up any existing polygon
    if (drawnPolygon) {
      drawnPolygon.setMap(null);
      setDrawnPolygon(null);
    }

    setIsDrawing(true);
    setSelectedId(null);
    drawingPoints.current = [];

    // Disable map dragging while drawing
    map.setOptions({ draggable: false, scrollwheel: false });

    // Create a polyline to show drawing in progress
    const polyline = new google.maps.Polyline({
      map,
      strokeColor: '#006aff',
      strokeOpacity: 0.8,
      strokeWeight: 2,
    });
    drawingOverlay.current = polyline;

    let isMouseDown = false;

    const finishDrawing = () => {
      if (!isMouseDown) return;
      isMouseDown = false;

      // Clean up listeners
      drawListenersRef.current.forEach(l => l.remove());
      drawListenersRef.current = [];

      // Remove polyline
      polyline.setMap(null);
      drawingOverlay.current = null;

      // Re-enable map interaction
      map.setOptions({ draggable: true, scrollwheel: true });
      setIsDrawing(false);

      if (drawingPoints.current.length < 3) return;

      // Create a filled polygon
      const polygon = new google.maps.Polygon({
        paths: drawingPoints.current,
        strokeColor: '#006aff',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#006aff',
        fillOpacity: 0.15,
        map,
      });
      setDrawnPolygon(polygon);

      // Extract bounding box from the polygon and trigger search
      let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
      for (const pt of drawingPoints.current) {
        if (pt.lat < minLat) minLat = pt.lat;
        if (pt.lat > maxLat) maxLat = pt.lat;
        if (pt.lng < minLng) minLng = pt.lng;
        if (pt.lng > maxLng) maxLng = pt.lng;
      }

      const params = new URLSearchParams(window.location.search);
      /*
      params.delete('q');
      params.delete('location_id');
      params.delete('northEastLat');
      params.delete('northEastLng');
      params.delete('southWestLat');
      params.delete('southWestLng');
      */
      params.set('page', '1');
      params.set('polygon', drawingPoints.current.map(pt => `LatLng(${pt.lat.toFixed(4)},${pt.lng.toFixed(4)})`).join(','));

      const nextSearch = params.toString();
      window.history.replaceState(window.history.state, '', `/results?${nextSearch}`);
      window.dispatchEvent(
        new CustomEvent('results:filters-changed', { detail: { search: nextSearch } })
      );
    };

    const handleMouseDown = (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      isMouseDown = true;
      drawingPoints.current = [{ lat: e.latLng.lat(), lng: e.latLng.lng() }];
      polyline.setPath(drawingPoints.current);
    };

    const handleMouseMove = (e: google.maps.MapMouseEvent) => {
      if (!isMouseDown || !e.latLng) return;
      drawingPoints.current.push({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      polyline.setPath(drawingPoints.current);
    };

    // Use window-level mouseup to reliably catch mouse release anywhere on screen
    const handleWindowMouseUp = () => finishDrawing();
    window.addEventListener('mouseup', handleWindowMouseUp);

    const l1 = map.addListener('mousedown', handleMouseDown);
    const l2 = map.addListener('mousemove', handleMouseMove);
    drawListenersRef.current = [
      l1,
      l2,
      { remove: () => window.removeEventListener('mouseup', handleWindowMouseUp) } as google.maps.MapsEventListener,
    ];
  }, [drawnPolygon]);

  const clearDrawnArea = useCallback(() => {
    if (drawnPolygon) {
      drawnPolygon.setMap(null);
      setDrawnPolygon(null);
    }
    // Remove bbox params and re-fetch
    const params = new URLSearchParams(window.location.search);
    params.delete('polygon');
    const nextSearch = params.toString();
    window.history.replaceState(window.history.state, '', `/results?${nextSearch}`);
    window.dispatchEvent(
      new CustomEvent('results:filters-changed', { detail: { search: nextSearch } })
    );
  }, [drawnPolygon]);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <div className="results-map-shell">
        <Map
          defaultCenter={center}
          defaultZoom={DEFAULT_ZOOM}
          mapId="36c9855b62844f229c766850"
          style={{ width: '100%', height: '100%', cursor: isDrawing ? 'crosshair' : '' }}
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
                position={{ lat: selectedItem.lat, lng: selectedItem.lng}}
                onCloseClick={() => setSelectedId(null)}
                pixelOffset={[0, -14]}
                style={{ padding: 0, width: 302, height: 190 }}
              >
                {isFetchingProperty && !selectedProperty ? (
                  <div style={{ padding: '8px' }}>Cargando...</div>
                ) : selectedProperty ? (
                  <a href={`/propertyDetail/${selectedProperty.id}`} className='linkToPropertyInfoWindow'><PropertyCardGridList property={selectedProperty} /></a>
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

        {drawnPolygon ? (
          <button
            type="button"
            className="results-map-draw-btn results-map-clear-area-btn"
            onClick={clearDrawnArea}
            title="Borrar area dibujada"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Borrar dibujo
          </button>
        ) : (
          <button
            type="button"
            className={`results-map-draw-btn ${isDrawing ? 'is-active' : ''}`}
            onClick={startDrawing}
            title="Dibujar area de busqueda"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            {isDrawing ? 'Dibujando...' : 'Dibujar area'}
          </button>
        )}
      </div>
    </APIProvider>
  );
}
