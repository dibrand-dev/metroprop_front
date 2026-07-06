'use client';

import { useState, useMemo } from 'react';
import './Alerts.scss';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, formatNumbers } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import CreateAlertModal from '@/components/CreateAlertModal/CreateAlertModal';
import Paginator from '@/components/Paginator/Paginator';
import Select from '@/ui/Select/Select';
import {
  FREQUENCY_OPTIONS,
  OPERATION_TYPE_LABELS, OperationType,
  PROPERTY_TYPE_LABELS, PropertyType,
  PROPERTY_SUBTYPE_LABELS, PropertySubtype,
  ORIENTATION_LABELS, Orientation,
  AmenityTag,
  AlertFrequency,
  Currency,
} from '@/types/propiedad';
import { useLocations } from '@/lib/locations';

const iconTrash = '/icons/trash.svg';
const iconEdit = '/icons/pencil.svg';

interface Alert {
  id: number;
  title: string;
  filters: string; // JSON string
  user_id: number;
  status: 'active' | 'inactive';
  created_at?: string;
  frequency: AlertFrequency
}

function parseFilters(
  filtersJson: string,
  locationMap: Map<number, string>,
  tagsMap: Map<number, string>,
): [string, string][] {
  try {
    const parsed = JSON.parse(filtersJson);
    if (!parsed || typeof parsed !== 'object') return [];
    const entries: ([string, string] | null)[] = [];

    for (const [key, value] of Object.entries(parsed)) {
      const str = String(value);

      if (key === 'location_id') {
        const name = locationMap.get(Number(str));
        if (name) entries.push(['location_id', name]);
        continue;
      }
      if (key === 'operation_type') {
        const label = OPERATION_TYPE_LABELS[Number(str) as OperationType];
        if (label) entries.push(['operation_type', label]);
        continue;
      }
      if (key === 'property_type') {
        str.split(',').forEach(v => {
          const label = PROPERTY_TYPE_LABELS[Number(v) as PropertyType];
          if (label) entries.push(['property_type', label]);
        });
        continue;
      }
      if (key === 'property_subtype') {
        str.split(',').forEach(v => {
          const label = PROPERTY_SUBTYPE_LABELS[Number(v) as PropertySubtype];
          if (label) entries.push(['property_subtype', label]);
        });
        continue;
      }
      if (key === 'room_amount') {
        entries.push(['room_amount', `Ambientes: ${str}`]);
        continue;
      }
      if (key === 'parking_lot_amount') {
        entries.push(['parking_lot_amount', `Cocheras: ${str}`]);
        continue;
      }
      if (key === 'bathroom_amount') {
        entries.push(['bathroom_amount', `Baños: ${str}`]);
        continue;
      }
      if (key === 'suite_amount') {
        entries.push(['suite_amount', `Suites: ${str}`]);
        continue;
      }
      if (key === 'age') {
        const n = Number(str);
        const ageLabel = n === 0 ? 'A estrenar' : n === -1 ? 'En construcción' : `Antigüedad: ${n} año${n === 1 ? '' : 's'}`;
        entries.push(['age', ageLabel]);
        continue;
      }
      if (key === 'orientation') {
        str.split(',').forEach(v => {
          const label = ORIENTATION_LABELS[Number(v.trim()) as Orientation];
          if (label && label !== 'Seleccionar') entries.push(['orientation', label]);
        });
        continue;
      }
      if (key === 'tags') {
        str.split(',').forEach(v => {
          const label = tagsMap.get(Number(v.trim()));
          if (label) entries.push(['tag', label]);
        });
        continue;
      }
      if (key === 'currency') {
        entries.push(['currency', `Moneda: ${str}`]);
        continue;
      }
      if (key === 'price_min') {
        const num = Number(str);
        if (!isNaN(num)) entries.push(['price_min', `Precio mínimo: ${formatNumbers(num)}`]);
        continue;
      }
      if (key === 'price_max') {
        const num = Number(str);
        if (!isNaN(num)) entries.push(['price_max', `Precio máximo: ${formatNumbers(num)}`]);
        continue;
      }
      if (key === 'total_surface_min') {
        const num = Number(str);
        if (!isNaN(num)) entries.push(['total_surface_min', `Superficie total mínima: ${formatNumbers(num)}`]);
        continue;
      }
      if (key === 'total_surface_max') {
        const num = Number(str);
        if (!isNaN(num)) entries.push(['total_surface_max', `Superficie total máxima: ${formatNumbers(num)}`]);
        continue;
      }
      if (key === 'direct_owner') {
        entries.push(['direct_owner', `Propietario directo`]);
        continue;
      }
      if (key === 'inmobiliaria') {
        entries.push(['inmobiliaria', `Inmobiliaria`]);
        continue;
      }
    }

    return entries.filter((e): e is [string, string] => e !== null);
  } catch {}
  return [];
}

const LIMIT = 20;

