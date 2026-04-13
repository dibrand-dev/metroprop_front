/**
 * 🌐 API Configuration
 */

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

export const formatNumbers = (price: number) => Math.ceil(price).toLocaleString('en-US');

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

export function getVisitedProperties(): VisitedProperty[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY) ?? '[]') as VisitedProperty[];
  } catch {
    return [];
  }
}

export function saveVisitedProperty(property: VisitedProperty): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getVisitedProperties().filter(p => p.id !== property.id);
    const updated = [property, ...current].slice(0, VISITED_MAX);
    localStorage.setItem(VISITED_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — ignore
  }
}