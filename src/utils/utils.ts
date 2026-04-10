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