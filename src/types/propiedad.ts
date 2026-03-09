// ==========================================================================
// INTERFACES PARA FRONTEND - CREATE PROPERTY
// ==========================================================================
// Archivo generado para uso en Next.js frontend
// Basado en el DTO del backend sin decoradores de validación

// ==========================================================================
// ENUMS
// ==========================================================================

/**
 * Tipos de operación para una propiedad.
 */
export enum OperationType {
  VENTA = 1,
  ALQUILER = 2,
  ALQUILER_TEMPORAL = 3,
  EMPRENDIMIENTO = 4
}

/**
 * Tipos principales de propiedad.
 */
export enum PropertyType {
  LAND = 1,               // Terreno
  APARTMENT = 2,          // Departamento
  HOUSE = 3,              // Casa
  WEEKEND_HOUSE = 4,      // Casa de fin de semana
  OFFICE = 5,             // Oficina
  MOORING = 6,            // Amarre
  BUSINESS_PREMISES = 7,  // Local comercial
  COMMERCIAL_BUILDING = 8, // Edificio comercial
  COUNTRYSIDE = 9,        // Campo
  GARAGE = 10,            // Garage
  HOTEL = 11,             // Hotel
  INDUSTRIAL_SHIP = 12,   // Nave industrial
  CONDO = 13,             // Condominio
  STORAGE = 14,           // Depósito
  BUSINESS_PERMIT = 15,   // Habilitación comercial
  STORAGE_ROOM = 16,      // Trastero
  BODEGAS = 17,           // Bodegas
  FINCAS = 18,            // Fincas
  CHACRA = 19,            // Chacra
  CAMA_NAUTICA = 20,      // Cama náutica
  ISLA = 21,              // Isla
  TERRAZA = 23,           // Terraza
  GALPON = 24,            // Galpón
}

/**
 * Subtipos de propiedad.
 */
export enum PropertySubtype {
  DUPLEX = 1,
  TRIPLEX = 2,
  LOFT = 3,
  PISO_UNICO = 4,
  PENTHOUSE = 5,
}

/**
 * Estados de la propiedad.
 */
export enum PropertyStatus {
  DRAFT = 0,        // Borrador (oculto para usuarios)
  A_COTIZAR = 1,     // A cotizar
  DISPONIBLE = 2,    // Disponible (default)
  RESERVADA = 3,     // Reservada
  NO_DISPONIBLE = 4, // No disponible
}

// ==========================================================================
// INTERFACES PARA RELACIONES
// ==========================================================================

export interface CreateImage {
  url: string;
  is_blueprint?: boolean;
  description?: string;
  order_position?: number;
}

export interface CreateOperation {
  operation_type: string; // "venta", "alquiler"
  currency: string; // Código ISO de 3 letras (ej: "ARS", "USD")
  price: number;
  period?: string; // ej: "mensual", "anual"
}

export interface CreateAttached {
  file_url: string;
  order?: number;
  description?: string;
}

/**
 * Luminosidad de la propiedad.
 */
export enum Brightness {
  VERY_BRIGHT = 1,  // Muy luminoso
  BRIGHT = 2,       // Luminoso
  DIM = 3,          // Poco luminoso
}

/**
 * Cobertura de garage/cochera.
 */
export enum GarageCoverage {
  COVERED = 1,       // Cubierta
  SEMI_COVERED = 2,  // Semi cubierta
  UNCOVERED = 3,     // Descubierta
}

/**
 * Orientación de la propiedad.
 */
export enum Orientation {
  SELECCIONAR = 0,  // seleccionar
  SUR = 1,          // sur
  NORTE = 2,        // norte
  OESTE = 3,        // oeste
  ESTE = 4,         // este
  SUDESTE = 5,      // sudeste
  NORESTE = 6,      // noreste
  SUDOESTE = 7,     // sudoeste
  NOROESTE = 8,     // noroeste
}


export interface VideoPreview {
  url: string;
  id: string;
  thumbnail: string;
}

// ==========================================================================
// INTERFACE PRINCIPAL - CREATE PROPERTY
// ==========================================================================

export interface CreateProperty {
  // ========== CAMPOS OBLIGATORIOS ==========
  reference_code: string;
  publication_title: string;
  property_type: PropertyType;
  status: PropertyStatus;
  operation_type: OperationType;
  price: number;
  currency: string; // Código ISO de 3 letras (ej: "ARS", "USD")

  // ========== CAMPOS OPCIONALES ==========
  draft_id?: number; // ID del borrador en caso de estar creando una propiedad desde un draft
  // Información básica
  property_subtype?: PropertySubtype;
  publication_title_en?: string;
  description?: string;
  internal_comments?: string;

