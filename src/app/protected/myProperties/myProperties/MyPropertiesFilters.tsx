'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocations } from '@/lib/locations';
import { PROPERTY_STATUS_LABELS, PropertyStatus, PROPERTY_TYPE_LABELS, PropertyType, OPERATION_TYPE_LABELS, OperationType } from '@/types/propiedad';

export const FILTER_VALUE_LABEL: Record<string, string> = {
  status: 'Estado',
  room_amount: 'Ambientes',
  bathroom_amount: 'Baños',
  suite_amount: 'Habitaciones',
  property_type: 'Tipo de propiedad',
  hired_plan_id: 'Plan',
  operation_type: 'Operación',
  user_id: 'Asesor',
  location_id: 'Ubicación',
};

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

interface FilterGroup {
  facetKey: string;
  title: string;
  expandable?: boolean;
  options: FilterOption[];
}

interface MyPropertiesFiltersProps {
  facets: Record<string, { value: number; count: number }[]>;
  activeFilters: Record<string, string>;
  onToggleFilter: (facetKey: string, value: string) => void;
  onClearFilters: () => void;
  showFiltersMobile: boolean;
  onCloseFiltersMobile: () => void;
  planNameMap?: Record<number, string>;
}

const getDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value);
};

export default function MyPropertiesFilters({
  facets,
  activeFilters,
  onToggleFilter,
  onClearFilters,
  showFiltersMobile,
  onCloseFiltersMobile,
  planNameMap = {},
}: MyPropertiesFiltersProps) {
  const { data: sessionData } = useSession();
  const { data: locations = [] } = useLocations();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const locationMap = new Map(locations.map(l => [l.id, l.name]));

	const userMap = new Map<string, string>();

	if (!sessionData?.organization) {
		userMap.set(String((sessionData?.user as any)?.id), (sessionData?.user as any)?.name);
	} else {
		const branches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
		branches.forEach((branch) => {
				(branch.users ?? []).forEach((u: any) => {
				if (u.id != null && u.name) userMap.set(String(u.id), u.name);
				});
		});
	}

  const filterGroups: FilterGroup[] = Object.keys(facets).map(facetKey => ({
    facetKey,
    title: FILTER_VALUE_LABEL[facetKey] ?? facetKey,
    expandable: facets[facetKey].length > 3,
    options: (facets[facetKey] ?? []).map(item => ({
      label: facetKey === 'location_id'
        ? getDisplayValue(locationMap.get(item.value) ?? item.value)
        : facetKey === 'status'
          ? getDisplayValue(PROPERTY_STATUS_LABELS[item.value as PropertyStatus] ?? item.value)
          : facetKey === 'property_type'
            ? getDisplayValue(PROPERTY_TYPE_LABELS[item.value as PropertyType] ?? item.value)
            : facetKey === 'operation_type'
              ? getDisplayValue(OPERATION_TYPE_LABELS[item.value as OperationType] ?? item.value)
              : facetKey === 'user_id'
                ? getDisplayValue(userMap.get(String((item as any).user_name)) ?? (item as any).user_name)
                : facetKey === 'hired_plan_id'
                  ? (Number(item.value) === 0 ? 'Gratis' : getDisplayValue(planNameMap[Number(item.value)] ?? item.value))
                  : getDisplayValue(item.value),
      value: String(item.value),
      count: item.count,
    })),
  }));

  const toggleExpand = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeEntries = Object.entries(activeFilters);

  return (
    <aside className={`myprop-filters ${showFiltersMobile ? 'is-open' : ''}`}>
      <div className="myprop-filter-header">
        <h2 className="myprop-filters-title">Filtros</h2>
        <button onClick={onCloseFiltersMobile} className="myprop-filters-close" aria-label="Cerrar filtros">
          x
        </button>
      </div>
      <div className="myprop-filter-container">
        {activeEntries.length > 0 && (  
          <div className="myprop-active-filters">
            {activeEntries.map(([facetKey, value]) => {
              const title = FILTER_VALUE_LABEL[facetKey] ?? facetKey;
              const group = filterGroups.find(g => g.facetKey === facetKey);
              const optLabel = group?.options.find(o => o.value === value)?.label ?? value;
              return (
                <span key={facetKey} className="myprop-filter-pill">
                  <span>{title}: {optLabel}</span>
                  <button type="button" onClick={() => onToggleFilter(facetKey, value)} aria-label="Quitar filtro">×</button>
                </span>
              );
            })}
            <button
              type="button"
              className="myprop-filter-pill-clear"
              onClick={onClearFilters}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {filterGroups.map(group => {
          const isExpanded = expandedGroups[group.facetKey];
          const shown = group.expandable && !isExpanded
            ? group.options.slice(0, 3)
            : group.options;

          return (
            <div key={group.facetKey} className="myprop-filter-group">
              <p className="myprop-filter-group-title">{group.title}</p>
              {shown.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`myprop-filter-link ${activeFilters[group.facetKey] === opt.value ? 'active' : ''}`}
                  onClick={() => onToggleFilter(group.facetKey, opt.value)}
                >
                  <span className="text-left">{opt.label}</span>
                  <span className="count">({opt.count.toLocaleString('es-AR')})</span>
                </button>
              ))}
              {group.expandable && group.options.length > 3 && (
                <button
                  type="button"
                  className="myprop-features-toggle"
                  onClick={() => toggleExpand(group.facetKey)}
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
      </div>
    </aside>
  );
}
