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

export const ROLE: Record<number, string> = {
  [UserRole.USER_ROL_ADMIN]: 'Admin',
  [UserRole.USER_ROL_SELLER]: 'Vendedor',
  [UserRole.USER_ROL_COLLABORATOR]: 'Colaborador',
  [UserRole.USER_ROL_SUPER_ADMIN]: 'Super Admin',
};

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
  EDIFICIO_DE_OFICINAS = 3,     // Edificio de oficinas
  EDIFICIO = 4,                 // Edificio
  COUNTRY = 5,                  // Country
  BARRIO_PRIVADO = 6,           // Barrio Privado
  NAUTICO = 7,                  // Náutico
  RURAL = 8,                    // Rural
  EDIFICIO_DE_COCHERAS = 9,     // Edificio de Cocheras
  CONDOMINIO_INDUSTRIAL = 10,    // Condominio Industrial
  CENTRO_LOGISTICO = 11,         // Centro Logístico
  CONDOMINIO = 12,              // Condominio
  OTRO = 13,                    // Otro
  COMERCIAL = 14,               // Comercial
  HOTEL = 15,                   // Hotel
  BARRIO_ABIERTO = 16,          // Barrio abierto
}

export const LABELS_DEVELOPMENT_TYPE: Record<DevelopmentType, string> = {
  [DevelopmentType.VERTICAL]: 'Desarrollo vertical',
  [DevelopmentType.HORIZONTAL]: 'Desarrollo horizontal',
  [DevelopmentType.EDIFICIO_DE_OFICINAS]: 'Edificio de oficinas',
  [DevelopmentType.EDIFICIO]: 'Edificio',
  [DevelopmentType.COUNTRY]: 'Country',
  [DevelopmentType.BARRIO_PRIVADO]: 'Barrio Privado',
  [DevelopmentType.NAUTICO]: 'Náutico',
  [DevelopmentType.RURAL]: 'Rural',
  [DevelopmentType.EDIFICIO_DE_COCHERAS]: 'Edificio de Cocheras',
  [DevelopmentType.CONDOMINIO_INDUSTRIAL]: 'Condominio Industrial',
  [DevelopmentType.CENTRO_LOGISTICO]: 'Centro Logístico',
  [DevelopmentType.CONDOMINIO]: 'Condominio',
  [DevelopmentType.OTRO]: 'Otro',
  [DevelopmentType.COMERCIAL]: 'Comercial',
  [DevelopmentType.HOTEL]: 'Hotel',
  [DevelopmentType.BARRIO_ABIERTO]: 'Barrio abierto',
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
    neighborhood_id?: number;
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

  hired_plan_id: number;
  visibility: number;
  leads_count: number;
  purchased_plan_id?: number;
  
  dispositions?: string;
  disposition: Disposition
  appartments_per_floor?: number;
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
  Pick<CreateProperty, 'reference_code'> & {
    unitThumbnails?: Record<number, string>;
  };

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
  [PropertyType.EMPRENDIMIENTO]: 'Emprendimiento',
};

export const PROPERTY_TYPE_SELECT_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => ({
  value: key,
  label,
}));

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
  { key: 'room_amount', label: 'Ambientes' },
  { key: 'suite_amount', label: 'Dormitorios' },
  { key: 'bathroom_amount', label: 'Baños' },
  { key: 'toilet_amount', label: 'Toilets' },
  { key: 'parking_lot_amount', label: 'Cocheras' },
] as const;

export const unitSelectOptions = [{label: 'm2', value: "M2"}, {label: 'ha', value:"HA"}];


export const currencyOptions = ['ARS', 'USD', 'EUR'];
export const currencySelectOptions = currencyOptions.map(option => ({
  value: option,
  label: option,
}));

export enum AlertFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}
export const ALERT_FREQUENCY_LABELS: Record<string, string> = {
  [AlertFrequency.DAILY]: 'Diario',
  [AlertFrequency.WEEKLY]: 'Semanal',
  [AlertFrequency.MONTHLY]: 'Mensual'
};

