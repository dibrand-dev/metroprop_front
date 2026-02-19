/**
 * Emprendimiento API Types
 * 
 * This file defines the structure for the emprendimiento publishing API.
 * Update these types as the backend API is developed.
 */

export interface EmprendimientoUnit {
  nombre: string;
  descripcion: string;
  tipo: string;
  piso: string;
  orientacion: string;
  precio: number;
  moneda: 'USD' | 'ARS' | 'EUR';
  expensas: boolean;
  expensasValor?: number;
  dormitorios: number;
  banos: number;
  toilettes: number;
  cochera: number;
  baulera: number;
  supConstruidos: number;
  supTotales: number;
  fotos: File[] | string[];
  planos: File[] | string[];
  recorrido360?: string;
}

export interface EmprendimientoAmenidad {
  id: string;
  nombre: string;
  categoria: 'servicios' | 'caracteristicas-generales' | 'ambientes' | 'caracteristicas';
}

export interface EmprendimientoLocation {
  direccion: string;
  ciudad: string;
  provincia: string;
  barrio?: string;
  zona?: string;
  pais: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

export interface EmprendimientoSubmission {
  // Datos principales
  nombreEmprendimiento: string;
  descripcion: string;
  logoFile?: File | string;
  tipoEmprendimiento: string;
  ubicacion: EmprendimientoLocation;
  imagenesPrincipales: File[] | string[];
  
  // Amenidades
  amenidades: EmprendimientoAmenidad[];
  
  // Unidades
  unidades: EmprendimientoUnit[];
  
  // Vista al precio / Configuración de publicación
  colaboradorAsignado?: string;
  planSeleccionado: string;
  
  // Metadatos
  estado: 'borrador' | 'publicado';
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface EmprendimientoAPIResponse {
  success: boolean;
  data?: {
    id: string;
    emprendimiento: EmprendimientoSubmission;
  };
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

/**
 * API Endpoint Configuration
 * 
 * Base URL: /api/emprendimientos
 * 
 * POST /api/emprendimientos
 * - Create new emprendimiento
 * - Body: EmprendimientoSubmission
 * - Response: EmprendimientoAPIResponse
 * 
 * PUT /api/emprendimientos/:id
 * - Update existing emprendimiento
 * - Body: Partial<EmprendimientoSubmission>
 * - Response: EmprendimientoAPIResponse
 * 
 * POST /api/emprendimientos/:id/publish
 * - Publish draft emprendimiento
 * - Body: { planId: string }
 * - Response: EmprendimientoAPIResponse
 * 
 * DELETE /api/emprendimientos/:id
 * - Delete emprendimiento
 * - Response: { success: boolean }
 */

export const API_ENDPOINTS = {
  CREATE: '/api/emprendimientos',
  UPDATE: (id: string) => `/api/emprendimientos/${id}`,
  PUBLISH: (id: string) => `/api/emprendimientos/${id}/publish`,
  DELETE: (id: string) => `/api/emprendimientos/${id}`,
  GET: (id: string) => `/api/emprendimientos/${id}`,
  LIST: '/api/emprendimientos',
} as const;
