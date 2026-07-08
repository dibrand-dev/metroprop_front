'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import RadioButton from '@/ui/RadioButton/RadioButton';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import Select from '@/ui/Select/Select';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL, formatNumbers } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';
import { AMENITY_TYPE_LABELS, AmenityGroup, AmenityTag, AmenityType, OperationType, OPERATION_TYPE_LABELS, Orientation, ORIENTATION_LABELS, PROPERTY_SUBTYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import LocationAutocompleteInput from '@/components/LocationAutocompleteInput/LocationAutocompleteInput';
import CreateAlertModal from '@/components/CreateAlertModal/CreateAlertModal';
import type { MapDataItem } from '@/types/property-api';
import type { CreateProperty } from '@/types/propiedad';

// ─── Constants ────────────────────────────────────────────────────────────────

const OPERACION_COLLAPSED = 8;

const QUANTITY_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '+4' },
];

const ANTIGUEDAD_OPTIONS = [
  { value: '-1', label: 'En Construcción' },
  { value: '0', label: 'A estrenar' },
  { value: '1-5', label: '1-5 años' },
  { value: '5-10', label: '5-10 años' },
  { value: '10-20', label: '10-20 años' },
  { value: '20+', label: 'Más de 20 años' },
];

const SUBTIPOS = Object.values(PROPERTY_SUBTYPE_LABELS);

const HIST_BAR_MAX_HEIGHT = 56;
const HIST_BUCKET_SIZE = 1000;
const HIST_MAX_BARS = 60;

const PLACEHOLDER_HIST_BARS = [
  4, 6, 10, 8, 14, 12, 18, 22, 16, 28, 24, 32, 20, 38, 44, 36, 50, 48, 56, 52,
  46, 40, 34, 42, 38, 30, 26, 22, 28, 18, 24, 16, 20, 12, 8, 14, 10, 6, 12, 16,
  10, 8, 14, 18, 12, 8, 6, 10, 4, 6,
];

function buildHistogramBars(prices: number[], bucketSize: number, capMax?: number): number[] {
  if (prices.length === 0) return [];
  // Clamp prices to capMax so everything >= capMax falls in the last bar
  const clamped = capMax != null ? prices.map(p => Math.min(p, capMax)) : prices;
  let min = clamped[0];
  let max = clamped[0];
  for (let i = 1; i < clamped.length; i++) {
    if (clamped[i] < min) min = clamped[i];
    if (clamped[i] > max) max = clamped[i];
  }
  if (min === max) return [HIST_BAR_MAX_HEIGHT];
  // Always count by the requested bucketSize (e.g. 1000)
  const bucketStart = Math.floor(min / bucketSize) * bucketSize;
  const bucketEnd = Math.ceil(max / bucketSize) * bucketSize;
  const bucketCount = Math.round((bucketEnd - bucketStart) / bucketSize);
  const counts = new Array(bucketCount).fill(0);
  for (const p of clamped) {
    const idx = Math.min(Math.floor((p - bucketStart) / bucketSize), bucketCount - 1);
    counts[idx]++;
  }
  // Downsample to HIST_MAX_BARS for display if needed
  let display = counts;
  if (counts.length > HIST_MAX_BARS) {
    const ratio = counts.length / HIST_MAX_BARS;
    display = [];
    for (let i = 0; i < HIST_MAX_BARS; i++) {
      const from = Math.round(i * ratio);
      const to = Math.round((i + 1) * ratio);
      let sum = 0;
      for (let j = from; j < to; j++) sum += counts[j];
      display.push(sum);
    }
  }
  let maxCount = 0;
  for (const c of display) { if (c > maxCount) maxCount = c; }
  if (maxCount === 0) return display.map(() => 0);
  return display.map(c => c > 0 ? Math.max(2, Math.round((c / maxCount) * HIST_BAR_MAX_HEIGHT)) : 0);
}

const PRECIO_USD_MAX = 1_000_000;
const PRECIO_ARS_MAX = 1_500_000_000;

const PRECIO_M2_USD_MAX = 10_000;
const PRECIO_M2_ARS_MAX = 5_000_000;

const SUPERFICIE_OPTIONS = [
  { value: '20', label: '20' }, { value: '30', label: '30' }, { value: '40', label: '40' },
  { value: '50', label: '50' }, { value: '60', label: '60' }, { value: '70', label: '70' },
  { value: '80', label: '80' }, { value: '100', label: '100' }, { value: '120', label: '120' },
  { value: '150', label: '150' }, { value: '200', label: '200' }, { value: '300', label: '300' },
  { value: '500', label: '500' }, { value: '1000', label: '1.000' },
];

const UNIDAD_OPTIONS = [
  { value: 'm2', label: 'm²' },
  { value: 'ha', label: 'ha' },
];

const FILTER_OPERATION_OPTIONS: OperationType[] = [
  OperationType.VENTA,
  OperationType.ALQUILER,
  OperationType.ALQUILER_TEMPORAL,
];

// ─── URL Param Helpers ──────────────────────────────────────────────────────────────

const SUBTIPO_LABEL_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(PROPERTY_SUBTYPE_LABELS).map(([id, label]) => [label, id])
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoomsState {
  ambientes: string;
  dormitorios: string;
  banos: string;
  cocheras: string;
}

interface MasFiltrosState {
  inmobiliaria: boolean;
  duenoDirecto: boolean;
  antiguedad: string;
  tipoAmbientes: Record<string, boolean>;
  orientation: Record<string, boolean>;
  tags: number[];
  subtipos: Record<string, boolean>;
}

const EMPTY_ROOMS: RoomsState = { ambientes: '', dormitorios: '', banos: '', cocheras: '' };

const EMPTY_MAS_FILTROS: MasFiltrosState = {
  inmobiliaria: false,
  duenoDirecto: false,
  antiguedad: '',
  tipoAmbientes: {},
  orientation: {},
  tags: [],
  subtipos: {},
};

interface PrecioSectionState { moneda: 'ARS' | 'USD' | null; desde: string; hasta: string; }
interface SuperficieFilter { tipo: 'Cubierta' | 'Total'; unidad: string; desde: string; hasta: string; }
interface PrecioFilterState {
  precio: PrecioSectionState;
  precioM2: PrecioSectionState;
  superficie: SuperficieFilter;
}

