// ─── API Query Params ─────────────────────────────────────────────────────────

import { CreateProperty } from "./propiedad";

export interface PropertyFilterParams {
  page?: number;
  limit?: number;
  organization_id?: number;
  country_id?: number;
  state_id?: number;
  location_id?: number;
  sub_location_id?: number;
  /** Comma-separated PropertyType enum values, e.g. "1,2,4" */
  property_type?: string;
  /** Comma-separated OperationType enum values, e.g. "1,2" */
  operation_type?: string;
  /** ISO currency code: "USD" | "ARS" */
  currency?: string;
  status?: number;
  price_min?: number;
  price_max?: number;
  price_m2_min?: number;
  price_m2_max?: number;
  roofed_surface_min?: number;
  roofed_surface_max?: number;
  total_surface_min?: number;
  total_surface_max?: number;
  bathroom_amount?: string;
  room_amount?: string;
  suite_amount?: string;
  parking_lot_amount?: string;
  age_min?: number;
  age_max?: number;
  /** Comma-separated disposition IDs: "1,2,3" */
  disposition?: string;
  /** Free text search */
  q?: string;
  /** Bounding box filter (from map "search in this area") */
  lat_ne?: number;
  lng_ne?: number;
  lat_sw?: number;
  lng_sw?: number;
  [key: string]: string | number | undefined;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PropertyImage {
  id: number;
  url: string;
  is_blueprint: boolean;
  order_position: number;
}

export interface PropertyOrganization {
  id: number;
  name: string;
  logo_url?: string;
}

export interface PropertyListItem {
  id: number;
  reference_code: string;
  publication_title: string;
  property_type: number;
  operation_type: number;
  price: number;
  currency: string;
  status: number;
  street?: string;
  number?: string;
  floor?: string;
  apartment?: string;
  location_id?: number;
  sub_location_id?: number;
  room_amount?: number;
  bathroom_amount?: number;
  suite_amount?: number;
  parking_lot_amount?: number;
  roofed_surface?: number;
  total_surface?: number;
  price_square_meter?: number;
  geo_lat?: number;
  geo_long?: number;
  age?: number;
  images: PropertyImage[];
  organization?: PropertyOrganization;
}

export interface MapDataItem {
  id: number;
  lat: number;
  lng: number;
  price: string;
  reference_code: string;
}

export interface PropertiesResponse {
  data: CreateProperty[];
  total: number;
  page: number;
  limit: number;
  mapData?: MapDataItem[];
}
