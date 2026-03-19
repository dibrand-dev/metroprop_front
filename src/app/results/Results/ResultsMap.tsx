'use client';

import { useState, useCallback, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { CreateProperty } from '@/types/propiedad';
import './ResultsMap.scss';

interface ResultsMapProps {
  properties: CreateProperty[];
}

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires
const DEFAULT_ZOOM = 13;

export default function ResultsMap({ properties }: ResultsMapProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}>
      <Map
        defaultCenter={center}
        defaultZoom={DEFAULT_ZOOM}
        mapId="DEMO_MAP_ID"
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
        onClick={() => setSelectedId(null)}
      >
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
    </APIProvider>
  );
}