export const FREQUENCY_OPTIONS = Object.entries(ALERT_FREQUENCY_LABELS).map(([key, label]) => ({
  value: key,
  label,
}));

export enum LeadState {
  NEW = 'Nuevo contacto',
  CONTACTED = 'Contactado',
  PENDING = 'Pendiente',
  QUALIFIED = 'Calificado',
  LOST = 'Perdido',
  POTENTIAL_CLIENT = 'Potencial cliente',
}

export const LEAD_STATE_LABELS: Record<string, string> = {
  [LeadState.NEW]: 'Nuevo contacto',
  [LeadState.CONTACTED]: 'Contactado',
  [LeadState.PENDING]: 'Pendiente',
  [LeadState.QUALIFIED]: 'Calificado',
  [LeadState.LOST]: 'Perdido',
  [LeadState.POTENTIAL_CLIENT]: 'Potencial cliente',
};

export const LEAD_STATE_OPTIONS = Object.entries(LEAD_STATE_LABELS).map(([key, label]) => ({
  value: key,
  label,
}));

export interface Lead {
    "contact_type": LeadContactType,
    "highlighted": boolean,
    "blocked": boolean,
    "unread": boolean,
    "lead_state": string,
    "deleted": boolean,
    "id": number,
    "name": string,
    "email": string,
    "country_code": null | number,
    "phone": null | number,
    "organization_id": null | number,
    "user_id": null,
    "property_id": null,
    "message": null | string,
    "created_at": string,
    "updated_at": string,
    "property": null | CreateProperty
}

export enum LeadContactType {
  MESSAGE = 'message',
  WHATSAPP = 'whatsapp',
  SAW_CONTACT = 'saw_contact',
} 

export enum TemporalRentPeriod {
  SELECCIONAR = 0,                    // seleccionar
  POR_DIA = 1,                        // Por día
  POR_FIN_DE_SEMANA = 2,             // Por fin de semana
  POR_SEMANA = 3,                     // Por semana
  QUINCENA = 4,                       // Quincena
  MES = 5,                            // Mes
  PRIMER_QUINCENA_ENERO = 6,          // 1er quincena de enero
  SEGUNDA_QUINCENA_ENERO = 7,         // 2da quincena de enero
  PRIMER_QUINCENA_FEBRERO = 8,        // 1er quincena de febrero
  SEGUNDA_QUINCENA_FEBRERO = 9,       // 2da quincena de febrero
  PRIMER_QUINCENA_MARZO = 10,         // 1er quincena de marzo
  SEGUNDA_QUINCENA_MARZO = 11,        // 2da quincena de marzo
  ENERO = 12,                         // Enero
  FEBRERO = 13,                       // Febrero
  MARZO = 14,                         // Marzo
  ABRIL = 15,                         // Abril
  MAYO = 17,                          // Mayo
  JUNIO = 18,                         // Junio
  JULIO = 19,                         // Julio
  AGOSTO = 20,                        // Agosto
  SEPTIEMBRE = 21,                    // Septiembre
  OCTUBRE = 22,                       // Octubre
  NOVIEMBRE = 23,                     // Noviembre
  DICIEMBRE = 24,                     // Diciembre
  POR_TEMPORADA = 25,                 // Por temporada
  POR_ANO = 26,                       // Por año
  FIN_DE_ANO = 27,                    // Fin de año
  SEMANA_SANTA = 28,                  // Semana santa
  PRIMER_QUINCENA_DICIEMBRE = 29,     // 1er quincena de diciembre
  SEGUNDA_QUINCENA_DICIEMBRE = 30,    // 2da quincena de diciembre
}

