'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RadioButton from '@/ui/RadioButton/RadioButton';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Button from '@/ui/Button/Button';
import Select from '@/ui/Select/Select';
import { PROPERTY_TYPE_LABELS } from '@/types/propiedad';

// ─── Constants ────────────────────────────────────────────────────────────────

const OPERACION_COLLAPSED = 8;

type OperationType = 'Alquiler' | 'Comprar' | 'Temporal';

const QUANTITY_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '+4' },
];

const ANTIGUEDAD_OPTIONS = [
  { value: 'estrenar', label: 'A estrenar' },
  { value: '1-5', label: '1-5 años' },
  { value: '5-10', label: '5-10 años' },
  { value: '10-20', label: '10-20 años' },
  { value: '20+', label: 'Más de 20 años' },
];

const TIPO_AMBIENTES = [
  'Living comedor', 'Cocina', 'Balcón', 'Lavadero', 'Toilette', 'Vestidor',
  'Dormitorio en suite', 'Jardín', 'Patio', 'Terraza', 'Dependencia servicio',
];

const DISPOSICION = ['Contrafrente', 'Interior', 'Frente', 'Lateral'];

const AMENITIES = [
  'Pileta', 'Parrilla', 'Encargado/vigilancia', 'Ascensor', 'SUM', 'Laundry',
  'Sauna', 'Gimnasio', 'Quincho', 'Sala de juegos', 'Cancha de deportes',
  'Solárium', 'Aire acondicionado',
];

const CARACTERISTICAS = [
  'Apto crédito', 'Apto profesional', 'Movilidad reducida', 'Luminoso',
  'Uso comercial', 'Permite mascotas', 'Cocina equipada', 'Amoblado', 'Ofrece financiación',
];

const SUBTIPOS = [
  'Estándar', 'Semipiso', 'Piso', 'Dúplex', 'Monoambiente',
  'Aparestudio', 'Loft', 'Penthouse', 'Triplex',
];

const SERVICIOS = ['Luz', 'Agua corriente', 'Gas natural', 'Calefacción', 'Internet / Wifi'];

// Mock histogram bar heights (px, max = 56) for price distribution visualization
const HIST_PRECIO = [12, 34, 45, 28, 20, 38, 56, 52, 44, 30, 18, 25, 40, 56, 48, 36, 22, 13, 19, 30, 42, 55, 50, 44, 35, 26, 15, 10, 18, 30, 45, 56, 52, 44, 34, 22, 14, 22, 38, 50, 56, 48, 43, 35, 26, 18, 13, 20, 30, 44, 52, 56, 43, 30, 18, 21, 23, 33, 15];
const HIST_PRECIO_M2 = [43, 56, 52, 44, 30, 13, 21, 23, 33, 18, 15, 43, 56, 52, 44, 30, 13, 21, 23, 33, 18, 15, 34, 56, 52, 44, 34, 56, 52, 44, 34, 56, 52, 44, 43, 56, 52, 44, 30, 13, 21, 23, 33, 18, 15, 43, 56, 52, 44, 30, 13, 21, 23, 33, 18, 15];

const PRECIO_USD_MAX = 2_000_000;
const PRECIO_ARS_MAX = 500_000_000;

const SUPERFICIE_OPTIONS = [
  { value: '20', label: '20' }, { value: '30', label: '30' }, { value: '40', label: '40' },
  { value: '50', label: '50' }, { value: '60', label: '60' }, { value: '70', label: '70' },
  { value: '80', label: '80' }, { value: '100', label: '100' }, { value: '120', label: '120' },
  { value: '150', label: '150' }, { value: '200', label: '200' }, { value: '300', label: '300' },
  { value: '500', label: '500' }, { value: '1000', label: '1000' },
];

const UNIDAD_OPTIONS = [
  { value: 'm2', label: 'm²' },
  { value: 'ha', label: 'ha' },
];

// ─── URL Param Helpers ──────────────────────────────────────────────────────────────

const OPERACION_TO_OP_TYPE: Record<string, string> = {
  Comprar: '1', Alquiler: '2', Temporal: '3',
};
const OP_TYPE_TO_OPERACION: Record<string, string> = {
  '1': 'Comprar', '2': 'Alquiler', '3': 'Temporal',
};
const DISPOSICION_TO_ID: Record<string, string> = {
  Contrafrente: '1', Interior: '2', Frente: '3', Lateral: '4',
};
const ID_TO_DISPOSICION: Record<string, string> = {
  '1': 'Contrafrente', '2': 'Interior', '3': 'Frente', '4': 'Lateral',
};
const ANTIGUEDAD_TO_RANGE: Record<string, [number, number?]> = {
  estrenar: [0, 0], '1-5': [1, 5], '5-10': [5, 10], '10-20': [10, 20], '20+': [20, undefined],
};

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
  disposicion: Record<string, boolean>;
  amenities: Record<string, boolean>;
  caracteristicas: Record<string, boolean>;
  subtipos: Record<string, boolean>;
  servicios: Record<string, boolean>;
}