export default function Alerts() {
  const queryClient = useQueryClient();
  const { data: locationsData = [] } = useLocations();
  const locationMap = useMemo(
    () => new Map((locationsData as { id: number; name: string }[]).map((l) => [l.id, l.name])),
    [locationsData],
  );

  const { data: tagsData = [] } = useQuery<AmenityTag[]>({
    queryKey: ['tags'],
    queryFn: async () => apiFetch<AmenityTag[]>(`${API_BASE_URL}/tags`),
    staleTime: 60 * 60 * 1000,
  });
  const tagsMap = useMemo(
    () => new Map((tagsData as AmenityTag[]).map((t) => [t.id, t.name])),
    [tagsData],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; alertId: number | null; alertTitle: string }>({ open: false, alertId: null, alertTitle: '' });
  const [editAlertModal, setEditAlertModal] = useState<{ open: boolean; alertId: number; name: string; filters: string } | null>(null);

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['search-alerts', currentPage],
    queryFn: async () =>
      apiFetch(`${API_BASE_URL}/search-alerts`, {
        params: { page: currentPage, limit: LIMIT },
      }),
    staleTime: 5 * 60 * 1000,
  });

  const rawData: any = alertsData;
  const alerts: Alert[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const total: number = rawData?.total ?? alerts.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const deleteMutation = useMutation({
    mutationFn: (alertId: number) =>
      apiFetch(`${API_BASE_URL}/search-alerts/${alertId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, alertId: null, alertTitle: '' });
      queryClient.invalidateQueries({ queryKey: ['search-alerts'] });
    },
  });

  const updateFrequencyMutation = useMutation({
    mutationFn: ({ alertId, frequency }: { alertId: number; frequency: string }) =>
      apiFetch(`${API_BASE_URL}/search-alerts/${alertId}`, {
        method: 'PATCH',
        body: { frequency },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-alerts'] });
    },
  });

  return (
    <div className="collaborators-container">
      <div className="collaborators-content">
        <div className="collaborators-header">
          <div>
            <h1>Búsquedas y alertas</h1>
          </div>
        </div>
        <div className="collaborators-list">
          {isLoading && <p>Cargando alertas...</p>}
          {alerts?.length > 0 && alerts.map((alert) => {
            const filterChips = parseFilters(alert.filters, locationMap, tagsMap);
            return (
              <div key={alert.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  {alert.created_at && (
                    <p className="collaborators-card-subtitle">
                      Guardado el {new Date(alert.created_at).toLocaleDateString('es-AR')}
                    </p>
                  )}
                  <p className="collaborators-card-title">{alert.title}</p>
                  <div className="property-owner-info">
                    {filterChips.length > 0
                      ? filterChips.map(([key, value]) => (
                          <span key={key} className="alert-filter-chip">{value}</span>
                        ))
                      : <span className="collaborators-card-subtitle">Sin filtros guardados</span>
                    }
                  </div>
                </div>
                <div className="collaborators-card-actions">
                  <Select
                    options={FREQUENCY_OPTIONS}
                    value={alert.frequency}
                    onChange={(val) => updateFrequencyMutation.mutate({ alertId: alert.id, frequency: val })}
                    placeholder="Inmediata"
                    label="Frecuencia de alerta"
                  />
                  <div className="collaborators-card-tools">
                    <button
                      className="collaborators-action-button"
                      type="button"
                      aria-label="Editar alerta"
                      onClick={() =>
                        setEditAlertModal({
                          open: true,
                          alertId: alert.id,
                          name: alert.title,
                          filters: alert.filters,
                        })
                      }
                    >
                      <img src={iconEdit} alt="" />
                    </button>
                    <button
                      className="collaborators-action-button"
                      type="button"
                      aria-label="Eliminar alerta"
                      onClick={() =>
                        setDeleteModal({ open: true, alertId: alert.id, alertTitle: alert.title })
                      }
                    >
                      <img src={iconTrash} alt="" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {!isLoading && alerts.length === 0 && (
            <p>No tenés alertas.</p>
          )}
        </div>
      </div>

      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {deleteModal.open && (
        <AreYouSureModal
          title="Eliminar alerta"
          subTitle={`¿Está seguro que desea eliminar "${deleteModal.alertTitle}"?`}
          text="Esta acción no se puede deshacer."
          icon={iconTrash}
          onCancel={() => setDeleteModal({ open: false, alertId: null, alertTitle: '' })}
          onAccept={() => {
            if (deleteModal.alertId) deleteMutation.mutate(deleteModal.alertId);
          }}
          acceptText={deleteMutation.isPending ? 'Eliminando...' : 'Aceptar'}
        />
      )}
      {editAlertModal?.open && (
        <CreateAlertModal
          alertId={editAlertModal.alertId}
          initialName={editAlertModal.name}
          onClose={() => setEditAlertModal(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['search-alerts'] })}
        />
      )}
    </div>
  );
}
