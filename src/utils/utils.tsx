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
  if (currency === 'USD') return 'U$D';
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