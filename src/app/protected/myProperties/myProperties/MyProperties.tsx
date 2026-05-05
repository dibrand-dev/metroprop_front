'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Checkbox from '@/ui/Checkbox/Checkbox';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import type { CreateProperty } from '@/types/propiedad';
import Paginator from '@/components/Paginator/Paginator';
import { API_BASE_URL } from '@/utils/utils';
import './MyProperties.scss';
import PropertyCardMyProperties from './PropertyCardMyProperties';

/* ── Status / Plan maps ─────────────────────────────────────────────── */
const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: 'Activo',     cls: 'active'   },
  2: { label: 'Reservado',  cls: 'reserved' },
  3: { label: 'Archivado',  cls: 'inactive' },
  4: { label: 'Borrador',   cls: 'inactive' },
  5: { label: 'Finalizado', cls: 'inactive' },
};

const PLAN_MAP: Record<number, string> = {
  1: 'Simple',
  2: 'Destacado',
  3: 'Premium',
};

/* ── Filter data ────────────────────────────────────────────────────── */
const FILTER_GROUPS = [
  {
    key: 'estado',
    title: 'Estado del aviso',
    options: [
      { label: 'Finalizado', count: 9147 },
      { label: 'Activo', count: 200 },
      { label: 'Reservado', count: 200 },
      { label: 'Borrador', count: 74 },
      { label: 'Archivado', count: 74 },
    ],
    expandable: false,
  },
  {
    key: 'plan',
    title: 'Tipo de plan',
    options: [
      { label: 'Simple', count: 97 },
      { label: 'Destacado', count: 47 },
      { label: 'Premium', count: 20 },
    ],
    expandable: false,
  },
  {
    key: 'inmueble',
    title: 'Tipo de inmueble',
    options: [
      { label: 'Casa', count: 9147 },
      { label: 'Departamento', count: 200 },
      { label: 'PH', count: 20 },
      { label: 'Terrenos', count: 60 },
      { label: 'Local comercial', count: 94 },
    ],
    expandable: true,
  },
  {
    key: 'operacion',
    title: 'Tipo de operación',
    options: [
      { label: 'Venta', count: 9147 },
      { label: 'Alquiler', count: 200 },
      { label: 'Temporal', count: 74 },
      { label: 'Emprendimientos', count: 74 },
    ],
    expandable: false,
  },
  {
    key: 'responsable',
    title: 'Responsable del aviso',
    options: [
      { label: 'Leandro Borges Do Canto', count: 9147 },
      { label: 'Guillermo Borges Do Canto', count: 200 },
      { label: 'Santiago Borges Do Canto', count: 74 },
    ],
    expandable: false,
  },
  {
    key: 'ubicacion',
    title: 'Ubicación',
    options: [
      { label: 'GBA sur', count: 9147 },
      { label: 'GBA norte', count: 200 },
      { label: 'Capital Federal', count: 74 },
      { label: 'Córdoba', count: 60 },
      { label: 'Mendoza', count: 84 },
    ],
    expandable: true,
  },
];

/* ── Donut chart ────────────────────────────────────────────────────── */
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart({ percent }: { percent: number }) {
  const filled = (percent / 100) * CIRCUMFERENCE;
  return (
    <div className="myprop-donut">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle className="donut-track" cx="26" cy="26" r={RADIUS} />
        <circle
          className="donut-fill"
          cx="26"
          cy="26"
          r={RADIUS}
          strokeDasharray={`${filled} ${CIRCUMFERENCE - filled}`}
          strokeDashoffset="0"
        />
      </svg>
      <div className="myprop-donut-text">{percent}%</div>
    </div>
  );
}

const LIMIT = 20;