  // Ubicación
  street?: string;
  number?: string;
  floor?: string;
  apartment?: string;
  location_id?: number;
  postal_code?: string;
    show_exact_location?: boolean;
    country_id?: number;
    province_id?: number;
    localidad_id?: number;
    zone_id?: number;
  // Coordenadas geográficas
  geo_lat?: number; // Entre -90 y 90
  geo_long?: number; // Entre -180 y 180

  // Características de habitaciones
  suite_amount?: number;
  room_amount?: number;
  bathroom_amount?: number;
  toilet_amount?: number;
  parking_lot_amount?: number;

  // Superficies (en metros cuadrados)
  surface?: number;
  roofed_surface?: number;
  unroofed_surface?: number;
  semiroofed_surface?: number;
  total_surface?: number;
  surface_measurement?: string; // ej: "m2"
  roofed_surface_measurement?: string; // ej: "m2"

  // Información del inmueble
  age?: number; // Años de antigüedad (-1 para "a estrenar")
  property_condition?: string;
  brightness?: Brightness;
  garage_coverage?: GarageCoverage;
  surface_front?: number;
  surface_length?: number;
  situation?: string;
  dispositions?: string;
  orientation?: Orientation;
  floors_amount?: number;
  zonification?: string;
  construction_year?: string;
  last_renovation?: string;

  // Información económica
  expenses?: number;
  commission?: string;
  network_share?: string;
  period?: string; // Para alquileres
  price_square_meter?: number;

  // Contactos y responsables
  producer_user?: string;
  branch_id?: number;
  user_id?: number;
  organization_id?: number;
  key_contact?: string;
  key_agent_user?: string;
  key_location?: string;
  key_reference_code?: string;
  maintenance_user?: string;

  // Información del propietario
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;

  // Desarrollo y red
  development?: string;
  network_information?: string;
  transaction_requirements?: string;

  // ========== RELACIONES OPCIONALES ==========
  
  /**
   * Imágenes de la propiedad
   */
  images?: CreateImage[];

  /**
   * Tags de la propiedad (IDs de servicios, ambientes, adicionales)
   */
  tags?: number[];

  /**
   * Operaciones de la propiedad (venta, alquiler, etc)
   */
  operations?: CreateOperation[];

  /**
   * Videos de la propiedad
   */
  videos?: string[];

  /**
   * Multimedia 360 de la propiedad
   */
  multimedia360?: string[];

  /**
   * Archivos adjuntos de la propiedad (documentos, planos, etc)
   */
  attached?: CreateAttached[];

  selectedPlan?: string; // Plan seleccionado para la publicación (ej: "bonificado", "premium", etc)
}

// ==========================================================================
// TIPOS AUXILIARES ÚTILES PARA EL FRONTEND
// ==========================================================================

/**
 * Tipo para los campos requeridos cuando se crea una propiedad
 */
export type CreatePropertyRequired = Pick<
  CreateProperty,
  'reference_code' | 'publication_title' | 'property_type' | 'status' | 'operation_type' | 'price' | 'currency'
>;

/**
 * Tipo para los campos opcionales
 */
export type CreatePropertyOptional = Omit<CreateProperty, keyof CreatePropertyRequired>;

/**
 * Tipo para formulario con campos parciales (útil para drafts)
 */
export type CreatePropertyDraft = Partial<CreateProperty> & 
  Pick<CreateProperty, 'reference_code'>;

/**
 * Opciones de moneda más comunes
 */
export const CURRENCIES = {
  ARS: 'ARS',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

/**
 * Mapeo de labels para los tipos de propiedad (útil para selects)
 */
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.LAND]: 'Terreno',
  [PropertyType.APARTMENT]: 'Departamento',
  [PropertyType.HOUSE]: 'Casa',
  [PropertyType.WEEKEND_HOUSE]: 'Casa de fin de semana',
  [PropertyType.OFFICE]: 'Oficina',
  [PropertyType.MOORING]: 'Amarre',
  [PropertyType.BUSINESS_PREMISES]: 'Local comercial',
  [PropertyType.COMMERCIAL_BUILDING]: 'Edificio comercial',
  [PropertyType.COUNTRYSIDE]: 'Campo',
  [PropertyType.GARAGE]: 'Garage',
  [PropertyType.HOTEL]: 'Hotel',
  [PropertyType.INDUSTRIAL_SHIP]: 'Nave industrial',
  [PropertyType.CONDO]: 'Condominio',
  [PropertyType.STORAGE]: 'Depósito',
  [PropertyType.BUSINESS_PERMIT]: 'Habilitación comercial',
  [PropertyType.STORAGE_ROOM]: 'Trastero',
  [PropertyType.BODEGAS]: 'Bodegas',
  [PropertyType.FINCAS]: 'Fincas',
  [PropertyType.CHACRA]: 'Chacra',
  [PropertyType.CAMA_NAUTICA]: 'Cama náutica',
  [PropertyType.ISLA]: 'Isla',
  [PropertyType.TERRAZA]: 'Terraza',
  [PropertyType.GALPON]: 'Galpón',
};

