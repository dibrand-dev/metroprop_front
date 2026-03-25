'use client';

import { useEffect, useRef } from 'react';
import { Map, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import './PublishLocationMap.scss';

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

interface MapInteriorProps {
  fullAddress: string;
  onStreetChange: (street: string) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

function MapInterior({ fullAddress, onStreetChange, onCoordinatesChange, disabled = false }: MapInteriorProps) {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  // Prevents the reverse-geocode idle handler from firing during programmatic pans
  // and on the initial map load (first idle always fires at mount)
  const isProgrammatic = useRef(true); // start as true — first idle is always the initial load
  // Stable refs so listeners never need to be re-registered
  const onStreetChangeRef = useRef(onStreetChange);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);

  useEffect(() => {
    onStreetChangeRef.current = onStreetChange;
  }, [onStreetChange]);

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  useEffect(() => {
    if (geocodingLib && !geocoder.current) {
      geocoder.current = new geocodingLib.Geocoder();
    }
  }, [geocodingLib]);

  // Forward geocode: when the composite address changes, pan the map to it
  useEffect(() => {
    if (disabled) return;
    if (!geocoder.current || !map || !fullAddress.trim()) return;
    const timer = setTimeout(() => {
      isProgrammatic.current = true;
      geocoder.current!.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          map.panTo({ lat, lng });
          map.setZoom(15);
          onCoordinatesChangeRef.current(lat, lng);
        }
        // Give the pan animation time to finish before unlocking idle
        setTimeout(() => {
          isProgrammatic.current = false;
        }, 1000);
      });
    }, 600); // debounce rapid typing
    return () => clearTimeout(timer);
  }, [fullAddress, map, geocodingLib, disabled]);

  // Reverse geocode: when user drags map, extract street from the new center
  useEffect(() => {
    if (disabled) return;
    if (!map) return;
    const listener = map.addListener('idle', () => {
      // First idle is the initial load — unlock and skip
      if (isProgrammatic.current) {
        isProgrammatic.current = false;
        return;
      }
      if (!geocoder.current) return;
      const center = map.getCenter();
      if (!center) return;
      const lat = center.lat();
      const lng = center.lng();
      geocoder.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const comps = results[0].address_components;
            const streetNum =
              comps.find((c) => c.types.includes('street_number'))?.long_name ?? '';
            const route =
              comps.find((c) => c.types.includes('route'))?.long_name ?? '';
            const street = route
              ? streetNum
                ? `${route} ${streetNum}`
                : route
              : results[0].formatted_address;
            onStreetChangeRef.current(street);
            onCoordinatesChangeRef.current(lat, lng);
          }
        }
      );
    });
    return () => google.maps.event.removeListener(listener);
  }, [map, disabled]);

  return null;
}

interface PublishLocationMapProps {
  fullAddress: string;
  onStreetChange: (street: string) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export default function PublishLocationMap({
  fullAddress,
  onStreetChange,
  onCoordinatesChange,
  disabled = false,
}: PublishLocationMapProps) {
  return (
    <div className={`publish-location-map-wrapper${disabled ? ' is-disabled' : ''}`}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={5}
        gestureHandling={disabled ? 'none' : 'greedy'}
        style={{ width: '100%', height: '100%' }}
      >
        <MapInterior
          fullAddress={fullAddress}
          onStreetChange={onStreetChange}
          onCoordinatesChange={onCoordinatesChange}
          disabled={disabled}
        />
      </Map>
      {/* Fixed center pin — stays in the middle while the map moves beneath it */}
      <div className="publish-location-map-center-pin" aria-hidden="true">
        <svg viewBox="0 0 24 32" width="30" height="40">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20S24 21 24 12C24 5.37 18.63 0 12 0zm0 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
            fill="#e53e3e"
          />
        </svg>
        <div className="publish-location-map-pin-shadow" />
      </div>
    </div>
  );
}
