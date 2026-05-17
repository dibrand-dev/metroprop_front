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
  CASA = 1,                   // Casa
  DEPARTAMENTO = 2,           // Departamento
  TERRENO = 3,                // Terreno
  PH = 4,                     // PH
  GALPON_BODEGA = 5,          // Galpón / Bodega
  BOVEDA_NICHO_PARCELA = 6,   // Bóveda / Nicho / Parcela
  CAMA_NAUTICA = 7,           // Cama náutica
  CAMPO = 8,                  // Campo
  CONSULTORIO = 9,            // Consultorio
  DEPOSITO = 10,              // Depósito
  EDIFICIO = 11,              // Edificio
  FONDO_DE_COMERCIO = 12,     // Fondo de comercio
  GARAGE = 13,                // Garage
  HOTEL = 14,                 // Hotel
  LOCAL_COMERCIAL = 15,       // Local comercial
  OFICINA_COMERCIAL = 16,     // Oficina comercial
  QUINTA_VACACIONAL = 17,     // Quinta vacacional
  EMPRENDIMIENTO = 18,          // Emprendimiento
}

/**
 * Subtipos de propiedad, agrupados por tipo principal.
 */
export enum PropertySubtype {
  // ── Casa ─────────────────────────────────────────────────────────────
  BUNGALOW = 1,
  CABANA = 2,         // Cabaña
  CHALET = 3,
  CONDOMINIO = 4,
  DUPLEX = 5,         // Casa / Departamento
  TRIPLEX = 6,        // Casa / Departamento
  CASA_DE_PLAYA = 7,
  PH = 8,
  PREFABRICADA = 9,

  // ── Departamento ─────────────────────────────────────────────────────
  APARTESTUDIO = 10,
  LOFT = 11,
  PENTHOUSE = 12,
  PISO = 13,
  SEMIPISO = 14,
  ESTANDAR = 15,

  // ── Bóveda / Nicho / Parcela ─────────────────────────────────────────
  BOVEDA = 16,
  NICHO = 17,
  PARCELA = 18,
}



/**
 * Mapa de subtipos válidos por tipo de propiedad.
 * Los tipos sin subtipos no aparecen en el mapa (o tienen array vacío).
 * Usarlo para validar, generar selects en el front, etc.
 */
export const PROPERTY_SUBTYPES_BY_TYPE: Partial<Record<PropertyType, PropertySubtype[]>> = {
  [PropertyType.CASA]: [
    PropertySubtype.BUNGALOW,
    PropertySubtype.CABANA,
    PropertySubtype.CHALET,
    PropertySubtype.CONDOMINIO,
    PropertySubtype.DUPLEX,
    PropertySubtype.TRIPLEX,
    PropertySubtype.CASA_DE_PLAYA,
    PropertySubtype.PH,
    PropertySubtype.PREFABRICADA,
  ],
  [PropertyType.DEPARTAMENTO]: [
    PropertySubtype.APARTESTUDIO,
    PropertySubtype.DUPLEX,
    PropertySubtype.LOFT,
    PropertySubtype.PENTHOUSE,
    PropertySubtype.PISO,
    PropertySubtype.SEMIPISO,
    PropertySubtype.TRIPLEX,
    PropertySubtype.ESTANDAR,
  ],
  [PropertyType.BOVEDA_NICHO_PARCELA]: [
    PropertySubtype.BOVEDA,
    PropertySubtype.NICHO,
    PropertySubtype.PARCELA,
  ],
};

/**
 * Estados de la propiedad.
 */
export enum PropertyStatus {
  DRAFT = 0,        // Borrador (oculto para usuarios)
  A_COTIZAR = 1,     // A cotizar
  DISPONIBLE = 2,    // Disponible (default)
  RESERVADA = 3,     // Reservada
  NO_DISPONIBLE = 4, // No disponible
  ARCHIVADA = 5,      // Archivada (oculta para usuarios)
}

/**
 * Roles de usuario.
 */
export enum UserRole {
  USER_ROL_ADMIN = 1,
  USER_ROL_SELLER = 2,
  USER_ROL_COLLABORATOR = 3,
  USER_ROL_SUPER_ADMIN = 4,
}

// ==========================================================================
// INTERFACES PARA RELACIONES
// ==========================================================================

