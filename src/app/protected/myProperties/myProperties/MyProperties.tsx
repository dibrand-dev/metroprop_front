'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiFetch';
import Checkbox from '@/ui/Checkbox/Checkbox';
import InputField2 from '@/ui/InputField2/InputField2';
import Select from '@/ui/Select/Select';
import type { CreateProperty } from '@/types/propiedad';
import { PROPERTY_STATUS_LABELS, PropertyStatus } from '@/types/propiedad';
import Paginator from '@/components/Paginator/Paginator';
import { API_BASE_URL } from '@/utils/utils';
import './MyProperties.scss';
import PropertyCardMyProperties from './PropertyCardMyProperties';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import MyPropertiesFilters from './MyPropertiesFilters';


const PLAN_MAP: Record<number, string> = {
  1: 'Simple',
  2: 'Destacado',
  3: 'Premium',
};

const STATUS_COLOR_MAP: Record<number, string> = {
  [PropertyStatus.DRAFT]: '#9e9e9e',
  [PropertyStatus.A_COTIZAR]: '#2196f3',
  [PropertyStatus.DISPONIBLE]: '#4caf50',
  [PropertyStatus.RESERVADA]: '#ff9800',
  [PropertyStatus.NO_DISPONIBLE]: '#f44336',
};

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

/* ── Property completeness ──────────────────────────────────────────── */
const COMPLETENESS_CHECKS: Array<(p: CreateProperty) => boolean> = [
  p => !!p.publication_title,
  p => !!p.description,
  p => p.property_type !== undefined,
  p => p.price !== undefined && p.price > 0,
  p => !!p.currency,
  p => !!p.street,
  p => p.country_id !== undefined,
  p => p.state_id !== undefined,
  p => p.location_id !== undefined,
  p => p.geo_lat !== undefined,
  p => p.geo_long !== undefined,
  p => p.room_amount !== undefined,
  p => p.bathroom_amount !== undefined,
  p => (p.surface !== undefined && p.surface > 0) || (p.total_surface !== undefined && (p.total_surface ?? 0) > 0),
  p => (p.images?.length ?? 0) > 0,
  p => (p.tags?.length ?? 0) > 0,
  p => (p.videos?.length ?? 0) > 0,
  p => (p.plans?.length ?? 0) > 0,
  p => (p.multimedia360?.length ?? 0) > 0,
];

function calcPropertyCompleteness(prop: CreateProperty): number {
  const filled = COMPLETENESS_CHECKS.filter(fn => fn(prop)).length;
  return Math.round((filled / COMPLETENESS_CHECKS.length) * 100);
}