/**
 * Mapeo de labels para los estados de propiedad
 */
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.DRAFT]: 'Borrador',
  [PropertyStatus.A_COTIZAR]: 'A cotizar',
  [PropertyStatus.DISPONIBLE]: 'Disponible',
  [PropertyStatus.RESERVADA]: 'Reservada',
  [PropertyStatus.NO_DISPONIBLE]: 'No disponible',
};

/**
 * Mapeo de labels para los tipos de operación
 */
export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  [OperationType.VENTA]: 'Venta',
  [OperationType.ALQUILER]: 'Alquiler',
  [OperationType.ALQUILER_TEMPORAL]: 'Temporal',
  [OperationType.EMPRENDIMIENTO]: 'Emprendimiento',
};

// Mapping for property subtype user-friendly labels
export const PROPERTY_SUBTYPE_LABELS: Record<PropertySubtype, string> = {
  [PropertySubtype.DUPLEX]: 'Duplex',
  [PropertySubtype.TRIPLEX]: 'Triplex',
  [PropertySubtype.LOFT]: 'Loft',
  [PropertySubtype.PISO_UNICO]: 'Piso único',
  [PropertySubtype.PENTHOUSE]: 'Penthouse',
};

export const BRIGHTNESS_LABELS: Record<Brightness, string> = {
  [Brightness.VERY_BRIGHT]: 'Muy luminoso',
  [Brightness.BRIGHT]: 'Luminoso',
  [Brightness.DIM]: 'Poco luminoso',
};

export const BRIGHTNESS_SELECT_OPTIONS = Object.entries(BRIGHTNESS_LABELS).map(([key, label]) => ({
  value: key,
  label,
}));

export const GARAGE_COVERAGE_LABELS: Record<GarageCoverage, string> = {
  [GarageCoverage.COVERED]: 'Cubierta',
  [GarageCoverage.SEMI_COVERED]: 'Semi cubierta',
  [GarageCoverage.UNCOVERED]: 'Descubierta',
};

export const GARAGE_SELECT_OPTIONS = Object.entries(GARAGE_COVERAGE_LABELS).map(([key, label]) => ({
  value: key,
  label,
}));

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  [Orientation.SELECCIONAR]: 'Seleccionar',
  [Orientation.SUR]: 'Sur',
  [Orientation.NORTE]: 'Norte',
  [Orientation.OESTE]: 'Oeste',
  [Orientation.ESTE]: 'Este',
  [Orientation.SUDESTE]: 'Sudeste',
  [Orientation.NORESTE]: 'Noreste',
  [Orientation.SUDOESTE]: 'Sudoeste',
  [Orientation.NOROESTE]: 'Noroeste',
};

export const ORIENTATION_SELECT_OPTIONS = Object.entries(ORIENTATION_LABELS).map(([key, label]) => ({
  value: key,
  label,
}));

// ==========================================================================
// FUNCIONES AUXILIARES
// ==========================================================================

/**
 * Función para validar que una propiedad tiene los campos mínimos requeridos
 */
export function isValidCreateProperty(property: Partial<CreateProperty>): property is CreatePropertyRequired {
  return !!(
    property.reference_code &&
    property.publication_title &&
    property.property_type !== undefined &&
    property.status !== undefined &&
    property.operation_type !== undefined &&
    property.price !== undefined &&
    property.currency
  );
}

/**
 * Función para crear una propiedad con valores por defecto
 */
export function createDefaultProperty(): Partial<CreateProperty> {
  return {
    status: PropertyStatus.DRAFT,
    currency: 'ARS',
    images: [],
    tags: [],
    operations: [],
    videos: [],
    multimedia360: [],
    attached: [],
  };
}

/**
 * Función para formatear precio con separadores de miles
 */
export function formatPrice(price: number, currency: string = 'ARS'): string {
  const formatted = new Intl.NumberFormat('es-AR').format(price);
  return `${currency} ${formatted}`;
}