export const TemporalRentPeriodLabels: Record<string, string> = {
  [TemporalRentPeriod.POR_DIA]: 'Por día',
  [TemporalRentPeriod.POR_FIN_DE_SEMANA]: 'Por fin de semana',
  [TemporalRentPeriod.POR_SEMANA]: 'Por semana',
  [TemporalRentPeriod.QUINCENA]: 'Quincena',
  [TemporalRentPeriod.MES]: 'Mes',
  [TemporalRentPeriod.PRIMER_QUINCENA_ENERO]: '1er quincena de enero',
  [TemporalRentPeriod.SEGUNDA_QUINCENA_ENERO]: '2da quincena de enero',
  [TemporalRentPeriod.PRIMER_QUINCENA_FEBRERO]: '1er quincena de febrero',
  [TemporalRentPeriod.SEGUNDA_QUINCENA_FEBRERO]: '2da quincena de febrero',
  [TemporalRentPeriod.PRIMER_QUINCENA_MARZO]: '1er quincena de marzo',
  [TemporalRentPeriod.SEGUNDA_QUINCENA_MARZO]: '2da quincena de marzo',
  [TemporalRentPeriod.ENERO]: 'Enero',
  [TemporalRentPeriod.FEBRERO]: 'Febrero',
  [TemporalRentPeriod.MARZO]: 'Marzo',
  [TemporalRentPeriod.ABRIL]: 'Abril',
  [TemporalRentPeriod.MAYO]: 'Mayo',
  [TemporalRentPeriod.JUNIO]: 'Junio',
  [TemporalRentPeriod.JULIO]: 'Julio',
  [TemporalRentPeriod.AGOSTO]: 'Agosto',
  [TemporalRentPeriod.SEPTIEMBRE]: 'Septiembre',
  [TemporalRentPeriod.OCTUBRE]: 'Octubre',
  [TemporalRentPeriod.NOVIEMBRE]: 'Noviembre',
  [TemporalRentPeriod.DICIEMBRE]: 'Diciembre',
  [TemporalRentPeriod.POR_TEMPORADA]: 'Por temporada',
  [TemporalRentPeriod.POR_ANO]: 'Por año',
  [TemporalRentPeriod.FIN_DE_ANO]: 'Fin de año',
  [TemporalRentPeriod.SEMANA_SANTA]: 'Semana santa',
  [TemporalRentPeriod.PRIMER_QUINCENA_DICIEMBRE]: '1er quincena de diciembre',
  [TemporalRentPeriod.SEGUNDA_QUINCENA_DICIEMBRE]: '2da quincena de diciembre',
};

export const TEMPORAL_RENT_PERIOD_OPTIONS = Object.entries(TemporalRentPeriodLabels).map(([key, label]) => ({
  value: key,
  label,
}));

export const operationOptions: OperationType[] = [OperationType.VENTA, OperationType.ALQUILER, OperationType.ALQUILER_TEMPORAL, OperationType.EMPRENDIMIENTO];

export const CREATE_PROPERTY_PATCH_KEYS: (keyof CreateProperty)[] = [
  'id',
  'reference_code',
  'publication_title',
  'property_type',
  'status',
  'operation_type',
  'price',
  'currency',
  'property_subtype',
  'publication_title_en',
  'description',
  'internal_comments',
  'street',
  'number',
  'floor',
  'apartment',
  'postal_code',
  'show_exact_location',
  'country_id',
  'state_id',
  'location_id',
  'sub_location_id',
  'neighborhood_id',
  'geo_lat',
  'geo_long',
  'suite_amount',
  'room_amount',
  'bathroom_amount',
  'toilet_amount',
  'parking_lot_amount',
  'surface',
  'roofed_surface',
  'unroofed_surface',
  'semiroofed_surface',
  'total_surface',
  'surface_measurement',
  'roofed_surface_measurement',
  'age',
  'property_condition',
  'brightness',
  'garage_coverage',
  'surface_front',
  'surface_length',
  'situation',
  'dispositions',
  'orientation',
  'floors_amount',
  'zonification',
  'construction_year',
  'last_renovation',
  'expenses',
  'commission',
  'network_share',
  'period',
  'price_square_meter',
  'producer_user',
  'branch_id',
  'user_id',
  'organization_id',
  'key_contact',
  'key_agent_user',
  'key_location',
  'key_reference_code',
  'maintenance_user',
  'owner_name',
  'owner_phone',
  'owner_email',
  'development',
  'network_information',
  'transaction_requirements',
  'images',
  'plans',
  'tags',
  'operations',
  'videos',
  'multimedia360',
  'attached',
  'currency_expenses',
  'selected_plan',
  'view_count',
  'is_development',
  'development_id',
  'development_type',
  'development_logo',
  'development_units_total',
  'development_delivery_date',
  'development_available_unit_count',
  'development_units',
  'development_unit_type',
  'hired_plan_id',
  'purchased_plan_id',
  'visibility',
];


