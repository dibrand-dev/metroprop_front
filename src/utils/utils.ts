/**
 * 🌐 API Configuration
 */

// 🏠 Environment Detection
export const isProduction = typeof window !== 'undefined' && window.location.hostname === 'www.metroprop.co';

// 🔗 API Endpoints
export const API_ENDPOINTS = {
  PRODUCTION: 'https://api.metroprop.co',
  DEVELOPMENT: 'http://localhost:3000',
} as const;

// 🎯 Current API Base URL
export const API_BASE_URL = isProduction 
  ? API_ENDPOINTS.PRODUCTION 
  : API_ENDPOINTS.DEVELOPMENT;