const EMPTY_ROOMS: RoomsState = { ambientes: '', dormitorios: '', banos: '', cocheras: '' };

const EMPTY_MAS_FILTROS: MasFiltrosState = {
  inmobiliaria: false,
  duenoDirecto: false,
  antiguedad: '',
  tipoAmbientes: {},
  disposicion: {},
  amenities: {},
  caracteristicas: {},
  subtipos: {},
  servicios: {},
};

interface PrecioSectionState { moneda: 'ARS' | 'USD'; desde: string; hasta: string; }
interface SuperficieFilter { tipo: 'Cubierta' | 'Total'; unidad: string; desde: string; hasta: string; }
interface PrecioFilterState {
  precio: PrecioSectionState;
  precioM2: PrecioSectionState;
  superficie: SuperficieFilter;
}

const EMPTY_PRECIO: PrecioFilterState = {
  precio: { moneda: 'USD', desde: '', hasta: '' },
  precioM2: { moneda: 'USD', desde: '', hasta: '' },
  superficie: { tipo: 'Total', unidad: 'm2', desde: '', hasta: '' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countMasFiltros(f: MasFiltrosState): number {
  return (
    (f.inmobiliaria ? 1 : 0) +
    (f.duenoDirecto ? 1 : 0) +
    (f.antiguedad ? 1 : 0) +
    Object.values(f.tipoAmbientes).filter(Boolean).length +
    Object.values(f.disposicion).filter(Boolean).length +
    Object.values(f.amenities).filter(Boolean).length +
    Object.values(f.caracteristicas).filter(Boolean).length +
    Object.values(f.subtipos).filter(Boolean).length +
    Object.values(f.servicios).filter(Boolean).length
  );
}

function toPairs<T>(arr: T[]): [T, T | undefined][] {
  const pairs: [T, T | undefined][] = [];
  for (let i = 0; i < arr.length; i += 2) pairs.push([arr[i], arr[i + 1]]);
  return pairs;
}

/** Build URLSearchParams from the full applied filter state. */
function buildFilterParams(
  operacion: OperationType,
  selectedTypes: Record<string, boolean>,
  rooms: RoomsState,
  masFiltros: MasFiltrosState,
  precio: PrecioFilterState,
  searchText: string,
): URLSearchParams {
  const p = new URLSearchParams();
  p.set('operation_type', OPERACION_TO_OP_TYPE[operacion]);
  p.set('currency', precio.precio.moneda);
  p.set('status', '1');
  p.set('page', '1');
  p.set('limit', '20');

  const types = Object.entries(selectedTypes).filter(([, v]) => v).map(([k]) => k).join(',');
  if (types) p.set('property_type', types);

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

  if (masFiltros.antiguedad) {
    const range = ANTIGUEDAD_TO_RANGE[masFiltros.antiguedad];
    if (range) {
      p.set('age_min', String(range[0]));
      if (range[1] !== undefined) p.set('age_max', String(range[1]));
    }
  }

  const disp = Object.entries(masFiltros.disposicion)
    .filter(([, v]) => v)
    .map(([k]) => DISPOSICION_TO_ID[k])
    .filter(Boolean)
    .join(',');
  if (disp) p.set('disposition', disp);

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
  const operacion = ((OP_TYPE_TO_OPERACION[opType] ?? 'Alquiler') as OperationType);

  const selectedTypes: Record<string, boolean> = {};
  const ptParam = get('property_type');
  if (ptParam) ptParam.split(',').forEach((id) => { selectedTypes[id.trim()] = true; });

  const rooms: RoomsState = {
    ambientes: get('room_amount'),
    dormitorios: get('suite_amount'),
    banos: get('bathroom_amount'),
    cocheras: get('parking_lot_amount'),
  };

  const currency = (get('currency') || 'USD') as 'ARS' | 'USD';
  const superficieTipo: 'Cubierta' | 'Total' =
    sp.get('roofed_surface_min') || sp.get('roofed_surface_max') ? 'Cubierta' : 'Total';
  const precio: PrecioFilterState = {
    precio: { moneda: currency, desde: get('price_min'), hasta: get('price_max') },
    precioM2: { moneda: currency, desde: get('price_m2_min'), hasta: get('price_m2_max') },
    superficie: {
      tipo: superficieTipo, unidad: 'm2',
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

  const dispParam = get('disposition');
  const disposicion: Record<string, boolean> = {};
  if (dispParam) dispParam.split(',').forEach((id) => {
    const label = ID_TO_DISPOSICION[id.trim()];
    if (label) disposicion[label] = true;
  });

  return {
    operacion, selectedTypes, rooms,
    masFiltros: { ...EMPTY_MAS_FILTROS, antiguedad, disposicion },
    precio, searchText: get('q'),
  };
}

// ─── PriceRangeSlider ─────────────────────────────────────────────────────────

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
  const fromVal = desde === '' ? min : Math.max(min, Math.min(Number(desde), max));
  const toVal = hasta === '' ? max : Math.max(min, Math.min(Number(hasta), max));
  const fromPct = ((fromVal - min) / (max - min)) * 100;
  const toPct = ((toVal - min) / (max - min)) * 100;
  const fillLeft = Math.min(fromPct, toPct);
  const fillRight = 100 - Math.max(fromPct, toPct);

  return (
    <div className="precio-slider-wrapper">
      <div className="precio-histogram">
        {histBars.map((h, i) => {
          const barPct = (i / (histBars.length - 1)) * 100;
          const inRange = barPct >= fillLeft && barPct <= (100 - fillRight);
          return (
            <div
              key={i}
              className="precio-histogram-bar"
              style={{ height: `${h}px`, background: inRange ? '#006AFF' : '#EBF2FD' }}
            />
          );
        })}
      </div>
      <div className="precio-range-container">
        <div className="precio-range-track-bg" />
        <div className="precio-range-track-fill" style={{ left: `${fillLeft}%`, right: `${fillRight}%` }} />
        <input
          type="range" min="0" max="100" step="0.5"
          value={fromPct}
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
          value={toPct}
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
          value={desde}
          onChange={(e) => onDesdeChange(e.target.value.replace(/\D/g, ''))}
          placeholder="Desde"
          className="precio-input-field"
        />
        <span className="precio-input-separator">-</span>
        <input
          type="text"
          inputMode="numeric"
          value={hasta}
          onChange={(e) => onHastaChange(e.target.value.replace(/\D/g, ''))}
          placeholder="Hasta"
          className="precio-input-field"
        />
      </div>
    </div>
  );
}

function PrecioSectionBlock({
  title, radioName, histBars, state, onChange,
}: {
  title: string;
  radioName: string;
  histBars: number[];
  state: PrecioSectionState;
  onChange: (patch: Partial<PrecioSectionState>) => void;
}) {
  const priceMax = state.moneda === 'USD' ? PRECIO_USD_MAX : PRECIO_ARS_MAX;
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
        onDesdeChange={(v) => onChange({ desde: v })}
        onHastaChange={(v) => onChange({ hasta: v })}
      />
    </div>
  );
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

// ─── FilterBar ────────────────────────────────────────────────────────────────

export default function FilterBar() {
  // ── Router & search params
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Applied state
  const [operacion, setOperacion] = useState<OperationType>('Alquiler');
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
  const [tempOperacion, setTempOperacion] = useState<OperationType>('Alquiler');
  const [tempSelectedTypes, setTempSelectedTypes] = useState<Record<string, boolean>>({});
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [tempRooms, setTempRooms] = useState<RoomsState>(EMPTY_ROOMS);
  const [tempMasFiltros, setTempMasFiltros] = useState<MasFiltrosState>(EMPTY_MAS_FILTROS);
  const [tempPrecio, setTempPrecio] = useState<PrecioFilterState>(EMPTY_PRECIO);

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
    newOperacion: OperationType,
    newSelectedTypes: Record<string, boolean>,
    newRooms: RoomsState,
    newMasFiltros: MasFiltrosState,
    newPrecio: PrecioFilterState,
    newSearchText: string,
  ) => {
    const params = buildFilterParams(newOperacion, newSelectedTypes, newRooms, newMasFiltros, newPrecio, newSearchText);
    router.push(`/results?${params.toString()}`, { scroll: false });
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
  const handleClearOperacion = () => { setTempOperacion('Alquiler'); setTempSelectedTypes({}); };

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
        disposicion: { ...masFiltros.disposicion },
        amenities: { ...masFiltros.amenities },
        caracteristicas: { ...masFiltros.caracteristicas },
        subtipos: { ...masFiltros.subtipos },
        servicios: { ...masFiltros.servicios },
      });
    }
    setFiltrosOpen((p) => !p); setOperacionOpen(false); setRoomsOpen(false); setPrecioOpen(false);
  };
  const handleApplyFiltros = () => {
    const newMasFiltros = { ...tempMasFiltros };
    setMasFiltros(newMasFiltros); setFiltrosOpen(false);
    pushUrl(operacion, selectedTypes, rooms, newMasFiltros, precio, searchText);
  };
  const handleClearFiltros = () => setTempMasFiltros(EMPTY_MAS_FILTROS);

  const updateSection = (
    section: keyof Pick<MasFiltrosState, 'tipoAmbientes' | 'disposicion' | 'amenities' | 'caracteristicas' | 'subtipos' | 'servicios'>,
    key: string,
    checked: boolean,
  ) => setTempMasFiltros((prev) => ({ ...prev, [section]: { ...prev[section], [key]: checked } }));

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
      <div className="filter-bar-container">
        <div className="filter-group">

          {/* Location search */}
          <div className="filter-search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Dirección, barrio, c..."
              className="filter-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  pushUrl(operacion, selectedTypes, rooms, masFiltros, precio, searchText);
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
                  {(['Alquiler', 'Comprar', 'Temporal'] as OperationType[]).map((op) => (
                    <RadioButton key={op} label={op} name="operacion" value={op} checked={tempOperacion === op} onChange={(val) => setTempOperacion(val as OperationType)} />
                  ))}
                </div>
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
                  <PrecioSectionBlock
                    title="Precio"
                    radioName="precio-moneda"
                    histBars={HIST_PRECIO}
                    state={tempPrecio.precio}
                    onChange={(patch) => setTempPrecio((prev) => ({ ...prev, precio: { ...prev.precio, ...patch } }))}
                  />
                  <PrecioSectionBlock
                    title="Precio m²"
                    radioName="preciom2-moneda"
                    histBars={HIST_PRECIO_M2}
                    state={tempPrecio.precioM2}
                    onChange={(patch) => setTempPrecio((prev) => ({ ...prev, precioM2: { ...prev.precioM2, ...patch } }))}
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
                      <Select
                        options={UNIDAD_OPTIONS}
                        value={tempPrecio.superficie.unidad}
                        onChange={(v) => setTempPrecio((prev) => ({ ...prev, superficie: { ...prev.superficie, unidad: v } }))}
                        placeholder="m²"
                      />
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
                <div className="operacion-footer">
                  <Button label="Limpiar filtros" variant="secondary" onClick={handleClearRooms} fullWidth />
                  <Button label="Aplicar" variant="primary" onClick={handleApplyRooms} fullWidth />
                </div>
              </div>
            )}
          </div>

          {/* Filtros popover */}
          <div className="filter-dropdown-wrapper">
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

                  <CollapsibleCheckboxSection title="Tipo de ambientes" items={TIPO_AMBIENTES} values={tempMasFiltros.tipoAmbientes} onChange={(key, checked) => updateSection('tipoAmbientes', key, checked)} />

                  {/* Disposición — only 4 items, no collapse */}
                  <div className="filtros-section">
                    <h3 className="filtros-section-title">Disposición</h3>
                    <div className="filtros-section-grid">
                      {toPairs(DISPOSICION).map((pair, i) => (
                        <div key={i} className="filtros-section-row">
                          <Checkbox label={pair[0]} checked={!!tempMasFiltros.disposicion[pair[0]]} onChange={(checked) => updateSection('disposicion', pair[0], checked)} />
                          {pair[1] && <Checkbox label={pair[1]} checked={!!tempMasFiltros.disposicion[pair[1]]} onChange={(checked) => updateSection('disposicion', pair[1]!, checked)} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <CollapsibleCheckboxSection title="Comodidades / amenities" items={AMENITIES} values={tempMasFiltros.amenities} onChange={(key, checked) => updateSection('amenities', key, checked)} />
                  <CollapsibleCheckboxSection title="Características de la propiedad" items={CARACTERISTICAS} values={tempMasFiltros.caracteristicas} onChange={(key, checked) => updateSection('caracteristicas', key, checked)} />
                  <CollapsibleCheckboxSection title="Subtipo de propiedad" items={SUBTIPOS} values={tempMasFiltros.subtipos} onChange={(key, checked) => updateSection('subtipos', key, checked)} />
                  <CollapsibleCheckboxSection title="Servicios" items={SERVICIOS} values={tempMasFiltros.servicios} onChange={(key, checked) => updateSection('servicios', key, checked)} collapsedCount={5} />

                </div>
                <div className="operacion-footer">
                  <Button label="Limpiar filtros" variant="secondary" onClick={handleClearFiltros} fullWidth />
                  <Button label="Aplicar" variant="primary" onClick={handleApplyFiltros} fullWidth />
                </div>
              </div>
            )}
          </div>

        </div>

        <button className="create-alert-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z" stroke="currentColor" strokeWidth="2" />
            <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Crear Alerta
        </button>
      </div>
    </div>
  );
}