/* ── Main component ─────────────────────────────────────────────────── */
const MyProperties = () => {
  const { data: sessionData } = useSession();
  const apiToken = sessionData?.user?.apiToken as string | undefined;
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['my-properties', currentPage, searchId, apiToken],
    queryFn: async () => {
      if (searchId !== null) {
        const res = await fetch(`${API_BASE_URL}/properties/my-properties?property_id=${searchId}`, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        });
        if (!res.ok) return { data: [], total: 0, page: 1, limit: 1 };
        const property: CreateProperty = await res.json();
        return { data: [property], total: 1, page: 1, limit: 1 };
      } else {
        const params: Record<string, string | number | boolean | undefined> = { order_by: 'created_at:desc', page: currentPage, limit: LIMIT };
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            qs.set(key, String(value));
          }
        });
        const res = await fetch(`${API_BASE_URL}/properties/my-properties?${qs.toString()}`, {
          headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
        });
        if (!res.ok) return { data: [], total: 0, page: 1, limit: 1 };
        const properties = await res.json();
        return { data: properties, total: properties.total, page: 1, limit: properties.length };
      }
      // return fetchProperties({ order_by: 'created_at:desc', page: currentPage, limit: LIMIT }, apiToken);
    },
    staleTime: 5 * 60 * 1000,
  });
  const properties: CreateProperty[] = propertiesData?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((propertiesData?.total ?? 0) / LIMIT));

  const handleSearchById = () => {
    const trimmed = searchQuery.trim();
    const num = Number(trimmed);
    if (trimmed && !Number.isNaN(num) && num > 0) {
      setSearchId(num);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() === '') {
      setSearchId(null);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchById();
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectedIds(new Set());
    setAllSelected(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFilter = (groupKey: string, label: string) => {
    setActiveFilters((prev) =>
      prev[groupKey] === label ? { ...prev, [groupKey]: '' } : { ...prev, [groupKey]: label }
    );
  };

  const toggleExpand = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      setAllSelected(false);
    } else {
      setSelectedIds(new Set(properties.map((_, i) => i)));
      setAllSelected(true);
    }
  };

  const toggleSelect = (idx: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="myprop-wrapper">
      {/* ── Filters ── */}
      <aside className="myprop-filters">
        <h2 className="myprop-filters-title">Filtros</h2>

        {FILTER_GROUPS.map((group) => {
          const isExpanded = expandedGroups[group.key];
          const shown = group.expandable && !isExpanded
            ? group.options.slice(0, 3)
            : group.options;

          return (
            <div key={group.key} className="myprop-filter-group">
              <p className="myprop-filter-group-title">{group.title}</p>
              {shown.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`myprop-filter-link ${activeFilters[group.key] === opt.label ? 'active' : ''}`}
                  onClick={() => toggleFilter(group.key, opt.label)}
                >
                  <span>{opt.label}</span>
                  <span className="count">({opt.count.toLocaleString('es-AR')})</span>
                </button>
              ))}
              {group.expandable && (               
                <button
                    type="button"
                    className="myprop-features-toggle"
                    onClick={() => toggleExpand(group.key)}
                    aria-expanded={isExpanded}
                >   
                    {isExpanded ? 'Ver menos' : 'Ver mas'}
                    <img
                        src="/icons/chevron-up.svg"
                        alt=""
                        aria-hidden="true"
                        className={isExpanded ? 'expanded' : ''}
                    />    
                </button>
              )}
            </div>
          );
        })}
      </aside>

      {/* ── Main content ── */}
      <main className="myprop-content">
        <h1 className="myprop-page-title">Mis publicaciones</h1>

        <Select
            label=""
            placeholder="Mis destaques disponibles (20)"
            value={""}
            onChange={(value) => {}}
            options={[
                { value: '1', label: 'Destaque 1' },
                { value: '2', label: 'Destaque 2' },
                { value: '3', label: 'Destaque 3' },
            ]}
        />

        {/* Toolbar */}
        <div className="myprop-toolbar">
          <div className="myprop-toolbar-left">            
            <Checkbox
                label={
                    selectedCount > 0
                    ? `${selectedCount} Publicación${selectedCount !== 1 ? 'es' : ''} seleccionada${selectedCount !== 1 ? 's' : ''}`
                    : 'Seleccionar todas'
                }
                checked={allSelected}
                onChange={toggleSelectAll}
            />
            <button type="button" className="myprop-toolbar-btn" title="Asignar responsable">
              <img src="/icons/AsignarUser.svg" alt="Asignar" />
            </button>
            <button type="button" className="myprop-toolbar-btn" title="Republicar">
              <img src="/icons/republicar.svg" alt="Republicar" />
            </button>
            <button type="button" className="myprop-toolbar-btn" title="Archivar">
              <img src="/icons/archivar.svg" alt="Archivar" />
            </button>
            <button type="button" className="myprop-toolbar-btn" title="Dar de baja">
              <img src="/icons/power.svg" alt="Dar de baja" />
            </button>
          </div>

          <div className="myprop-toolbar-right">
            <div className="myprop-toolbar-search">
              <InputField2
                placeholder="ID"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
                iconPosition="right"
                onIconClick={handleSearchById}
              />
            </div>
          </div>
        </div>

        {/* Property list */}
        <div className="myprop-list">
          {isLoading && <p className="myprop-loading">Cargando publicaciones...</p>}
          {properties.map((prop, idx) => {
            const isSelected = selectedIds.has(idx);
            const statusNum = prop.status as unknown as number;
            const statusInfo = STATUS_MAP[statusNum] ?? { label: 'Activo', cls: 'active' };
            const planLabel = prop.selected_plan ? (PLAN_MAP[prop.selected_plan] ?? '--') : '--';
            const startDate = (prop as any).created_at
              ? new Date((prop as any).created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
              : '--';
            return (
            <div key={prop.id ?? idx} className="myprop-card">
                {/* Checkbox */}
                <div className="myprop-card-check">
                <Checkbox
                    label=""
                    checked={isSelected}
                    onChange={() => toggleSelect(idx)}
                />
                </div>

                <div className="myprop-card-content">
                    <div className="myprop-card-content-top">
                        <div className="myprop-card-infobar">
                            <p className="myprop-card-infobar-label">ID <span className="myprop-card-infobar-value">{prop.id}</span></p>
                            <p className="myprop-card-infobar-label">Inicio: <span className="myprop-card-infobar-value">{startDate}</span></p>
                            <p className="myprop-card-infobar-label">Plan: <span className="myprop-card-infobar-value">{planLabel}</span></p>
                        </div>
                        <div className={`myprop-card-status ${statusInfo.cls}`}>
                            <span className="myprop-card-status-dot" />
                            <span>{statusInfo.label}</span>
                        </div>
                    </div>
                    <div className="myprop-card-content-center">
                        <PropertyCardMyProperties property={prop} />

                        <div className="myprop-quality">
                            <span className="myprop-quality-label">Calidad del aviso</span>
                            <DonutChart percent={0} />
                        </div>

                        <div className="myprop-views">
                            <span className="myprop-views-label">Visualizaciones</span>
                            <span className="myprop-views-count">--</span>
                        </div>
                    </div>
                    <div className="myprop-card-actions">
                        <button type="button" className="myprop-card-action-btn" title="Republicar">
                          <img src="/icons/republicar.svg" alt="Republicar" />
                        </button>
                        
                        <button type="button" className="myprop-card-action-btn" title="Editar" onClick={() => window.location.href = `/protected/publish/${prop.id}`}>
                          <img src="/icons/pencil.svg" alt="Editar" />
                        </button>
                        <button type="button" className="myprop-card-action-btn" title="Ver detalle"  onClick={() => window.open(`/propertyDetail/${prop.id}`, '_blank')}>
                          <img src="/icons/verDetalle.svg" alt="Ver detalle" />
                        </button>
                        <button type="button" className="myprop-card-action-btn" title="Cambiar estado">
                          <img src="/icons/cambiarStatus.svg" alt="Cambiar estado" />
                        </button>
                    </div>
                </div>
            </div>);
          })}
        </div>

        {/* Paginator */}
        <Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>
    </div>
  );
};

export default MyProperties;
