'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { CreateProperty } from '@/types/propiedad';
import './ResultsMap.scss';

interface ResultsMapProps {
  properties: CreateProperty[];
  initialLocationQuery?: string;
}

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires
const DEFAULT_ZOOM = 13;

interface MapBehaviorProps {
  initialLocationQuery?: string;
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

function MapBehavior({ initialLocationQuery, onMapReady }: MapBehaviorProps) {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!map) return;
    onMapReady?.(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (geocodingLib && !geocoder.current) {
      geocoder.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib]);

  useEffect(() => {
    if (!map || !geocoder.current || !initialLocationQuery?.trim()) return;

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
  }, [map, initialLocationQuery, geocodingLib]);

  return null;
}

export default function ResultsMap({ properties, initialLocationQuery }: ResultsMapProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const geoProperties = useMemo(
    () =>
      properties
        .map(p => ({ ...p, geo_lat: Number(p.geo_lat), geo_long: Number(p.geo_long) }))
        .filter(p => !isNaN(p.geo_lat) && !isNaN(p.geo_long) && p.geo_lat !== 0 && p.geo_long !== 0),
    [properties]
  );

  const center = useMemo(() => {
    if (geoProperties.length === 0) return DEFAULT_CENTER;
    const avgLat = geoProperties.reduce((s, p) => s + p.geo_lat!, 0) / geoProperties.length;
    const avgLng = geoProperties.reduce((s, p) => s + p.geo_long!, 0) / geoProperties.length;
    return { lat: avgLat, lng: avgLng };
  }, [geoProperties]);

  const handleMarkerClick = useCallback((id: number) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const handleSearchInThisArea = useCallback(() => {
    if (!mapRef.current) return;
    logViewportCorners(mapRef.current);
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
            onMapReady={(map) => {
              mapRef.current = map;
            }}
          />
          {geoProperties.map(property => {
            const isSelected = selectedId === property.id;
            const image = property.images?.[0]?.url;
            const priceLabel = `${property.currency} ${property.price.toLocaleString('es-AR')}`;

            return (
              <AdvancedMarker
                key={property.id}
                position={{ lat: property.geo_lat!, lng: property.geo_long! }}
                onClick={(e) => {
                  e.stop();
                  handleMarkerClick(property.id!);
                }}
              >
                <div className={`results-marker-wrapper ${isSelected ? 'active' : ''}`}>
                  {isSelected && (
                    <div className="results-marker-info" onClick={e => e.stopPropagation()}>
                      {image && (
                        <img
                          src={image}
                          alt={property.publication_title ?? ''}
                          className="results-marker-info-image"
                        />
                      )}
                      {!image && (
                        <div className="results-marker-info-no-image" />
                      )}
                      <div className="results-marker-info-price">{priceLabel}</div>
                    </div>
                  )}
                  <div className="results-marker-pill">{priceLabel}</div>
                </div>
              </AdvancedMarker>
            );
          })}
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