/* ── Main component ─────────────────────────────────────────────────── */
const MyProperties = () => {
  const { data: sessionData } = useSession();
  const hasOrganization = !!(sessionData?.user as any)?.organization;
  const orgUsers: { id: number; name: string }[] = [];
  if (hasOrganization) {
    const branches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
    branches.forEach((branch) => {
      (branch.users ?? []).forEach((u: any) => {
        if (u.id != null && u.name && !orgUsers.find(x => x.id === u.id)) {
          orgUsers.push({ id: u.id, name: u.name });
        }
      });
    });
  }

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusPopoverId, setStatusPopoverId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<{ ids: number[]; status?: number; label: string; action: 'status' | 'republica' } | null>(null);
  const [assignPopoverOpen, setAssignPopoverOpen] = useState(false);
  const [assignSelectedUserId, setAssignSelectedUserId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const confirmAction = () => {
    if (!pendingAction) return;
    statusMutation.mutate({ ids: pendingAction.ids, status: pendingAction.status! });
    setPendingAction(null);
  };

  const requestStatusChange = (ids: number[], status: number, label: string) => {
    setStatusPopoverId(null);
    setPendingAction({ ids, status, label, action: 'status' });
  };

  const statusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: number }) =>
      apiFetch(`${API_BASE_URL}/properties/status`, { method: 'PATCH', body: { ids, status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-properties'] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ ids, user_id }: { ids: number[]; user_id: number }) =>
      apiFetch(`${API_BASE_URL}/properties/change-user`, { method: 'PATCH', body: { ids, user_id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-properties'] }),
  });

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['my-properties', currentPage, searchId, activeFilters],
    queryFn: async () => {
      if (searchId !== null) {
        const property: CreateProperty = await apiFetch<CreateProperty>(`${API_BASE_URL}/properties/my-properties`, {
          params: { property_id: searchId },
        });
        return property;
      }
      return apiFetch(`${API_BASE_URL}/properties/my-properties`, {
        params: { order_by: 'created_at:desc', page: currentPage, limit: LIMIT, ...activeFilters },
      });
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const properties: CreateProperty[] = propertiesData?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((propertiesData?.total ?? 0) / LIMIT));

  const facets: Record<string, { value: number; count: number }[]> = (propertiesData as any)?.facets ?? {};

  const getSelectedPropertyIds = (singleId?: number): number[] => {
    if (singleId !== undefined) return [singleId];
    return properties.filter((_, i) => selectedIds.has(i)).map(p => p.id!).filter(Boolean);
  };

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

  const toggleFilter = (facetKey: string, value: string) => {
    setCurrentPage(1);
    setActiveFilters((prev) => {
      if (prev[facetKey] === value) {
        const next = { ...prev };
        delete next[facetKey];
        return next;
      }
      return { ...prev, [facetKey]: value };
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
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
      <MyPropertiesFilters
        facets={facets}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onClearFilters={clearFilters}
      />

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
            {hasOrganization && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="myprop-toolbar-btn"
                  title="Asignar responsable"
                  disabled={selectedCount === 0}
                  onClick={() => { setAssignPopoverOpen(prev => !prev); setAssignSelectedUserId(null); }}
                >
                  <img src="/icons/AsignarUser.svg" alt="Asignar" />
                </button>
                {assignPopoverOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setAssignPopoverOpen(false)} />
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 16, minWidth: 220 }}>
                      <select
                        value={assignSelectedUserId ?? ''}
                        onChange={e => setAssignSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                        style={{ width: '100%', padding: '8px', marginBottom: 12, borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }}
                      >
                        <option value="">Seleccionar asesor...</option>
                        {orgUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={assignSelectedUserId === null}
                        style={{ width: '100%', padding: '8px 0', background: assignSelectedUserId !== null ? '#1976d2' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, cursor: assignSelectedUserId !== null ? 'pointer' : 'not-allowed', fontSize: 14 }}
                        onClick={() => {
                          if (assignSelectedUserId === null) return;
                          assignMutation.mutate({ ids: getSelectedPropertyIds(), user_id: assignSelectedUserId });
                          setAssignPopoverOpen(false);
                          setAssignSelectedUserId(null);
                        }}
                      >
                        Aceptar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <button type="button" className="myprop-toolbar-btn" title="Republicar" disabled={selectedCount === 0} onClick={() => requestStatusChange(getSelectedPropertyIds(), PropertyStatus.DISPONIBLE, 'Republicar')}>
              <img src="/icons/republicar.svg" alt="Republicar" />
            </button>
            <button type="button" className="myprop-toolbar-btn" title="Archivar" disabled={selectedCount === 0} onClick={() => requestStatusChange(getSelectedPropertyIds(), PropertyStatus.ARCHIVADA, 'Archivar')}>
              <img src="/icons/archivar.svg" alt="Archivar" />
            </button>
            <button type="button" className="myprop-toolbar-btn" title="Dar de baja" disabled={selectedCount === 0} onClick={() => requestStatusChange(getSelectedPropertyIds(), PropertyStatus.DRAFT, 'Dar de baja')}>
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
          {properties?.map((prop, idx) => {
            const isSelected = selectedIds.has(idx);
            const completeness = calcPropertyCompleteness(prop);
            const statusNum = prop.status as PropertyStatus || PropertyStatus.DISPONIBLE;
            const statusInfo = PROPERTY_STATUS_LABELS[statusNum];
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
                    <div className={`myprop-card-status`} style={{ color: STATUS_COLOR_MAP[statusNum] }}>
                      <span className="myprop-card-status-dot" />
                      <span>{statusInfo}</span>
                    </div>
                  </div>
                    <div className="myprop-card-content-center">
                        <PropertyCardMyProperties property={prop} />

                        <div className="myprop-quality">
                          <span className="myprop-quality-label">Calidad del aviso</span>
                          <DonutChart percent={completeness} />
                        </div>

                        <div className="myprop-views">
                          <span className="myprop-views-label">Visualizaciones</span>
                          <span className="myprop-views-count">{prop.view_count}</span>
                        </div>
                    </div>
                    <div className="myprop-card-actions">
                        <button type="button" className="myprop-card-action-btn" title="Republicar" onClick={() => prop.id && requestStatusChange([prop.id], PropertyStatus.DISPONIBLE, 'Republicar')}>
                          <img src="/icons/republicar.svg" alt="Republicar" />
                        </button>                        
                        <button type="button" className="myprop-card-action-btn" title="Editar" onClick={() => window.open(`/protected/publish/${prop.id}`, '_blank')}>
                          <img src="/icons/pencil.svg" alt="Editar" />
                        </button>
                        <button type="button" className="myprop-card-action-btn" title="Ver detalle"  onClick={() => window.open(`/propertyDetail/${prop.id}`, '_blank')}>
                          <img src="/icons/verDetalle.svg" alt="Ver detalle" />
                        </button>
                        <div style={{ position: 'relative' }}>
                          <button type="button" className="myprop-card-action-btn" title="Cambiar estado" onClick={() => setStatusPopoverId(prev => prev === prop.id ? null : (prop.id ?? null))}>
                            <img src="/icons/cambiarStatus.svg" alt="Cambiar estado" />
                          </button>
                          {statusPopoverId === prop.id && (
                            <>
                              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setStatusPopoverId(null)} />
                              <div style={{ position: 'absolute', bottom: '100%', right: 0, zIndex: 100, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: '8px 0', minWidth: 180 }}>
                                {(Object.entries(PROPERTY_STATUS_LABELS) as [string, string][]).map(([key, label]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#333', textAlign: 'left' }}
                                    onClick={() => {
                                      if (prop.id) requestStatusChange([prop.id], Number(key), label);
                                    }}
                                  >
                                    <span className="myprop-card-status-dot" style={{ backgroundColor: STATUS_COLOR_MAP[Number(key)], flexShrink: 0 }} />
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                    </div>
                </div>
            </div>);
          })}
        </div>

        {/* Paginator */}
        <Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </main>

      {pendingAction && (
        <AreYouSureModal
          title="¿Estás seguro?"
          text={`Estás por cambiar el estado de ${pendingAction.ids.length} propiedad${pendingAction.ids.length !== 1 ? 'es' : ''} a "${pendingAction.label}".`}
          onAccept={confirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
};

export default MyProperties;
