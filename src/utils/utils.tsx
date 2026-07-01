/**
 * 🌐 API Configuration
 */

import { AWS_S3_BUCKET_URL } from "@/app/constants";
import { CreateProperty } from "@/types/propiedad";

// 🔗 API Endpoints
export const API_ENDPOINTS = {
  PRODUCTION: 'https://api.metroprop.co',
  DEVELOPMENT: 'http://localhost:3000',
} as const;

// 🎯 Current API Base URL — works on both server and client
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ?? (typeof window !== 'undefined' && window.location.hostname === 'www.metroprop.co'
    ? API_ENDPOINTS.PRODUCTION
    : API_ENDPOINTS.DEVELOPMENT);

export const formatNumbers = (price: number) => Math.ceil(price).toLocaleString('es-AR');

export const formatCurrency = (currency: string | null | undefined): string => {
  if (!currency) return '';
  if (currency === 'ARS') return '$';
  if (currency === 'USD') return 'USD';
  return currency;
};

// ─── Visited Properties (localStorage) ──────────────────────────────────────

export interface VisitedProperty {
  id: string;
  price: number;
  expenses: number;
  currency: 'USD' | 'ARS' | 'EUR';
  currencyRent: string;
  pricePerSqm?: number;
  title: string;
  address: string;
  rooms: number;
  bathrooms: number;
  area: number;
  image: string;
  agencyLogo?: string;
  coordinates?: { lat: number; lng: number };
}

const VISITED_KEY = 'metroprop_visited_properties';
const VISITED_MAX = 20;

export function getVisitedProperties(): CreateProperty[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY) ?? '[]') as CreateProperty[];
  } catch {
    return [];
  }
}

export function saveVisitedProperty(property: CreateProperty): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getVisitedProperties().filter(p => p.id !== property.id);
    const updated = [property, ...current].slice(0, VISITED_MAX);
    localStorage.setItem(VISITED_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function removeVisitedProperty(propertyId: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getVisitedProperties().filter(p => p.id !== propertyId);
    localStorage.setItem(VISITED_KEY, JSON.stringify(current));
  } catch {
    // localStorage unavailable — ignore
  }
}

export function setImagePath(imagePath: string) {
  if (!imagePath) return '';
  return imagePath.includes('http') ? imagePath : `${AWS_S3_BUCKET_URL}/${imagePath}`;  
}

export function getIdentificador(id: number): number {
  return id + 1643789;
}

