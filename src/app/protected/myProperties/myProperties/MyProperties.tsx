'use client';

import { useEffect, useMemo, useState } from 'react';
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
import Button from '@/ui/Button/Button';

type ToastState = { type: 'success' | 'error'; message: string } | null;

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
  const sessionUser: any = sessionData?.user;
  const hasOrganization = sessionUser?.organization ?? false;
  const orgId = sessionUser?.organization?.id ?? null;
  const loggedUserId = sessionUser?.id ? Number(sessionUser.id) : null;

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusPopoverId, setStatusPopoverId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<{ ids: number[]; status?: number; label: string; action: 'status' } | null>(null);
  const [assignPopoverOpen, setAssignPopoverOpen] = useState(false);
  const [assignSelectedUserId, setAssignSelectedUserId] = useState<number | null>(null);
  const [republishModalOpen, setRepublishModalOpen] = useState(false);
  const [republishIds, setRepublishIds] = useState<number[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('Todas');
  const [republishBranchId, setRepublishBranchId] = useState<string>('Todas');
  const [branchOverviewOpen, setBranchOverviewOpen] = useState(false);
  const [republishUserId, setRepublishUserId] = useState<number | undefined>(undefined);
  const [republishPlanId, setRepublishPlanId] = useState<number>(0);
  const [republishError, setRepublishError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

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

  const republishMutation = useMutation({
    mutationFn: (body: { ids: number[]; hired_plan_id: number; branch_id?: number; user_id?: number }) =>
      apiFetch(`${API_BASE_URL}/properties/republish`, { method: 'PATCH', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      setRepublishModalOpen(false);
      setRepublishIds([]);
      setSelectedBranchId('');
      setRepublishBranchId('Todas');
      setRepublishUserId(undefined);
      setRepublishPlanId(0);
      setRepublishError(null);
      setSelectedIds(new Set());
      setAllSelected(false);
      setToast({ type: 'success', message: 'Publicaciones republicadas con éxito.' });
    },
    onError: () => {
      setToast({ type: 'error', message: 'No se pudo republicar. Intentalo nuevamente.' });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ ids, user_id }: { ids: number[]; user_id: number }) =>
      apiFetch(`${API_BASE_URL}/properties/change-user`, { method: 'PATCH', body: { ids, user_id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      setToast({ type: 'success', message: 'Asesor asignado con éxito.' });
    },
    onError: () => {
      setToast({ type: 'error', message: 'Error al asignar un asesor.' });
    },
  });

  const { data: fetchedBranches = [] } = useQuery<any[]>({
    queryKey: ['republish-branches', orgId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/branches/organization/${orgId}`),
    enabled: !!orgId,
  });

  const { data: usersData } = useQuery<any>({
    queryKey: ['republish-collaborators-users', orgId],
    queryFn: () => apiFetch<any>(`${API_BASE_URL}/users`),
    enabled: hasOrganization && !!orgId,
  });

  const hasBranches = (fetchedBranches?.length ?? 0) > 0;
  const { data: branchPlans = [], isLoading: loadingBranchPlans } = useQuery<any[]>({
    queryKey: ['republish-branch-plans', republishBranchId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/branch/${republishBranchId}/availability`),
    enabled: republishModalOpen && hasOrganization && hasBranches && !!republishBranchId && republishBranchId !== 'Todas',
  });

  const { data: userPlans = [], isLoading: loadingUserPlans } = useQuery<any[]>({
    queryKey: ['republish-user-plans', loggedUserId],
    queryFn: () => apiFetch<any[]>(`${API_BASE_URL}/plans/user/${loggedUserId}/availability`),
    enabled: republishModalOpen && !!loggedUserId && (!hasOrganization || !hasBranches),
  });

  const rawUsers: any[] = useMemo(() => {
    if (Array.isArray(usersData)) return usersData;
    return usersData?.data ?? [];
  }, [usersData]);

  const isBranchSelected = !!selectedBranchId && selectedBranchId !== 'Todas';

  const orgUsers = useMemo<{ id: number; name: string }[]>(() => {
    if (!isBranchSelected) return [];

    const unique = new Map<number, string>();
    rawUsers.forEach((u: any) => {
      const belongsToSelectedBranch = Array.isArray(u?.branches)
        ? u.branches.some((b: any) => String(b?.id) === selectedBranchId)
        : false;

      if (!belongsToSelectedBranch) return;

      if (u?.id != null && u?.name) {
        unique.set(Number(u.id), String(u.name));
      }
    });

    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [isBranchSelected, selectedBranchId, rawUsers]);

  const republishBranchOptions = useMemo(
    () => [...[{ value: "Todas", label: "Todas las sucursales" }], ...fetchedBranches.map((b: any) => ({ value: String(b.id), label: b.branch_name ?? b.name ?? String(b.id) }))],
    [fetchedBranches],
  );

  const { data: branchOverviewPlans = [], isLoading: loadingBranchOverviewPlans } = useQuery<any[]>({
    queryKey: ['branch-plans-overview', orgId, fetchedBranches.map((branch: any) => branch.id).join(',')],
    queryFn: async () => {
      const branchIds = fetchedBranches.map((branch: any) => branch.id);
      const results = await Promise.all(
        branchIds.map(async (branchId: number) => ({
          branchId,
          plans: await apiFetch<any[]>(`${API_BASE_URL}/plans/branch/${branchId}`),
        })),
      );

      return results;
    },
    enabled: branchOverviewOpen && hasBranches,
  });

  const availablePlans = hasOrganization && hasBranches && republishBranchId !== 'Todas' ? branchPlans : userPlans;
  const loadingAvailablePlans = hasOrganization && hasBranches && republishBranchId !== 'Todas' ? loadingBranchPlans : loadingUserPlans;

  useEffect(() => {
    if (!republishModalOpen) return;
    if (hasOrganization && hasBranches && fetchedBranches.length === 1) {
      setSelectedBranchId(String(fetchedBranches[0].id));
    }
  }, [republishModalOpen, hasOrganization, hasBranches, fetchedBranches]);

  useEffect(() => {
    if (!republishModalOpen) return;
    setRepublishPlanId(0);
    setRepublishUserId(undefined);
  }, [selectedBranchId, republishModalOpen]);

  useEffect(() => {
    setSelectedIds(new Set());
    setAllSelected(false);
  }, [selectedBranchId]);

  useEffect(() => {
    setAssignPopoverOpen(false);
    setAssignSelectedUserId(null);
  }, [selectedBranchId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['my-properties', currentPage, searchId, activeFilters, selectedBranchId],
    queryFn: async () => {
      if (searchId !== null) {
        const property: CreateProperty = await apiFetch<CreateProperty>(`${API_BASE_URL}/properties/my-properties`, {
          params: { property_id: searchId },
        });
        return property;
      }

      const branchFilterParam = selectedBranchId && selectedBranchId !== 'Todas'
        ? { branch_id: Number(selectedBranchId) }
        : {};

      return apiFetch(`${API_BASE_URL}/properties/my-properties`, {
        params: { order_by: 'created_at:desc', page: currentPage, limit: LIMIT, ...activeFilters, ...branchFilterParam },
      });
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const propertiesPayload: any = propertiesData as any;
  const properties: CreateProperty[] = propertiesPayload?.data ?? [];
  const filteredProperties = useMemo(() => {
    if (!selectedBranchId || selectedBranchId === 'Todas') return properties;

    const selectedBranchNum = Number(selectedBranchId);
    return properties.filter((prop: any) => {
      const propBranchId = prop?.branch_id ?? prop?.branch?.id ?? prop?.branch?.branch_id;
      return Number(propBranchId) === selectedBranchNum;
    });
  }, [properties, selectedBranchId]);

  const totalPages = Math.max(1, Math.ceil((propertiesPayload?.total ?? 0) / LIMIT));

  const facets: Record<string, { value: number; count: number }[]> = propertiesPayload?.facets ?? {};

  const getSelectedPropertyIds = (singleId?: number): number[] => {
    if (singleId !== undefined) return [singleId];
    return filteredProperties.filter((_, i) => selectedIds.has(i)).map(p => p.id!).filter(Boolean);
  };

  const openRepublishModal = (ids: number[], branchId?: string) => {
    if (ids.length === 0) return;
    setRepublishModalOpen(true);
    setRepublishIds(ids);
    setRepublishBranchId(branchId ?? selectedBranchId);
    setRepublishUserId(undefined);
    setRepublishPlanId(0);
    setRepublishError(null);
  };

  const handleRepublishAccept = () => {
    if (republishPlanId === 0) {
      setRepublishError('Selecciona un plan para continuar.');
      return;
    }

    if (hasOrganization && hasBranches && republishBranchId === 'Todas') {
      setRepublishError('Selecciona una sucursal para continuar.');
      return;
    }

    const body: { ids: number[]; hired_plan_id: number; branch_id?: number; user_id?: number } = {
      ids: republishIds,
      hired_plan_id: republishPlanId,
    };

    if (hasOrganization && hasBranches && republishBranchId && republishBranchId !== 'Todas') {
      body.branch_id = Number(republishBranchId);
    }

    if (republishUserId !== undefined) {
      body.user_id = republishUserId;
    }

    republishMutation.mutate(body);
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
      setSelectedIds(new Set(filteredProperties.map((_, i) => i)));
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
      {toast && (
        <div className={`myprop-toast myprop-toast--${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
      <MyPropertiesFilters
        facets={facets}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        onClearFilters={clearFilters}
      />

      {/* ── Main content ── */}
      <main className="myprop-content">
        <h1 className="myprop-page-title">Mis publicaciones</h1>
        <section className="myprop-overview" aria-label="Resumen de sucursales">
          <button
            type="button"
            className={`myprop-overview-trigger ${branchOverviewOpen ? 'is-open' : ''}`}
            onClick={() => setBranchOverviewOpen((prev) => !prev)}
            aria-expanded={branchOverviewOpen}
          >
            <div>
              <h2 className="myprop-overview-title">Planes</h2>
            </div>
            <div className="myprop-overview-trigger-right">             
              <img src="/icons/chevron-up.svg" alt="" aria-hidden="true" />
            </div>
          </button>

          {branchOverviewOpen && (
            <div className="myprop-overview-panel">             
              <div className="myprop-overview-list">
                {loadingBranchOverviewPlans && (
                  <p className="myprop-overview-empty">Cargando planes...</p>
                )}

                {!loadingBranchOverviewPlans && branchOverviewPlans.length === 0 && (
                  <p className="myprop-overview-empty">Sin productos disponibles</p>
                )}

                {branchOverviewPlans.map((entry: any) => {
                  const branch = fetchedBranches.find((item: any) => String(item.id) === String(entry.branchId));
                  const branchName = branch?.branch_name ?? branch?.name ?? String(entry.branchId);
                  const plans = Array.isArray(entry.plans) ? entry.plans : [];

                  return (
                    <div key={entry.branchId} className="myprop-overview-card">
                      <h3>{branchName}</h3>
                      <div className="myprop-overview-table">
                        <div className="myprop-overview-row myprop-overview-row-header">
                          <span>Productos</span>
                          <span>Contratados</span>
                          <span>Disponibles</span>
                          <span>Activo</span>
                        </div>
                        {plans.length === 0 && (
                          <div className="myprop-overview-row"><span>Sin productos disponibles</span></div>
                        )}
                        {plans.map((plan: any, idx: number) => (
                          <div key={plan.id ?? idx} className="myprop-overview-row">
                            <span>{plan.plan.plan_name}</span>
                            <span>{plan.plan.highlight_limit ?? plan.total ?? '-'}</span>
                            <span>{plan.amount_hired ?? '-'}</span>
                            <span>{plan.plan.is_active ? 'Si' : 'No'}</span>
                          </div>
                        ))}
                      </div>
                      <div className="myprop-overview-progress">
                        <div className="myprop-overview-progress-bar" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
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
                  disabled={selectedCount === 0 || !isBranchSelected}
                  onClick={() => { setAssignPopoverOpen(prev => !prev); setAssignSelectedUserId(null); }}
                >
                  <img src="/icons/AsignarUser.svg" alt="Asignar" />
                </button>
                {assignPopoverOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setAssignPopoverOpen(false)} />
                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 16, minWidth: 220 }}>
                      <Select
                        label=""
                        placeholder="Seleccionar asesor..."
                        value={String(assignSelectedUserId) ?? ''}
                        onChange={(value) => setAssignSelectedUserId(value ? Number(value) : null)}
                        options={orgUsers.map(b => ({ label: b.name, value: String(b.id) }))}
                      />
                      <br />
                      <Button
                        label="Aceptar"
                        disabled={assignSelectedUserId === null || !isBranchSelected}
                        fullWidth
                        onClick={() => {
                          if (assignSelectedUserId === null || !isBranchSelected) return;
                          assignMutation.mutate({ ids: getSelectedPropertyIds(), user_id: assignSelectedUserId });
                          setAssignPopoverOpen(false);
                          setAssignSelectedUserId(null);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            <button type="button" className="myprop-toolbar-btn" title="Republicar" disabled={selectedCount === 0 || (hasOrganization && selectedBranchId === "Todas")} onClick={() => openRepublishModal(getSelectedPropertyIds(), selectedBranchId)}>
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
            {hasOrganization && (
              <div className="myprop-republish-selectors">
                {hasBranches ? (
                  <Select
                    label=""
                    placeholder="Seleccionar sucursal"
                    value={selectedBranchId}
                    onChange={(value) => {
                      setSelectedBranchId(value);
                      setRepublishError(null);
                    }}
                    options={republishBranchOptions}
                  />
                ) : (
                  <p className="myprop-republish-info">No hay sucursales en la organización. Se mostrarán planes del usuario logueado.</p>
                )}
              </div>
            )}
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
          {filteredProperties?.map((prop, idx) => {
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
                        <button type="button" className="myprop-card-action-btn" title="Republicar" onClick={() => prop.id && openRepublishModal([prop.id], String((prop as any)?.branch_id ?? (prop as any)?.branch?.id ?? ''))}>
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

      {republishModalOpen && (
        <AreYouSureModal
          title="Republicar"
          text={
            <div className="myprop-republish-modal">
              <p className="myprop-republish-summary">
                Vas a republicar {republishIds.length} propiedad{republishIds.length !== 1 ? 'es' : ''}.
              </p>

              <div className="myprop-republish-plans">
                <p className="myprop-republish-plans-title">Planes disponibles</p>

                {hasOrganization && hasBranches && republishBranchId === 'Todas' && (
                  <p className="myprop-republish-info">Seleccioná una sucursal para ver los planes disponibles.</p>
                )}

                {loadingAvailablePlans && (
                  <p className="myprop-republish-info">Cargando planes...</p>
                )}
                <button
                  type="button"
                  className={`myprop-republish-plan-btn ${republishPlanId === 0 ? 'is-selected' : ''}`}
                  onClick={() => {
                    setRepublishPlanId(0);
                    setRepublishError(null);
                  }}
                >
                  <span>Gratis</span>
                </button>

                {!loadingAvailablePlans && (!availablePlans || availablePlans.length === 0) && (!hasOrganization || !hasBranches || republishBranchId !== 'Todas') && (
                  <p className="myprop-republish-info">No hay planes disponibles para la selección actual.</p>
                )}

                {(availablePlans ?? []).map((plan: any) => (
                  <button
                    key={plan.plan_id}
                    type="button"
                    className={`myprop-republish-plan-btn ${republishPlanId === plan.plan_id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setRepublishPlanId(plan.plan_id);
                      setRepublishError(null);
                    }}
                  >
                    <span>{plan.plan_name}</span>
                    <small>Cantidad disponible: {plan.available}</small>
                  </button>
                ))}
              </div>

              {republishError && <p className="myprop-republish-error">{republishError}</p>}
            </div>
          }
          acceptText={republishMutation.isPending ? 'Procesando...' : 'Aceptar'}
          onAccept={republishMutation.isPending ? undefined : handleRepublishAccept}
          onCancel={() => {
            if (republishMutation.isPending) return;
            setRepublishModalOpen(false);
            setRepublishIds([]);
            setRepublishUserId(undefined);
            setRepublishPlanId(0);
            setRepublishError(null);
          }}
        />
      )}
    </div>
  );
};

export default MyProperties;