export interface CreateImage {
  id?: number;
  url: string;
  is_blueprint?: boolean;
  description?: string;
  order_position?: number;
  upload_status?: 'completed' | 'uploading' | 'pending' | 'failed';
  retry_count?: number;
  error_message?: string | null;
  upload_completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateImagePlans {
  id?: number;
  file_url: string;
  description?: string;
  order_position?: number;
  upload_status?: 'completed' | 'uploading' | 'pending' | 'failed';
  retry_count?: number;
  error_message?: string | null;
  upload_completed_at?: string;
  created_at?: string;
  updated_at?: string;
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

export enum MediaUploadStatus {
  PENDING = 'pending',       // Esperando ser procesado
  UPLOADING = 'uploading',   // En proceso de subida a S3
  COMPLETED = 'completed',   // Subido exitosamente
  FAILED = 'failed',         // Error en la subida
  RETRYING = 'retrying',     // Reintentando después de error
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

/**
 * Plan de publicación para una propiedad.
 */
export enum PublicationPlan {
  PUBLICATION_FREE = 1,     // Plan gratuito
  PUBLICATION_PREMIUM = 2,  // Plan premium
}

export enum AmenityType {
  Services = 1,
  Rooms = 2,
  Extras = 3
}

export const AMENITY_TYPE_LABELS: Record<AmenityType, string> = {
  [AmenityType.Services]: 'Servicios',
  [AmenityType.Rooms]: 'Ambientes',
  [AmenityType.Extras]: 'Otros'
};

export type AmenityTag = {
  id: number;
  name: string;
  type: AmenityType;
};

export type AmenityGroup = {
  type: AmenityType;
  title: string;
  options: AmenityTag[];
};

/**
 * Tipo de desarrollo/emprendimiento.
 */
export enum DevelopmentType {
  VERTICAL = 1,    // Desarrollo vertical
  HORIZONTAL = 2,  // Desarrollo horizontal
}

export const LABELS_DEVELOPMENT_TYPE: Record<DevelopmentType, string> = {
  [DevelopmentType.VERTICAL]: 'Desarrollo vertical',
  [DevelopmentType.HORIZONTAL]: 'Desarrollo horizontal',
};


// ==========================================================================
// INTERFACE PRINCIPAL - CREATE PROPERTY
// ==========================================================================

export interface CreateProperty {
  // ========== CAMPOS OBLIGATORIOS ==========
  id?: number; // Solo para propiedades existentes, no requerido al crear
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
  postal_code?: string;
    show_exact_location?: boolean;
    country_id?: number;
    state_id?: number;
    location_id?: number;
    sub_location_id?: number;
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
   * Planos de la propiedad (es_blueprint: true)
   */
  plans?: CreateImagePlans[];

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
  currency_expenses: string; // Moneda de los gastos (ej: "ARS", "USD")
  selected_plan?: number; // Plan seleccionado para la publicación (ej: "bonificado", "premium", etc)
  view_count?: number;
  is_development?: boolean; // Indica si la propiedad es un emprendimiento (solo para ciertos tipos de propiedad y operación)


  /****************** EMPRENDIMIENTO ***************************/
  development_id?: number;
  development_type?: DevelopmentType;
  development_logo?: string;
  development_units_total?: number;
  development_delivery_date?: string;
  development_available_unit_count?: number;
  development_units?: CreateProperty[]; 
  development_unit_type?: string;
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
 * Mapeo de labels para los estados de propiedad
 */
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.DRAFT]: 'Borrador',
  [PropertyStatus.A_COTIZAR]: 'A cotizar',
  [PropertyStatus.DISPONIBLE]: 'Disponible',
  [PropertyStatus.RESERVADA]: 'Reservada',
  [PropertyStatus.NO_DISPONIBLE]: 'No disponible',
  [PropertyStatus.ARCHIVADA]: 'Archivada',
};

/**
 * Mapeo de labels para los tipos de propiedad
 */
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.CASA]: 'Casa',
  [PropertyType.DEPARTAMENTO]: 'Departamento',
  [PropertyType.TERRENO]: 'Terreno',
  [PropertyType.PH]: 'PH',
  [PropertyType.GALPON_BODEGA]: 'Galpón / Bodega',
  [PropertyType.BOVEDA_NICHO_PARCELA]: 'Bóveda / Nicho / Parcela',
  [PropertyType.CAMA_NAUTICA]: 'Cama náutica',
  [PropertyType.CAMPO]: 'Campo',
  [PropertyType.CONSULTORIO]: 'Consultorio',
  [PropertyType.DEPOSITO]: 'Depósito',
  [PropertyType.EDIFICIO]: 'Edificio',
  [PropertyType.FONDO_DE_COMERCIO]: 'Fondo de comercio',
  [PropertyType.GARAGE]: 'Garage',
  [PropertyType.HOTEL]: 'Hotel',
  [PropertyType.LOCAL_COMERCIAL]: 'Local comercial',
  [PropertyType.OFICINA_COMERCIAL]: 'Oficina comercial',
  [PropertyType.QUINTA_VACACIONAL]: 'Quinta vacacional',
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
  // ── Casa ────────────────────────────────────────────────────────────
  [PropertySubtype.BUNGALOW]: 'Bungalow',
  [PropertySubtype.CABANA]: 'Cabaña',
  [PropertySubtype.CHALET]: 'Chalet',
  [PropertySubtype.CONDOMINIO]: 'Condominio',
  [PropertySubtype.DUPLEX]: 'Dúplex',
  [PropertySubtype.TRIPLEX]: 'Tríplex',
  [PropertySubtype.CASA_DE_PLAYA]: 'Casa de playa',
  [PropertySubtype.PH]: 'PH',
  [PropertySubtype.PREFABRICADA]: 'Prefabricada',
  // ── Departamento ────────────────────────────────────────────────────
  [PropertySubtype.APARTESTUDIO]: 'Apartestudio',
  [PropertySubtype.LOFT]: 'Loft',
  [PropertySubtype.PENTHOUSE]: 'Penthouse',
  [PropertySubtype.PISO]: 'Piso',
  [PropertySubtype.SEMIPISO]: 'Semipiso',
  [PropertySubtype.ESTANDAR]: 'Estándar',
  // ── Bóveda / Nicho / Parcela ─────────────────────────────────────────
  [PropertySubtype.BOVEDA]: 'Bóveda',
  [PropertySubtype.NICHO]: 'Nicho',
  [PropertySubtype.PARCELA]: 'Parcela',
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
    plans: [],
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

export const roomsConfig = [
  { key: 'room_amount', label: 'Ambientes*' },
  { key: 'suite_amount', label: 'Dormitorios*' },
  { key: 'bathroom_amount', label: 'Baños*' },
  { key: 'toilet_amount', label: 'Toilets*' },
  { key: 'parking_lot_amount', label: 'Cocheras*' },
] as const;

export const unitSelectOptions = [{label: 'm2', value: "M2"}, {label: 'ha', value:"HA"}];


export const currencyOptions = ['ARS', 'USD', 'EUR'];
export const currencySelectOptions = currencyOptions.map(option => ({
  value: option,
  label: option,
}));