export function HeartIcon({ isFavorite }: { isFavorite?: boolean }): JSX.Element {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        stroke={isFavorite ? '#006AFF' : 'currentColor'}
        fill={isFavorite ? '#006AFF' : 'none'}
        strokeWidth="1.5"
      />
    </svg>;
}


  export function sendPropertyToWhatsApp(propertyId: number, phone: string, message: string) {    
    // Use \n for line breaks and regular text for the URL
    const fullMessage = `Hola, estoy interesado en esta propiedad que vi en MetroProp. ¿Podrías darme más información?

    Ver propiedad: https://metroprop.com/property/${propertyId}

    ${message}`;
    
    // Safely encode the text for the URL API
    const encodedText = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${(phone)}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
  }
  
  export const getInitials = (name: string): string => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  // Format street address based on show_exact_location
  export const formatStreetAddress = (street: string | undefined, showExactLocation: boolean | undefined) => {
    if (!street || !showExactLocation) return street ?? '';    
    // Extract number from the beginning or end of the street
    const matchStart = street.match(/^(\d+)/);
    const matchEnd = street.match(/(\d+)$/);
    
    if (matchStart) {
      const originalNumber = parseInt(matchStart[1]);
      const roundedNumber = Math.floor(originalNumber / 100) * 100;
      return street.replace(/^\d+/, String(roundedNumber));
    } else if (matchEnd) {
      const originalNumber = parseInt(matchEnd[1]);
      const roundedNumber = Math.floor(originalNumber / 100) * 100;
      return street.replace(/\d+$/, String(roundedNumber));
    }
    
    return street;
  };

  // ─── SEO-Friendly URL Generation ──────────────────────────────────────────

  /**
   * Converts a string to URL-friendly slug (lowercase, no special chars, hyphens)
   */
  function slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD') // Normalize to decomposed form for accents
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generates SEO-friendly URL slug for a property
   * Format: [property-type]-en-[operation-type]-[location]--[id]
   * Example: casa-en-venta-caballito-capital-federal--123456
   * 
   * @param property - Property object with at least an ID
   * @param locationLabels - Optional pre-computed location labels (subLocation, location, state)
   */
  export function generatePropertySlug(
    property: Partial<CreateProperty>,
    locationLabels?: { neighborhood?: string; subLocation?: string; location?: string; state?: string }
  ): string {
    if (!property.id) {
      throw new Error('Property ID is required to generate slug');
    }
    // Import types from propiedad.ts
    const propertyTypeLabels: Record<number, string> = {
      1: 'casa',
      2: 'departamento',
      3: 'terreno',
      4: 'ph',
      5: 'galpon-bodega',
      6: 'boveda-nicho-parcela',
      7: 'cama-nautica',
      8: 'campo',
      9: 'consultorio',
      10: 'deposito',
      11: 'edificio',
      12: 'fondo-de-comercio',
      13: 'garage',
      14: 'hotel',
      15: 'local-comercial',
      16: 'oficina-comercial',
      17: 'quinta-vacacional',
      18: 'emprendimiento',
    };

    const operationTypeLabels: Record<number, string> = {
      1: 'venta',
      2: 'alquiler',
      3: 'temporal',
      4: 'emprendimiento',
    };

    // Get property type slug
    const propertyType = property.property_type
      ? propertyTypeLabels[property.property_type] || 'propiedad'
      : 'propiedad';

    // Get operation type slug
    const operationType = property.operation_type
      ? operationTypeLabels[property.operation_type] || 'venta'
      : 'venta';

    // Build location parts - prioritize provided labels, then fall back to property relationships
    const locationParts: string[] = [];
    // Use provided location labels if available
    if (locationLabels) {
      if (locationLabels.neighborhood) locationParts.push(locationLabels.neighborhood);
      if (locationLabels.subLocation) locationParts.push(locationLabels.subLocation);
      if (locationLabels.location) locationParts.push(locationLabels.location);
      if (locationLabels.state) locationParts.push(locationLabels.state);
    } else {
      // Fall back to property relationship objects
      // Add neighborhood or sub_location name if available
      if ((property as any).neighborhood?.name) {
        locationParts.push((property as any).neighborhood.name);
      } else if ((property as any).sub_location?.name) {
        locationParts.push((property as any).sub_location.name);
      }
      
      // Add location (city) name if available
      if ((property as any).location?.name) {
        locationParts.push((property as any).location.name);
      }
      
      // Add state (province) name if available
      if ((property as any).state?.name) {
        locationParts.push((property as any).state.name);
      }
    }

    // If no location data, use a generic location
    const location = locationParts.length > 0 
      ? slugify(locationParts.join(' '))
      : 'argentina';

    // Build final slug: [property-type]-en-[operation]-[location]--[id]
    return `${propertyType}-en-${operationType}-${location}--${property.id}`;
  }

  /**
   * Parses a property slug and extracts the property ID
   * Handles both old format (/propertyDetail/123) and new format (casa-en-venta-caballito--123)
   * @returns Property ID or null if invalid
   */
  export function parsePropertySlug(slug: string): number | null {
    // Check if it's just a numeric ID (old format or direct ID)
    if (/^\d+$/.test(slug)) {
      return parseInt(slug, 10);
    }

    // Check if it matches the new slug format (ends with --[id])
    const match = slug.match(/--(\d+)$/);
    if (match) {
      return parseInt(match[1], 10);
    }

    return null;
  }

  /**
   * Generates the full URL path for a property detail page
   * @param property - Property object with at least an ID
   * @param locationLabels - Optional pre-computed location labels
   * @param useSlug - Whether to use SEO-friendly slug (default: true)
   * @returns URL path string
   */
  export function getPropertyDetailPath(
    property: Partial<CreateProperty>,
    locationLabels?: { neighborhood?: string; subLocation?: string; location?: string; state?: string },
    useSlug: boolean = true
  ): string {
    if (!property.id) {
      return '/propertyDetail/0';
    }

    if (useSlug) {
      try {
        return `/${generatePropertySlug(property, locationLabels)}`;
      } catch {
        // Fallback to old format if slug generation fails
        return `/propertyDetail/${property.id}`;
      }
    }

    return `/propertyDetail/${property.id}`;
  }

  export function setAdsUrl(adLink: string): string {
    return adLink 
      ? adLink.startsWith('http')
        ? adLink : `http://${adLink}`
        : '#';
  }