// Define wizard steps
export enum WizardStep {
  INITIAL = 'initial',
  PROPERTY_TYPE = 'property-type',
  LOCATION = 'location',
  CONTENT = 'content',
  DESCRIPTION = 'description',
  MAIN_INFO = 'main-info',
  PRICE = 'price',
  PROPERTY_CONTENT = 'property-content',
  FINAL_REVIEW = 'final-review',
  PLANS = 'plans',
  CHECKOUT_DETAIL = 'checkout-detail',
  CHECKOUT_PAYMENT = 'checkout-payment',
  CHECKOUT_SUCCESS = 'checkout-success',
  EMPRENDIMIENTO = 'emprendimiento',
  EMPRENDIMIENTO_AMENITIES = 'emprendimiento-amenities',
  EMPRENDIMIENTO_UNITS = 'emprendimiento-units',
  EMPRENDIMIENTO_PLANS = 'emprendimiento-plans',
  EMPRENDIMIENTO_PREVIEW = 'emprendimiento-preview'
}

// Define step flow based on operation type
export const REGULAR_FLOW = [
  WizardStep.INITIAL,
  WizardStep.PROPERTY_TYPE,
  WizardStep.LOCATION,
  WizardStep.CONTENT,
  WizardStep.MAIN_INFO,
  WizardStep.PROPERTY_CONTENT,
  WizardStep.DESCRIPTION,
  WizardStep.PRICE, 
  WizardStep.PLANS,
  WizardStep.FINAL_REVIEW,
  WizardStep.CHECKOUT_DETAIL,
  WizardStep.CHECKOUT_PAYMENT,
  WizardStep.CHECKOUT_SUCCESS
];

export const EMPRENDIMIENTO_FLOW = [
  WizardStep.INITIAL,
  WizardStep.EMPRENDIMIENTO,
  WizardStep.EMPRENDIMIENTO_AMENITIES,
  WizardStep.EMPRENDIMIENTO_UNITS,
  WizardStep.EMPRENDIMIENTO_PLANS,
  WizardStep.EMPRENDIMIENTO_PREVIEW
];

export enum BannerPlacement {
  HEADER = 1,
  FOOTER = 2,
  SIDEBAR = 3,
}

export const BannerPlacementLabels: Record<BannerPlacement, string> = {
  [BannerPlacement.HEADER]: 'Header',
  [BannerPlacement.FOOTER]: 'Footer',
  [BannerPlacement.SIDEBAR]: 'Sidebar',
};

export const BANNER_PLACEMENT_OPTIONS = Object.entries(BannerPlacementLabels).map(([key, label]) => ({
  value: key,
  label,
}));

export type AdBanner = {
  id: number;
  image_url: string;
  name: string;
  placements: BannerPlacement;
  status: boolean;
  link: string;
  file: string;
}

export enum Disposition {  
  CONTRAFRENTE = 1,
  FRENTE = 2,
  FRENTE_INTERNO = 3,
  LATERAL = 4,
}

export const DispositionLabels: Record<Disposition, string> = {
  [Disposition.CONTRAFRENTE]: 'Contrafrente',
  [Disposition.FRENTE]: 'Frente',
  [Disposition.FRENTE_INTERNO]: 'Frente Interno',
  [Disposition.LATERAL]: 'Lateral',
};

export const DISPOSITION_OPTIONS = Object.entries(DispositionLabels).map(([key, label]) => ({
  value: key,
  label,
}));