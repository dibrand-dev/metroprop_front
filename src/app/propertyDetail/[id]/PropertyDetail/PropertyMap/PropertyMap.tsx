'use client';

import { useState, useEffect, useRef } from 'react';
import { Map, AdvancedMarker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import './PropertyMap.scss';

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

interface LatLng {
  lat: number;
  lng: number;
}

interface PropertyMapProps {
  address: string;
  lat?: number;
  lng?: number;
}

// Must render inside <Map> to access useMap()
function MapContent({
  initialAddress,
  initialLat,
  initialLng,
  inputRef,
}: {
  initialAddress: string;
  initialLat?: number;
  initialLng?: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const placesLib = useMapsLibrary('places');
  const [position, setPosition] = useState<LatLng | null>(null);

  // Use provided coordinates or geocode the address
  useEffect(() => {
    if (!map) return;
    if (initialLat != null && initialLng != null) {
      const latlng = { lat: initialLat, lng: initialLng };
      setPosition(latlng);
      map.panTo(latlng);
      map.setZoom(15);
      return;
    }
    if (!geocodingLib || !initialAddress) return;
    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ address: initialAddress }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        const latlng = { lat: loc.lat(), lng: loc.lng() };
        setPosition(latlng);
        map.panTo(latlng);
        map.setZoom(15);
      }
    });
  }, [geocodingLib, initialAddress, initialLat, initialLng, map]);

  // Wire up Places Autocomplete on the external search input
  useEffect(() => {
    if (!placesLib || !inputRef.current || !map) return;
    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ['geometry', 'formatted_address'],
    });
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const loc = place.geometry.location;
        const latlng = { lat: loc.lat(), lng: loc.lng() };
        setPosition(latlng);
        map.panTo(latlng);
        map.setZoom(15);
      }
    });
    return () => google.maps.event.removeListener(listener);
  }, [placesLib, map, inputRef]);

  if (!position) return null;
  return <AdvancedMarker position={position} />;
}

function InteractiveMap({ initialAddress, initialLat, initialLng }: { initialAddress: string; initialLat?: number; initialLng?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="property-map-interactive">
      <input
        ref={inputRef}
        className="property-map-search"
        type="text"
        placeholder="Buscar dirección..."
        defaultValue={initialAddress}
        aria-label="Buscar dirección en el mapa"
      />
      <Map
        defaultCenter={initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : DEFAULT_CENTER}
        defaultZoom={13}
        gestureHandling="greedy"
        style={{ width: '100%', height: '100%' }}
      >
        <MapContent initialAddress={initialAddress} initialLat={initialLat} initialLng={initialLng} inputRef={inputRef} />
      </Map>
    </div>
  );
}

export default function PropertyMap({ address, lat, lng }: PropertyMapProps) {
  const [isInteractive, setIsInteractive] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const hasCoords = lat != null && lng != null;
  const staticUrl = hasCoords
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=640x320&markers=color:red%7C${lat},${lng}&key=${apiKey}`
    : address
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=15&size=640x320&markers=color:red%7C${encodeURIComponent(address)}&key=${apiKey}`
      : '';

  if (!isInteractive) {
    return (
      <div
        className="property-map-static"
        onClick={() => setIsInteractive(true)}
        role="button"
        tabIndex={0}
        aria-label="Abrir mapa interactivo"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsInteractive(true);
        }}
      >
        {staticUrl ? (
          <img src={staticUrl} alt={`Mapa de ${address}`} />
        ) : (
          <div className="property-map-no-address">Dirección no disponible</div>
        )}
        <div className="property-map-static-overlay">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>Abrir mapa interactivo</span>
        </div>
      </div>
    );
  }

  return <InteractiveMap initialAddress={address} initialLat={lat} initialLng={lng} />;
}