const EMPTY_PRECIO: PrecioFilterState = {
  precio: { moneda: null, desde: '', hasta: '' },
  precioM2: { moneda: null, desde: '', hasta: '' },
  superficie: { tipo: 'Total', unidad: 'm²', desde: '', hasta: '' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countMasFiltros(f: MasFiltrosState): number {
  return (
    (f.inmobiliaria ? 1 : 0) +
    (f.duenoDirecto ? 1 : 0) +
    (f.antiguedad ? 1 : 0) +
    Object.values(f.tipoAmbientes).filter(Boolean).length +
    Object.values(f.orientation).filter(Boolean).length +
    (f.tags.length === 1 && f.tags[0] === 0 ? 0 : f.tags.length) +
    Object.values(f.subtipos).filter(Boolean).length +
    0
  );
}

function toPairs<T>(arr: T[]): [T, T | undefined][] {
  const pairs: [T, T | undefined][] = [];
  for (let i = 0; i < arr.length; i += 2) pairs.push([arr[i], arr[i + 1]]);
  return pairs;
}

/** Build URLSearchParams from the full applied filter state. */
function buildFilterParams(
  operacion: OperationType | null,
  selectedTypes: Record<string, boolean>,
  rooms: RoomsState,
  masFiltros: MasFiltrosState,
  precio: PrecioFilterState,
  searchText: string,
): URLSearchParams {
  const p = new URLSearchParams();
  if (operacion) p.set('operation_type', String(operacion));
  if (precio.precio.moneda) p.set('currency', precio.precio.moneda);
  p.set('page', '1');
  p.set('limit', '20');

  const types = Object.entries(selectedTypes).filter(([, v]) => v).map(([k]) => k).join(',');
  if (types) p.set('property_type', types);

  const subtypes = Object.entries(masFiltros.subtipos)
    .filter(([, selected]) => selected)
    .map(([label]) => SUBTIPO_LABEL_TO_ID[label])
    .filter(Boolean)
    .join(',');
  if (subtypes) p.set('property_subtype', subtypes);

  if (precio.precio.desde) p.set('price_min', precio.precio.desde);
  if (precio.precio.hasta) p.set('price_max', precio.precio.hasta);
  if (precio.precioM2.desde) p.set('price_m2_min', precio.precioM2.desde);
  if (precio.precioM2.hasta) p.set('price_m2_max', precio.precioM2.hasta);
  if (precio.superficie.desde)
    p.set(precio.superficie.tipo === 'Cubierta' ? 'roofed_surface_min' : 'total_surface_min', precio.superficie.desde);
  if (precio.superficie.hasta)
    p.set(precio.superficie.tipo === 'Cubierta' ? 'roofed_surface_max' : 'total_surface_max', precio.superficie.hasta);

  if (rooms.ambientes) p.set('room_amount', rooms.ambientes);
  if (rooms.dormitorios) p.set('suite_amount', rooms.dormitorios);
  if (rooms.banos) p.set('bathroom_amount', rooms.banos);
  if (rooms.cocheras) p.set('parking_lot_amount', rooms.cocheras);
  if (masFiltros.antiguedad) p.set('age', masFiltros.antiguedad);

  const orientation = Object.entries(masFiltros.orientation)
    .filter(([, selected]) => selected)
    .map(([value]) => value)
    .join(',');
  if (orientation) p.set('orientation', orientation);

  if (masFiltros.tags.length > 0 && masFiltros.tags.join(',') !== '0') {
    p.set('tags', masFiltros.tags.join(','));
  }

  if (masFiltros.duenoDirecto) p.set('direct_owner', '1');
  if (masFiltros.inmobiliaria) p.set('inmobiliaria', '1');

  if (searchText.trim()) p.set('q', searchText.trim());

  return p;
}

/** Parse URLSearchParams back to the applied filter state for initialisation. */
type ParsedFilterState = {
  operacion: OperationType;
  selectedTypes: Record<string, boolean>;
  rooms: RoomsState;
  masFiltros: MasFiltrosState;
  precio: PrecioFilterState;
  searchText: string;
};

function parseUrlToState(sp: { get: (k: string) => string | null }): ParsedFilterState {
  const get = (k: string) => sp.get(k) ?? '';
  const opType = get('operation_type');
  const parsedOperationType = Number(opType) as OperationType;
  const operacion = FILTER_OPERATION_OPTIONS.includes(parsedOperationType)
    ? parsedOperationType
    : OperationType.ALQUILER;

  const selectedTypes: Record<string, boolean> = {};
  const ptParam = get('property_type');
  if (ptParam) ptParam.split(',').forEach((id) => { selectedTypes[id.trim()] = true; });

  const subtipos: Record<string, boolean> = {};
  const pstParam = get('property_subtype');
  if (pstParam) {
    pstParam.split(',').forEach((id) => {
      const label = PROPERTY_SUBTYPE_LABELS[Number(id.trim()) as keyof typeof PROPERTY_SUBTYPE_LABELS];
      if (label) subtipos[label] = true;
    });
  }

  const rooms: RoomsState = {
    ambientes: get('room_amount'),
    dormitorios: get('suite_amount'),
    banos: get('bathroom_amount'),
    cocheras: get('parking_lot_amount'),
  };

  const currency = (get('currency') || null) as 'ARS' | 'USD' | null;
  const superficieTipo: 'Cubierta' | 'Total' =
    sp.get('roofed_surface_min') || sp.get('roofed_surface_max') ? 'Cubierta' : 'Total';
  const precio: PrecioFilterState = {
    precio: { moneda: currency, desde: get('price_min'), hasta: get('price_max') },
    precioM2: { moneda: currency, desde: get('price_m2_min'), hasta: get('price_m2_max') },
    superficie: {
      tipo: superficieTipo, unidad: 'm²',
      desde: get(superficieTipo === 'Cubierta' ? 'roofed_surface_min' : 'total_surface_min'),
      hasta: get(superficieTipo === 'Cubierta' ? 'roofed_surface_max' : 'total_surface_max'),
    },
  };

  const ageMin = sp.get('age_min');
  const ageMax = sp.get('age_max');
  let antiguedad = '';
  if (ageMin !== null) {
    if (ageMin === '0' && ageMax === '0') antiguedad = 'estrenar';
    else if (ageMin === '1') antiguedad = '1-5';
    else if (ageMin === '5') antiguedad = '5-10';
    else if (ageMin === '10') antiguedad = '10-20';
    else if (ageMin === '20') antiguedad = '20+';
  }

  const orientation: Record<string, boolean> = {};
  const orientationParam = get('orientation');
  if (orientationParam) {
    orientationParam.split(',').forEach((value) => {
      const trimmed = value.trim();
      if (trimmed) orientation[trimmed] = true;
    });
  }

  const tags = get('tags')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => !Number.isNaN(id));

  return {
    operacion, selectedTypes, rooms,
    masFiltros: { ...EMPTY_MAS_FILTROS, antiguedad, orientation, tags, subtipos },
    precio, searchText: get('q'),
  };
}

// ─── PriceRangeSlider ─────────────────────────────────────────────────────────
function formatSliderTooltip(val: number, max: number): string {
  if (val >= max) return `+${max.toLocaleString('es-AR')}`;
  return `$${val.toLocaleString('es-AR')}`;
}

function PriceRangeSlider({
  histBars, min, max, desde, hasta, onDesdeChange, onHastaChange,
}: {
  histBars: number[];
  min: number;
  max: number;
  desde: string;
  hasta: string;
  onDesdeChange: (v: string) => void;
  onHastaChange: (v: string) => void;
}) {
  const [draggingFrom, setDraggingFrom] = useState(false);
  const [draggingTo, setDraggingTo] = useState(false);
  const fromVal = desde === '' ? min : Math.max(min, Math.min(Number(desde), max));
  const toVal = hasta === '' ? max : Math.max(min, Math.min(Number(hasta), max));
  const fromPct = ((fromVal - min) / (max - min)) * 100;
  const toPct = ((toVal - min) / (max - min)) * 100;
  const fillLeft = Math.min(fromPct, toPct);
  const fillRight = 100 - Math.max(fromPct, toPct);

  const noRealData = histBars.length === 0;
  const displayBars = noRealData ? PLACEHOLDER_HIST_BARS : histBars;
  const FILLER_HEIGHTS = [3, 35, 2, 17, 24, 66, 23, 48, 55, 64, 37, 3, 6, 22, 45, 28, 24, 43, 6, 5];
  return (
    <div className="precio-slider-wrapper">
      <div className="precio-histogram">
        {displayBars.map((h, i) => {
          const isFiller = noRealData || h === 0;
          const barHeight = h === 0 ? FILLER_HEIGHTS[i % FILLER_HEIGHTS.length] : h;
          const barPct = (i / (displayBars.length - 1)) * 100;
          const inRange = !isFiller && barPct >= fillLeft && barPct <= (100 - fillRight);
          return (
            <div
              key={i}
              className="precio-histogram-bar"
              style={{ height: `${barHeight}px`, background: inRange ? '#006AFF' : '#EBF2FD' }}
            />
          );
        })}
      </div>
      <div className="precio-range-container">
        <div className="precio-range-track-bg" />
        <div className="precio-range-track-fill" style={{ left: `${fillLeft}%`, right: `${fillRight}%` }} />
        {/* From tooltip */}
        {draggingFrom && (
          <div className="precio-slider-tooltip" style={{ left: `${fromPct}%` }}>
            {formatSliderTooltip(fromVal, max)}
          </div>
        )}
        {/* To tooltip */}
        {draggingTo && (
          <div className="precio-slider-tooltip" style={{ left: `${toPct}%` }}>
            {formatSliderTooltip(toVal, max)}
          </div>
        )}
        <input
          type="range" min="0" max="100" step="0.5"
          value={formatNumbers(fromPct)}
          onMouseDown={() => setDraggingFrom(true)}
          onMouseUp={() => setDraggingFrom(false)}
          onTouchStart={() => setDraggingFrom(true)}
          onTouchEnd={() => setDraggingFrom(false)}
          onChange={(e) => {
            const pct = Number(e.target.value);
            const val = Math.round(min + (pct / 100) * (max - min));
            onDesdeChange(val <= min ? '' : String(val));
          }}
          className="precio-thumb precio-thumb-from"
          style={{ zIndex: fromPct >= toPct ? 5 : 3 }}
          aria-label="Precio desde"
        />
        <input
          type="range" min="0" max="100" step="0.5"
          value={formatNumbers(toPct)}
          onMouseDown={() => setDraggingTo(true)}
          onMouseUp={() => setDraggingTo(false)}
          onTouchStart={() => setDraggingTo(true)}
          onTouchEnd={() => setDraggingTo(false)}
          onChange={(e) => {
            const pct = Number(e.target.value);
            const val = Math.round(min + (pct / 100) * (max - min));
            onHastaChange(val >= max ? '' : String(val));
          }}
          className="precio-thumb precio-thumb-to"
          aria-label="Precio hasta"
        />
      </div>
      <div className="precio-inputs">
        <input
          type="text"
          inputMode="numeric"
          value={desde && formatNumbers(desde)}
          onChange={(e) => onDesdeChange(e.target.value.replace(/\D/g, ''))}
          placeholder="Desde"
          className="precio-input-field"
        />
        <span className="precio-input-separator">-</span>
        <input
          type="text"
          inputMode="numeric"
          value={hasta && formatNumbers(hasta)}
          onChange={(e) => onHastaChange(e.target.value.replace(/\D/g, ''))}
          placeholder="Hasta"
          className="precio-input-field"
        />
      </div>
    </div>
  );
}

function PrecioSectionBlock({
  title, radioName, histBars, state, onChange, maxPrice, usdMax, arsMax,
}: {
  title: string;
  radioName: string;
  histBars: number[];
  state: PrecioSectionState;
  onChange: (patch: Partial<PrecioSectionState>) => void;
  maxPrice?: number;
  usdMax?: number;
  arsMax?: number;
}) {
  const fallbackMax = state.moneda === 'ARS' ? (arsMax ?? PRECIO_ARS_MAX) : (usdMax ?? PRECIO_USD_MAX);
  const priceMax = fallbackMax;
  return (
    <div className="precio-section">
      <h3 className="precio-section-title">{title}</h3>
      <div className="precio-currency-row">
        <RadioButton label="Pesos" name={radioName} value="ARS" checked={state.moneda === 'ARS'} onChange={() => onChange({ moneda: 'ARS', desde: '', hasta: '' })} />
        <RadioButton label="USD" name={radioName} value="USD" checked={state.moneda === 'USD'} onChange={() => onChange({ moneda: 'USD', desde: '', hasta: '' })} />
      </div>
      <PriceRangeSlider
        histBars={histBars}
        min={0}
        max={priceMax}
        desde={state.desde}
        hasta={state.hasta}
        onDesdeChange={(v) => onChange({ desde: v, ...(!state.moneda && v ? { moneda: 'USD' } : {}) })}
        onHastaChange={(v) => onChange({ hasta: v, ...(!state.moneda && v ? { moneda: 'USD' } : {}) })}
      />
    </div>
  );
}

function TipoDePropiedadSection({  tempSelectedTypes, setTempSelectedTypes, typeRows, setShowAllTypes, showAllTypes }: {
  tempSelectedTypes: Record<string, boolean>;
  setTempSelectedTypes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  typeRows: [string, string][][];
  setShowAllTypes: React.Dispatch<React.SetStateAction<boolean>>;
  showAllTypes: boolean;
}) {
  return <>
    <div className="operacion-property-section">
      <h3 className="operacion-section-title">Tipo de propiedad</h3>
      <div className="operacion-property-grid">
        {typeRows.map((row, rowIdx) => (
          <div key={rowIdx} className="operacion-property-row">
            {row.map(([typeId, typeLabel]) => (
              <Checkbox key={typeId} label={typeLabel} checked={!!tempSelectedTypes[typeId]} onChange={(checked) => setTempSelectedTypes((prev) => ({ ...prev, [typeId]: checked }))} />
            ))}
          </div>
        ))}
      </div>
      <button className="operacion-toggle-btn" onClick={() => setShowAllTypes((p) => !p)}>
        {showAllTypes ? 'Ver menos' : 'Ver más'}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: showAllTypes ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  </>
}

function RoomsSection({ tempRooms, setTempRooms }: {
  tempRooms: RoomsState;
  setTempRooms: React.Dispatch<React.SetStateAction<RoomsState>>;
}) {
  return <>
    <div className="rooms-popover-grid">
      <div className="rooms-popover-field">
        <h3 className="rooms-popover-label">Ambientes</h3>
        <Select options={QUANTITY_OPTIONS} value={tempRooms.ambientes} onChange={(val) => setTempRooms((prev) => ({ ...prev, ambientes: val }))} placeholder="Cantidad" />
      </div>
      <div className="rooms-popover-field">
        <h3 className="rooms-popover-label">Dormitorios</h3>
        <Select options={QUANTITY_OPTIONS} value={tempRooms.dormitorios} onChange={(val) => setTempRooms((prev) => ({ ...prev, dormitorios: val }))} placeholder="Cantidad" />
      </div>
      <div className="rooms-popover-field">
        <h3 className="rooms-popover-label">Baños</h3>
        <Select options={QUANTITY_OPTIONS} value={tempRooms.banos} onChange={(val) => setTempRooms((prev) => ({ ...prev, banos: val }))} placeholder="Cantidad" />
      </div>
      <div className="rooms-popover-field">
        <h3 className="rooms-popover-label">Cocheras</h3>
        <Select options={QUANTITY_OPTIONS} value={tempRooms.cocheras} onChange={(val) => setTempRooms((prev) => ({ ...prev, cocheras: val }))} placeholder="Seleccionar" />
      </div>
    </div>
  </>
}

function PrecioSection({ tempPrecio, setTempPrecio, histPrecio, histPrecioM2, maxPrice }: {
  tempPrecio: PrecioFilterState;
  setTempPrecio: React.Dispatch<React.SetStateAction<PrecioFilterState>>;
  histPrecio: number[];
  histPrecioM2: number[];
  maxPrice?: number;
}) {
  return <>
    <PrecioSectionBlock
      title="Precio"
      radioName="precio-moneda"
      histBars={histPrecio}
      state={tempPrecio.precio}
      onChange={(patch) => setTempPrecio((prev) => ({ ...prev, precio: { ...prev.precio, ...patch } }))}
      maxPrice={maxPrice}
    />
    <PrecioSectionBlock
      title="Precio m²"
      radioName="preciom2-moneda"
      histBars={histPrecioM2}
      state={tempPrecio.precioM2}
      onChange={(patch) => setTempPrecio((prev) => ({ ...prev, precioM2: { ...prev.precioM2, ...patch } }))}
      usdMax={PRECIO_M2_USD_MAX}
      arsMax={PRECIO_M2_ARS_MAX}
    />
    {/* Superficie */}
    <div className="precio-section">
      <h3 className="precio-section-title">Superficie</h3>
      <div className="precio-currency-row">
        <RadioButton
          label="Cubierta" name="superficie-tipo" value="Cubierta"
          checked={tempPrecio.superficie.tipo === 'Cubierta'}
          onChange={() => setTempPrecio((prev) => ({ ...prev, superficie: { ...prev.superficie, tipo: 'Cubierta' } }))}
        />
        <RadioButton
          label="Total" name="superficie-tipo" value="Total"
          checked={tempPrecio.superficie.tipo === 'Total'}
          onChange={() => setTempPrecio((prev) => ({ ...prev, superficie: { ...prev.superficie, tipo: 'Total' } }))}
        />
      </div>
      <div className="superficie-row">
        <div className="superficie-unidad-select">
          <Select
            options={UNIDAD_OPTIONS}
            value={tempPrecio.superficie.unidad}
            onChange={(v) => setTempPrecio((prev) => ({ ...prev, superficie: { ...prev.superficie, unidad: v } }))}
            placeholder="m²"
            
          />
        </div>
        <Select
          options={SUPERFICIE_OPTIONS}
          value={tempPrecio.superficie.desde}
          onChange={(v) => setTempPrecio((prev) => ({ ...prev, superficie: { ...prev.superficie, desde: v } }))}
          placeholder="Desde"
        />
        <span className="precio-input-separator">-</span>
        <Select
          options={SUPERFICIE_OPTIONS}
          value={tempPrecio.superficie.hasta}
          onChange={(v) => setTempPrecio((prev) => ({ ...prev, superficie: { ...prev.superficie, hasta: v } }))}
          placeholder="Hasta"
        />
      </div>
    </div>
  </>
}

// ─── CollapsibleCheckboxSection ───────────────────────────────────────────────

interface CollapsibleSectionProps {
  title: string;
  items: string[];
  values: Record<string, boolean>;
  onChange: (key: string, checked: boolean) => void;
  collapsedCount?: number;
}

function CollapsibleCheckboxSection({
  title,
  items,
  values,
  onChange,
  collapsedCount = 4,
}: CollapsibleSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, collapsedCount);
  const pairs = toPairs(visible);
  const hasMore = items.length > collapsedCount;

  return (
    <div className="filtros-section">
      <h3 className="filtros-section-title">{title}</h3>
      <div className="filtros-section-grid">
        {pairs.map((pair, i) => (
          <div key={i} className="filtros-section-row">
            <Checkbox
              label={pair[0]}
              checked={!!values[pair[0]]}
              onChange={(checked) => onChange(pair[0], checked)}
            />
            {pair[1] && (
              <Checkbox
                label={pair[1]}
                checked={!!values[pair[1]]}
                onChange={(checked) => onChange(pair[1]!, checked)}
              />
            )}
          </div>
        ))}
      </div>
      {hasMore && (
        <button className="operacion-toggle-btn" onClick={() => setShowAll((p) => !p)}>
          {showAll ? 'Ver menos' : 'Ver más'}
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function CollapsibleTagGroupSection({
  title,
  options,
  selectedTagIds,
  onToggle,
  collapsedCount = 8,
}: {
  title: string;
  options: AmenityTag[];
  selectedTagIds: number[];
  onToggle: (tagId: number, checked: boolean) => void;
  collapsedCount?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, collapsedCount);
  const pairs = toPairs(visible);
  const hasMore = options.length > collapsedCount;

  return (
    <div className="filtros-section">
      <h3 className="filtros-section-title">{title}</h3>
      <div className="filtros-section-grid">
        {pairs.map((pair, i) => (
          <div key={i} className="filtros-section-row">
            <Checkbox
              label={pair[0].name}
              checked={selectedTagIds.includes(pair[0].id)}
              onChange={(checked) => onToggle(pair[0].id, checked)}
            />
            {pair[1] && (
              <Checkbox
                label={pair[1].name}
                checked={selectedTagIds.includes(pair[1].id)}
                onChange={(checked) => onToggle(pair[1]!.id, checked)}
              />
            )}
          </div>
        ))}
      </div>
      {hasMore && (
        <button className="operacion-toggle-btn" onClick={() => setShowAll((p) => !p)}>
          {showAll ? 'Ver menos' : 'Ver más'}
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

export default function FilterBar({ setViewMode, viewMode, mapData = [], properties = [] }: { setViewMode: React.Dispatch<React.SetStateAction<'list' | 'map'>>; viewMode: 'list' | 'map'; mapData?: MapDataItem[]; properties?: CreateProperty[] }) {
  // ── Router & search params
  const searchParams = useSearchParams();

  // ── Applied state
  const [operacion, setOperacion] = useState<OperationType | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({});
  const [rooms, setRooms] = useState<RoomsState>(EMPTY_ROOMS);
  const [masFiltros, setMasFiltros] = useState<MasFiltrosState>(EMPTY_MAS_FILTROS);
  const [precio, setPrecio] = useState<PrecioFilterState>(EMPTY_PRECIO);
  const [searchText, setSearchText] = useState('');

  // ── Popover open flags
  const [operacionOpen, setOperacionOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [precioOpen, setPrecioOpen] = useState(false);

  // ── Temp / draft state
  const [tempOperacion, setTempOperacion] = useState<OperationType | null>(null);
  const [tempSelectedTypes, setTempSelectedTypes] = useState<Record<string, boolean>>({});
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [tempRooms, setTempRooms] = useState<RoomsState>(EMPTY_ROOMS);
  const [tempMasFiltros, setTempMasFiltros] = useState<MasFiltrosState>(EMPTY_MAS_FILTROS);

  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => apiFetch(`${API_BASE_URL}/tags`),
  });

  const amenityGroups = useMemo<AmenityGroup[]>(() => {
    if (!Array.isArray(tagsData) || tagsData.length === 0) return [];
    return Object.values(AmenityType)
      .filter(v => typeof v === 'number')
      .map(type => {
        const options = (tagsData as AmenityTag[]).filter((tag) => tag.type === type);
        return {
          type: type as AmenityType,
          title: AMENITY_TYPE_LABELS[type as AmenityType],
          options,
        };
      })
      .filter(group => group.options.length > 0);
  }, [tagsData]);
  const orientationOptions = useMemo(
    () =>
      Object.entries(ORIENTATION_LABELS)
        .filter(([value]) => value !== String(Orientation.SELECCIONAR))
        .map(([value, label]) => ({ value, label })),
    []
  );
  const [tempPrecio, setTempPrecio] = useState<PrecioFilterState>(EMPTY_PRECIO);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const createAlert = () => setIsAlertModalOpen(true);

  const currentFilters = useMemo(() => {
    const params = buildFilterParams(operacion, selectedTypes, rooms, masFiltros, precio, searchText);
    const locationId = searchParams.get('location_id');
    if (locationId) params.set('location_id', locationId);
    return JSON.stringify(Object.fromEntries(params.entries()));
  }, [operacion, selectedTypes, rooms, masFiltros, precio, searchText, searchParams]);

  // ── Histogram bars computed from mapData prices (fall back to properties list)
  const mapPrices = useMemo(() => {
    const fromMap = mapData.map(d => Number(d.price)).filter(p => !isNaN(p) && p > 0);
    if (fromMap.length > 0) return fromMap;
    return properties.map(d => d.price).filter(p => !isNaN(p) && p > 0);
  }, [mapData, properties]);
  const histPrecio = useMemo(() => buildHistogramBars(mapPrices, HIST_BUCKET_SIZE, PRECIO_USD_MAX), [mapPrices]);
  const mapPricesM2 = useMemo(() => {
    const fromMap = mapData.map(d => Number(d.price_square_meter)).filter(p => !isNaN(p) && p > 0);
    if (fromMap.length > 0) return fromMap;
    return properties.map(d => Number(d.price_square_meter)).filter(p => !isNaN(p) && p > 0);
  }, [mapData, properties]);
  const histPrecioM2 = useMemo(() => buildHistogramBars(mapPricesM2, 100, PRECIO_M2_USD_MAX), [mapPricesM2]);
  const maxPriceFromData = useMemo(() => {
    if (mapPrices.length === 0) return undefined;
    let m = mapPrices[0];
    for (let i = 1; i < mapPrices.length; i++) { if (mapPrices[i] > m) m = mapPrices[i]; }
    return m;
  }, [mapPrices]);

  // ── Refs
  const operacionPopoverRef = useRef<HTMLDivElement>(null);
  const operacionTriggerRef = useRef<HTMLButtonElement>(null);
  const roomsPopoverRef = useRef<HTMLDivElement>(null);
  const roomsTriggerRef = useRef<HTMLButtonElement>(null);
  const filtrosPopoverRef = useRef<HTMLDivElement>(null);
  const filtrosTriggerRef = useRef<HTMLButtonElement>(null);
  const precioPopoverRef = useRef<HTMLDivElement>(null);
  const precioTriggerRef = useRef<HTMLButtonElement>(null);

  // ── Initialise applied state from URL params (supports browser back/forward)
  useEffect(() => {
    const parsed = parseUrlToState(searchParams);
    setOperacion(parsed.operacion);
    setSelectedTypes(parsed.selectedTypes);
    setRooms(parsed.rooms);
    setMasFiltros(parsed.masFiltros);
    setPrecio(parsed.precio);
    setSearchText(parsed.searchText);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Push the full current filter state to the URL (replaces history entry,
  // page=1 reset happens automatically via buildFilterParams).
  const pushUrl = (
    newOperacion: OperationType | null,
    newSelectedTypes: Record<string, boolean>,
    newRooms: RoomsState,
    newMasFiltros: MasFiltrosState,
    newPrecio: PrecioFilterState,
    newSearchText: string,
    locationId?: number,
    resetLocationId?: boolean,
  ) => {
    // Read from window.location so we always get the current URL, not the stale
    // React searchParams which only updates after a re-render.
    const params = new URLSearchParams(window.location.search);
    const managedFilterKeys = [
      'operation_type',
      'currency',
      'page',
      'limit',
      'property_type',
      'property_subtype',
      'price_min',
      'price_max',
      'price_m2_min',
      'price_m2_max',
      'roofed_surface_min',
      'roofed_surface_max',
      'total_surface_min',
      'total_surface_max',
      'room_amount',
      'suite_amount',
      'bathroom_amount',
      'parking_lot_amount',
      'age',
      'orientation',
      'tags',
      'direct_owner',
      'inmobiliaria',
      'q',
      'northEastLat',
      'northEastLng',
      'southWestLat',
      'southWestLng',
      'polygon',
    ];
    managedFilterKeys.forEach((key) => params.delete(key));
    // Overwrite with the freshly built filter params.
    buildFilterParams(newOperacion, newSelectedTypes, newRooms, newMasFiltros, newPrecio, newSearchText)
      .forEach((v, k) => params.set(k, v));
    // If resetting from the search box, clear the old location_id first.
    if (resetLocationId) params.delete('location_id');
    // If a location was explicitly selected, update location_id; otherwise keep the existing one.
    if (locationId != null) params.set('location_id', String(locationId));
    const nextSearch = params.toString();
    window.history.replaceState(window.history.state, '', `/results?${nextSearch}`);
    window.dispatchEvent(
      new CustomEvent('results:filters-changed', { detail: { search: nextSearch } })
    );
  };

  // ── Click-outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        operacionPopoverRef.current && !operacionPopoverRef.current.contains(e.target as Node) &&
        operacionTriggerRef.current && !operacionTriggerRef.current.contains(e.target as Node)
      ) setOperacionOpen(false);
    };
    if (operacionOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [operacionOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        roomsPopoverRef.current && !roomsPopoverRef.current.contains(e.target as Node) &&
        roomsTriggerRef.current && !roomsTriggerRef.current.contains(e.target as Node)
      ) setRoomsOpen(false);
    };
    if (roomsOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [roomsOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        filtrosPopoverRef.current && !filtrosPopoverRef.current.contains(e.target as Node) &&
        filtrosTriggerRef.current && !filtrosTriggerRef.current.contains(e.target as Node)
      ) setFiltrosOpen(false);
    };
    if (filtrosOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filtrosOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        precioPopoverRef.current && !precioPopoverRef.current.contains(e.target as Node) &&
        precioTriggerRef.current && !precioTriggerRef.current.contains(e.target as Node)
      ) setPrecioOpen(false);
    };
    if (precioOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [precioOpen]);

  // ── Operación handlers
  const handleOpenOperacion = () => {
    if (!operacionOpen) { setTempOperacion(operacion); setTempSelectedTypes({ ...selectedTypes }); }
    setOperacionOpen((p) => !p); setRoomsOpen(false); setFiltrosOpen(false); setPrecioOpen(false);
  };
  const handleApplyOperacion = () => {
    const newOp = tempOperacion;
    const newTypes = { ...tempSelectedTypes };
    setOperacion(newOp); setSelectedTypes(newTypes); setOperacionOpen(false);
    pushUrl(newOp, newTypes, rooms, masFiltros, precio, searchText);
  };
  const handleClearOperacion = () => { setTempOperacion(null); setTempSelectedTypes({}); };

  // ── Rooms handlers
  const handleOpenRooms = () => {
    if (!roomsOpen) setTempRooms({ ...rooms });
    setRoomsOpen((p) => !p); setOperacionOpen(false); setFiltrosOpen(false); setPrecioOpen(false);
  };
  const handleApplyRooms = () => {
    const newRooms = { ...tempRooms };
    setRooms(newRooms); setRoomsOpen(false);
    pushUrl(operacion, selectedTypes, newRooms, masFiltros, precio, searchText);
  };
  const handleClearRooms = () => setTempRooms(EMPTY_ROOMS);

  // ── Filtros handlers
  const handleOpenFiltros = () => {
    if (!filtrosOpen) {
      setTempMasFiltros({
        ...masFiltros,
        tipoAmbientes: { ...masFiltros.tipoAmbientes },
        orientation: { ...masFiltros.orientation },
        tags: [...masFiltros.tags],
        subtipos: { ...masFiltros.subtipos },
      });
    }
    setFiltrosOpen((p) => !p); setOperacionOpen(false); setRoomsOpen(false); setPrecioOpen(false);
  };
  const handleApplyFiltros = () => {
    const newRooms = { ...tempRooms };
    setRooms(newRooms);

    const newOp = tempOperacion;
    const newTypes = { ...tempSelectedTypes };
    setOperacion(newOp); setSelectedTypes(newTypes); 

    const newPrecio = JSON.parse(JSON.stringify(tempPrecio)) as PrecioFilterState;
    setPrecio(newPrecio);

    const newMasFiltros = { ...tempMasFiltros };
    setMasFiltros(newMasFiltros); setFiltrosOpen(false);

    pushUrl(newOp, newTypes, newRooms, newMasFiltros, newPrecio, searchText, );
  };
  const handleClearFiltros = () => setTempMasFiltros(EMPTY_MAS_FILTROS);

  const handleClearFiltrosMobile = () => {
    setTempMasFiltros(EMPTY_MAS_FILTROS);
    setTempOperacion(null);
    setTempSelectedTypes({});
    setTempRooms(EMPTY_ROOMS);
    setTempPrecio(EMPTY_PRECIO);
  };

  const updateSection = (
    section: keyof Pick<MasFiltrosState, 'tipoAmbientes' | 'orientation' | 'subtipos'>,
    key: string,
    checked: boolean,
  ) => setTempMasFiltros((prev) => ({ ...prev, [section]: { ...prev[section], [key]: checked } }));

  const handleToggleTag = (tagId: number, checked: boolean) => {
    setTempMasFiltros((prev) => {
      const exists = prev.tags.includes(tagId);
      if (checked && !exists) {
        return { ...prev, tags: [...prev.tags, tagId] };
      }
      if (!checked && exists) {
        return { ...prev, tags: prev.tags.filter((id) => id !== tagId) };
      }
      return prev;
    });
  };

  // ── Precio handlers
  const handleOpenPrecio = () => {
    if (!precioOpen) setTempPrecio(JSON.parse(JSON.stringify(precio)));
    setPrecioOpen((p) => !p);
    setOperacionOpen(false); setRoomsOpen(false); setFiltrosOpen(false);
  };

  const handleApplyPrecio = () => {
    const newPrecio = JSON.parse(JSON.stringify(tempPrecio)) as PrecioFilterState;
    setPrecio(newPrecio); setPrecioOpen(false);
    pushUrl(operacion, selectedTypes, rooms, masFiltros, newPrecio, searchText);
  };
  const handleClearPrecio = () => setTempPrecio(EMPTY_PRECIO);
  // ── Derived
  const filtrosBadge = countMasFiltros(masFiltros);
  const precioLabel = (() => {
    const { desde, hasta, moneda } = precio.precio;
    if (!desde && !hasta) return 'Precio';
    const fmt = (v: string) => {
      const n = Number(v);
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
      if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
      return v;
    };
    if (desde && hasta) return `${moneda} ${fmt(desde)} - ${fmt(hasta)}`;
    if (desde) return `${moneda} desde ${fmt(desde)}`;
    return `${moneda} hasta ${fmt(hasta)}`;
  })();

  const roomsLabel = (() => {
    const parts: string[] = [];
    if (rooms.ambientes) parts.push(`${rooms.ambientes === '4' ? '+4' : rooms.ambientes} amb`);
    if (rooms.dormitorios) parts.push(`${rooms.dormitorios === '4' ? '+4' : rooms.dormitorios} dorm`);
    return parts.length > 0 ? parts.join(' · ') : 'Amb / Dorm';
  })();

  const visibleTypes = showAllTypes
    ? Object.entries(PROPERTY_TYPE_LABELS)
    : Object.entries(PROPERTY_TYPE_LABELS).slice(0, OPERACION_COLLAPSED);
  const typeRows: (typeof visibleTypes)[] = [];
  for (let i = 0; i < visibleTypes.length; i += 2) typeRows.push(visibleTypes.slice(i, i + 2));
  // ── Render
  return (
    <div className="filter-bar">
      {isAlertModalOpen && (
        <CreateAlertModal filters={currentFilters} onClose={() => setIsAlertModalOpen(false)} />
      )}
      <div className="filter-bar-container">
        <div className="filter-group">

          {/* Location search */}
          <div className="filter-search">
            <LocationAutocompleteInput
              value={searchText}
              onChange={setSearchText}
              placeholder="Dirección, barrio, calle"
              onSubmit={(value, locationId) => pushUrl(operacion, selectedTypes, rooms, masFiltros, precio, value, locationId, locationId != null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  pushUrl(operacion, selectedTypes, rooms, masFiltros, precio, searchText, undefined, false);
                }
              }}
            />
          </div>

          {/* Operación popover */}
          <div className="filter-dropdown-wrapper">
            <button
              ref={operacionTriggerRef}
              className={`filter-dropdown${operacionOpen ? ' active' : ''}`}
              onClick={handleOpenOperacion}
              aria-haspopup="true"
              aria-expanded={operacionOpen}
            >
              <span>Operación</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`filter-dropdown-chevron${operacionOpen ? ' open' : ''}`}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {operacionOpen && (
              <div ref={operacionPopoverRef} className="operacion-popover">
                <div className="operacion-radio-group">
                  {FILTER_OPERATION_OPTIONS.map((op) => (
                    <RadioButton key={op} label={OPERATION_TYPE_LABELS[op]} name="operacion" value={String(op)} checked={tempOperacion === op} onChange={(val) => setTempOperacion(Number(val) as OperationType)} />
                  ))}
                </div>
                <TipoDePropiedadSection tempSelectedTypes={tempSelectedTypes} setTempSelectedTypes={setTempSelectedTypes} typeRows={typeRows} setShowAllTypes={setShowAllTypes} showAllTypes={showAllTypes} />
                <div className="operacion-footer">
                  <Button label="Limpiar filtros" variant="secondary" onClick={handleClearOperacion} fullWidth />
                  <Button label="Aplicar" variant="primary" onClick={handleApplyOperacion} fullWidth />
                </div>
              </div>
            )}
          </div>

          {/* Precio popover */}
          <div className="filter-dropdown-wrapper">
            <button
              ref={precioTriggerRef}
              className={`filter-dropdown${precioOpen ? ' active' : ''}`}
              onClick={handleOpenPrecio}
              aria-haspopup="true"
              aria-expanded={precioOpen}
            >
              <span>{precioLabel}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`filter-dropdown-chevron${precioOpen ? ' open' : ''}`}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {precioOpen && (
              <div ref={precioPopoverRef} className="precio-popover">
                <div className="precio-popover-body">
                  <PrecioSection tempPrecio={tempPrecio} setTempPrecio={setTempPrecio} histPrecio={histPrecio} histPrecioM2={histPrecioM2} maxPrice={maxPriceFromData} />
                </div>
                <div className="operacion-footer">
                  <Button label="Limpiar filtros" variant="secondary" onClick={handleClearPrecio} fullWidth />
                  <Button label="Aplicar" variant="primary" onClick={handleApplyPrecio} fullWidth />
                </div>
              </div>
            )}
          </div>

          {/* Rooms popover */}
          <div className="filter-dropdown-wrapper">
            <button
              ref={roomsTriggerRef}
              className={`filter-dropdown${roomsOpen ? ' active' : ''}`}
              onClick={handleOpenRooms}
              aria-haspopup="true"
              aria-expanded={roomsOpen}
            >
              <span>{roomsLabel}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`filter-dropdown-chevron${roomsOpen ? ' open' : ''}`}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {roomsOpen && (
              <div ref={roomsPopoverRef} className="rooms-popover">
                <RoomsSection tempRooms={tempRooms} setTempRooms={setTempRooms} />
                <div className="operacion-footer">
                  <Button label="Limpiar filtros" variant="secondary" onClick={handleClearRooms} fullWidth />
                  <Button label="Aplicar" variant="primary" onClick={handleApplyRooms} fullWidth />
                </div>
              </div>
            )}
          </div>

          {/* Filtros popover */}
          <div className="filter-dropdown-wrapper filtros-dropdown">
            <button
              ref={filtrosTriggerRef}
              className={`filter-button${filtrosOpen ? ' active' : ''}`}
              onClick={handleOpenFiltros}
              aria-haspopup="true"
              aria-expanded={filtrosOpen}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5h15M5 10h10M7.5 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Filtros</span>
              {filtrosBadge > 0 && <span className="filter-badge">{filtrosBadge}</span>}
            </button>

            {filtrosOpen && (
              <div ref={filtrosPopoverRef} className="filtros-popover">
                <div className="filtros-popover-body">
                  <div className="filtros-section operacion-section">
                    <h3 className="filtros-section-title">Tipo de operación</h3>
                    <div className="operacion-radio-group">
                      {FILTER_OPERATION_OPTIONS.map((op) => (
                        <RadioButton key={op} label={OPERATION_TYPE_LABELS[op]} name="operacion" value={String(op)} checked={tempOperacion === op} onChange={(val) => setTempOperacion(Number(val) as OperationType)} />
                      ))}
                    </div>
                  </div>

                  <div className="filtros-section precio-section">
                    <PrecioSection tempPrecio={tempPrecio} setTempPrecio={setTempPrecio} histPrecio={histPrecio} histPrecioM2={histPrecioM2} maxPrice={maxPriceFromData} />
                  </div>

                  <TipoDePropiedadSection tempSelectedTypes={tempSelectedTypes} setTempSelectedTypes={setTempSelectedTypes} typeRows={typeRows} setShowAllTypes={setShowAllTypes} showAllTypes={showAllTypes} />

                  <RoomsSection tempRooms={tempRooms} setTempRooms={setTempRooms} />                  

                  {/* Tipo de anunciante + Antigüedad */}
                  <div className="filtros-top-row">
                    <div className="filtros-anunciante">
                      <h3 className="filtros-section-title">Tipo de anunciante</h3>
                      <div className="filtros-anunciante-checks">
                        <Checkbox label="Inmobiliaria" checked={tempMasFiltros.inmobiliaria} onChange={(checked) => setTempMasFiltros((prev) => ({ ...prev, inmobiliaria: checked }))} />
                        <Checkbox label="Dueño directo" checked={tempMasFiltros.duenoDirecto} onChange={(checked) => setTempMasFiltros((prev) => ({ ...prev, duenoDirecto: checked }))} />
                      </div>
                    </div>
                    <div className="filtros-antiguedad">
                      <h3 className="filtros-section-title">Antigüedad</h3>
                      <Select options={ANTIGUEDAD_OPTIONS} value={tempMasFiltros.antiguedad} onChange={(val) => setTempMasFiltros((prev) => ({ ...prev, antiguedad: val }))} placeholder="Seleccionar" />
                    </div>
                  </div>
                 
                  {/* Disposición */}
                  <div className="filtros-section">
                    <h3 className="filtros-section-title">Disposición</h3>
                    <div className="filtros-section-grid">
                      {toPairs(orientationOptions).map((pair, i) => (
                        <div key={i} className="filtros-section-row">
                          <Checkbox
                            label={pair[0].label}
                            checked={!!tempMasFiltros.orientation[pair[0].value]}
                            onChange={(checked) => updateSection('orientation', pair[0].value, checked)}
                          />
                          {pair[1] && (
                            <Checkbox
                              label={pair[1].label}
                              checked={!!tempMasFiltros.orientation[pair[1].value]}
                              onChange={(checked) => updateSection('orientation', pair[1]!.value, checked)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {amenityGroups.map((group) => (
                    <CollapsibleTagGroupSection
                      key={group.type}
                      title={group.title}
                      options={group.options}
                      selectedTagIds={tempMasFiltros.tags}
                      onToggle={handleToggleTag}
                    />
                  ))}
                  <CollapsibleCheckboxSection title="Subtipo de propiedad" items={SUBTIPOS} values={tempMasFiltros.subtipos} onChange={(key, checked) => updateSection('subtipos', key, checked)} />

                </div>
                <div className="operacion-footer">
                  <div className="clear-filtros-desktop">
                    <Button label="Limpiar filtros" variant="secondary" onClick={handleClearFiltros} fullWidth  />
                  </div>
                  <div className="clear-filtros-mobile">
                    <Button label="Limpiar filtros" variant="secondary" onClick={handleClearFiltrosMobile} fullWidth />
                  </div>
                  <div className='aplicar-filtros-mas'>
                    <Button label="Aplicar" variant="primary" onClick={handleApplyFiltros} fullWidth />
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button id="list-map-view-mobile" label={viewMode === "list" ? "Lista" : "Mapa"} variant="secondary" onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}  icon={<img src={viewMode === "list" ? "/icons/list.svg" : "/icons/map.svg"} />} />
        </div>

        <Button label="Crear Alerta" variant="secondary" onClick={() => createAlert()} id="crear-alerta-button-desktop"  icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15.2783 2.21484C16.0322 2.11152 16.6207 2.51201 16.7803 3.23828V6.77051L17.5557 6.25684C17.8966 6.0311 18.3237 5.81495 18.7773 5.58496C19.1757 5.38298 19.5996 5.16504 19.9502 4.9375C20.1016 4.92637 20.1937 5.00206 20.2354 5.08301C20.261 5.13291 20.269 5.1866 20.2588 5.2373C20.2493 5.2846 20.2193 5.35182 20.1318 5.42383C19.817 5.68243 19.3689 5.91897 18.8525 6.17969C18.3887 6.41388 17.8652 6.67021 17.4424 6.96191C17.4129 6.96828 17.3866 6.97083 17.3623 6.9668L16.7803 6.87012V10.4502H20.3096C20.5448 10.5792 20.5057 10.9292 20.2002 10.9736C19.7381 11.0278 18.0412 11.0488 17.3203 10.9912L16.7803 10.9482V14.25H17.2568L19.9756 15.8164C20.077 15.938 20.0691 16.0639 20.0205 16.1514C19.9923 16.2021 19.9506 16.2403 19.9014 16.2607C19.8617 16.2772 19.8016 16.2864 19.7148 16.2686L17.5283 15.0166L16.7803 14.5869V17.668C16.7576 18.0099 16.51 18.3942 16.207 18.5625L16.2012 18.5664C15.9467 18.7127 15.7424 18.7604 15.5723 18.7627C15.3998 18.7649 15.2263 18.7211 15.0342 18.6318C14.8369 18.5401 14.6366 18.4087 14.4043 18.248C14.1824 18.0946 13.9244 17.9084 13.6543 17.749H13.6533C12.449 17.043 11.0734 16.4997 9.67871 16.248L8.81934 16.0928L9.12109 16.9121L10.3242 20.1875C10.4059 20.6303 10.296 20.9986 10.0781 21.2666C9.88044 21.5097 9.57453 21.6946 9.18457 21.7607L9.0127 21.7812C8.28311 21.8336 7.61747 21.7852 7.07031 21.5742C6.60686 21.3955 6.21343 21.0958 5.92969 20.5986L5.81543 20.373L5.56543 19.7881C5.32604 19.191 5.11383 18.5582 4.89746 17.9072C4.612 17.0484 4.3194 16.1554 3.95898 15.3213L3.89355 15.1709L3.75195 15.0879C2.88377 14.5814 2.32763 13.9551 2.24219 13.0225C2.31899 12.4122 2.29319 11.7002 2.25781 11.001C2.22019 10.2572 2.17295 9.51306 2.20117 8.80859C2.22944 8.10324 2.33253 7.49013 2.56738 7.00781C2.79115 6.54838 3.14019 6.19292 3.71191 5.98633C5.25191 5.58002 6.83486 5.36163 8.48047 5.03125C10.1074 4.7046 11.7481 4.27555 13.251 3.44824L13.252 3.44727C13.555 3.27952 14.0184 2.94221 14.3945 2.69141C14.5965 2.55676 14.7863 2.43696 14.9521 2.34863C15.1297 2.25407 15.2334 2.22113 15.2744 2.21582L15.2783 2.21484ZM5.23828 15.3691C5.18489 15.3772 5.1012 15.3979 5.01562 15.4561C4.92256 15.5193 4.85451 15.6086 4.81738 15.708C4.75544 15.8744 4.7946 16.0235 4.80762 16.0713L4.81641 16.1025L4.82812 16.1318C5.07612 16.73 5.29177 17.3547 5.5127 17.9961C5.67708 18.4734 5.84409 18.9604 6.02832 19.4385L6.21875 19.9131C6.34426 20.2142 6.49158 20.532 6.74414 20.7754C7.01493 21.0362 7.3552 21.1657 7.77539 21.2148V21.2158C7.77795 21.2162 7.78055 21.2165 7.7832 21.2168V21.2158C7.93121 21.2343 8.22436 21.2494 8.49512 21.252C8.63624 21.2533 8.78278 21.2516 8.91016 21.2441C8.99981 21.2389 9.13307 21.2265 9.25 21.1934L9.25098 21.1953C9.25912 21.1933 9.26714 21.189 9.27539 21.1865C9.28451 21.1836 9.29393 21.182 9.30273 21.1787L9.30176 21.1768C9.59433 21.0771 9.93002 20.7452 9.78809 20.2832L9.78418 20.2695L9.77832 20.2559L8.25879 16.166L8.14746 15.8662L7.8291 15.8418L7.57227 15.8105C7.30883 15.7692 7.02538 15.6987 6.71484 15.6201C6.32076 15.5204 5.8752 15.4051 5.4502 15.3711L5.42969 15.3701H5.4248C5.43657 15.3707 5.4403 15.3719 5.41699 15.3691C5.41051 15.3683 5.32767 15.3557 5.23828 15.3691ZM15.7217 2.75684C15.5622 2.72083 15.4091 2.74318 15.2842 2.77832L15.2734 2.78223L15.2617 2.78516C15.1928 2.80814 15.1373 2.84188 15.1123 2.85742C15.08 2.87751 15.0488 2.90002 15.0215 2.91992C14.967 2.95972 14.9063 3.00754 14.8535 3.0498C14.7972 3.09486 14.7485 3.13447 14.7041 3.16895C14.6581 3.20464 14.6386 3.21704 14.6377 3.21777L14.6299 3.22266L14.6221 3.22852C13.3066 4.0656 12.0708 4.6709 10.6201 5.08691L9.9834 5.25391C9.06988 5.47374 8.0698 5.62977 7.0459 5.80273C6.03315 5.97382 4.99965 6.16143 4.06641 6.44141H4.06445C3.28717 6.67749 2.86012 7.29584 2.78223 8.04883L2.77832 8.08984L2.78125 8.13184C2.82935 8.87742 2.80018 9.65901 2.77246 10.4717C2.7451 11.2739 2.71873 12.1069 2.78125 12.9092V12.9102C2.82357 13.4301 2.99199 13.8382 3.33398 14.1348C3.64648 14.4057 4.05259 14.5338 4.43262 14.6338H4.43555C5.3475 14.8681 6.21797 15.0387 7.05469 15.1934C7.89605 15.3488 8.69385 15.4866 9.48633 15.6582C11.0552 15.9979 12.5656 16.4636 14.1562 17.4189H14.1572C14.2603 17.486 14.4587 17.6355 14.7354 17.8242C14.8581 17.908 14.9901 17.9941 15.1045 18.0596C15.1606 18.0917 15.224 18.1261 15.2871 18.1523C15.3186 18.1655 15.3603 18.1808 15.4072 18.1924C15.4435 18.2013 15.5158 18.2144 15.6045 18.2061L15.6055 18.208C15.614 18.2072 15.6225 18.2061 15.6309 18.2051L15.6299 18.2041C16.0366 18.1533 16.1934 17.7875 16.2266 17.7129L16.2695 17.6162L16.2705 17.5107L16.2998 3.64062V3.62109L16.2988 3.60156C16.2936 3.53338 16.2853 3.44416 16.2666 3.35547C16.2484 3.26931 16.2129 3.14487 16.1299 3.02832C16.0368 2.8977 15.898 2.7967 15.7217 2.75684Z" stroke="#006AFF"/>
          </svg>}
        />
        <Button label="" variant="secondary" onClick={() => createAlert()} id="crear-alerta-button-mobile"  icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15.2783 2.21484C16.0322 2.11152 16.6207 2.51201 16.7803 3.23828V6.77051L17.5557 6.25684C17.8966 6.0311 18.3237 5.81495 18.7773 5.58496C19.1757 5.38298 19.5996 5.16504 19.9502 4.9375C20.1016 4.92637 20.1937 5.00206 20.2354 5.08301C20.261 5.13291 20.269 5.1866 20.2588 5.2373C20.2493 5.2846 20.2193 5.35182 20.1318 5.42383C19.817 5.68243 19.3689 5.91897 18.8525 6.17969C18.3887 6.41388 17.8652 6.67021 17.4424 6.96191C17.4129 6.96828 17.3866 6.97083 17.3623 6.9668L16.7803 6.87012V10.4502H20.3096C20.5448 10.5792 20.5057 10.9292 20.2002 10.9736C19.7381 11.0278 18.0412 11.0488 17.3203 10.9912L16.7803 10.9482V14.25H17.2568L19.9756 15.8164C20.077 15.938 20.0691 16.0639 20.0205 16.1514C19.9923 16.2021 19.9506 16.2403 19.9014 16.2607C19.8617 16.2772 19.8016 16.2864 19.7148 16.2686L17.5283 15.0166L16.7803 14.5869V17.668C16.7576 18.0099 16.51 18.3942 16.207 18.5625L16.2012 18.5664C15.9467 18.7127 15.7424 18.7604 15.5723 18.7627C15.3998 18.7649 15.2263 18.7211 15.0342 18.6318C14.8369 18.5401 14.6366 18.4087 14.4043 18.248C14.1824 18.0946 13.9244 17.9084 13.6543 17.749H13.6533C12.449 17.043 11.0734 16.4997 9.67871 16.248L8.81934 16.0928L9.12109 16.9121L10.3242 20.1875C10.4059 20.6303 10.296 20.9986 10.0781 21.2666C9.88044 21.5097 9.57453 21.6946 9.18457 21.7607L9.0127 21.7812C8.28311 21.8336 7.61747 21.7852 7.07031 21.5742C6.60686 21.3955 6.21343 21.0958 5.92969 20.5986L5.81543 20.373L5.56543 19.7881C5.32604 19.191 5.11383 18.5582 4.89746 17.9072C4.612 17.0484 4.3194 16.1554 3.95898 15.3213L3.89355 15.1709L3.75195 15.0879C2.88377 14.5814 2.32763 13.9551 2.24219 13.0225C2.31899 12.4122 2.29319 11.7002 2.25781 11.001C2.22019 10.2572 2.17295 9.51306 2.20117 8.80859C2.22944 8.10324 2.33253 7.49013 2.56738 7.00781C2.79115 6.54838 3.14019 6.19292 3.71191 5.98633C5.25191 5.58002 6.83486 5.36163 8.48047 5.03125C10.1074 4.7046 11.7481 4.27555 13.251 3.44824L13.252 3.44727C13.555 3.27952 14.0184 2.94221 14.3945 2.69141C14.5965 2.55676 14.7863 2.43696 14.9521 2.34863C15.1297 2.25407 15.2334 2.22113 15.2744 2.21582L15.2783 2.21484ZM5.23828 15.3691C5.18489 15.3772 5.1012 15.3979 5.01562 15.4561C4.92256 15.5193 4.85451 15.6086 4.81738 15.708C4.75544 15.8744 4.7946 16.0235 4.80762 16.0713L4.81641 16.1025L4.82812 16.1318C5.07612 16.73 5.29177 17.3547 5.5127 17.9961C5.67708 18.4734 5.84409 18.9604 6.02832 19.4385L6.21875 19.9131C6.34426 20.2142 6.49158 20.532 6.74414 20.7754C7.01493 21.0362 7.3552 21.1657 7.77539 21.2148V21.2158C7.77795 21.2162 7.78055 21.2165 7.7832 21.2168V21.2158C7.93121 21.2343 8.22436 21.2494 8.49512 21.252C8.63624 21.2533 8.78278 21.2516 8.91016 21.2441C8.99981 21.2389 9.13307 21.2265 9.25 21.1934L9.25098 21.1953C9.25912 21.1933 9.26714 21.189 9.27539 21.1865C9.28451 21.1836 9.29393 21.182 9.30273 21.1787L9.30176 21.1768C9.59433 21.0771 9.93002 20.7452 9.78809 20.2832L9.78418 20.2695L9.77832 20.2559L8.25879 16.166L8.14746 15.8662L7.8291 15.8418L7.57227 15.8105C7.30883 15.7692 7.02538 15.6987 6.71484 15.6201C6.32076 15.5204 5.8752 15.4051 5.4502 15.3711L5.42969 15.3701H5.4248C5.43657 15.3707 5.4403 15.3719 5.41699 15.3691C5.41051 15.3683 5.32767 15.3557 5.23828 15.3691ZM15.7217 2.75684C15.5622 2.72083 15.4091 2.74318 15.2842 2.77832L15.2734 2.78223L15.2617 2.78516C15.1928 2.80814 15.1373 2.84188 15.1123 2.85742C15.08 2.87751 15.0488 2.90002 15.0215 2.91992C14.967 2.95972 14.9063 3.00754 14.8535 3.0498C14.7972 3.09486 14.7485 3.13447 14.7041 3.16895C14.6581 3.20464 14.6386 3.21704 14.6377 3.21777L14.6299 3.22266L14.6221 3.22852C13.3066 4.0656 12.0708 4.6709 10.6201 5.08691L9.9834 5.25391C9.06988 5.47374 8.0698 5.62977 7.0459 5.80273C6.03315 5.97382 4.99965 6.16143 4.06641 6.44141H4.06445C3.28717 6.67749 2.86012 7.29584 2.78223 8.04883L2.77832 8.08984L2.78125 8.13184C2.82935 8.87742 2.80018 9.65901 2.77246 10.4717C2.7451 11.2739 2.71873 12.1069 2.78125 12.9092V12.9102C2.82357 13.4301 2.99199 13.8382 3.33398 14.1348C3.64648 14.4057 4.05259 14.5338 4.43262 14.6338H4.43555C5.3475 14.8681 6.21797 15.0387 7.05469 15.1934C7.89605 15.3488 8.69385 15.4866 9.48633 15.6582C11.0552 15.9979 12.5656 16.4636 14.1562 17.4189H14.1572C14.2603 17.486 14.4587 17.6355 14.7354 17.8242C14.8581 17.908 14.9901 17.9941 15.1045 18.0596C15.1606 18.0917 15.224 18.1261 15.2871 18.1523C15.3186 18.1655 15.3603 18.1808 15.4072 18.1924C15.4435 18.2013 15.5158 18.2144 15.6045 18.2061L15.6055 18.208C15.614 18.2072 15.6225 18.2061 15.6309 18.2051L15.6299 18.2041C16.0366 18.1533 16.1934 17.7875 16.2266 17.7129L16.2695 17.6162L16.2705 17.5107L16.2998 3.64062V3.62109L16.2988 3.60156C16.2936 3.53338 16.2853 3.44416 16.2666 3.35547C16.2484 3.26931 16.2129 3.14487 16.1299 3.02832C16.0368 2.8977 15.898 2.7967 15.7217 2.75684Z" stroke="#006AFF"/>
          </svg>}
        />
      </div>
    </div>
  );
}

