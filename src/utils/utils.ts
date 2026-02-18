export const isProduction = typeof window !== 'undefined' && window.location.hostname === 'metroprop.co';

export const API_BASE_URL = isProduction
  ? 'https://api.metroprop.co/'
  : 'http://localhost:3000';