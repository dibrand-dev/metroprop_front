'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, LEAD_STATE_OPTIONS, OPERATION_TYPE_LABELS } from "@/types/propiedad";
import Checkbox from "@/ui/Checkbox/Checkbox";
import Select from "@/ui/Select/Select";
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, formatCurrency } from '@/utils/utils';

interface LeadItemProps {
  lead: Lead;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export default function LeadItem({ lead, checked = false, onCheckedChange }: LeadItemProps) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [isUnread, setIsUnread] = useState(lead.unread ?? false);
  const [isHighlighted, setIsHighlighted] = useState(lead.highlighted ?? false);
  const [leadState, setLeadState] = useState(lead.lead_state);

  const patchLead = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`${API_BASE_URL}/leads/${lead.id}`, { method: 'PATCH', body }),
    onSuccess: () => queryClient.refetchQueries({ queryKey: ['leads'] }),
  });

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isHighlighted;
    setIsHighlighted(next);
    patchLead.mutate({ highlighted: next });
  };

  const handleStateChange = (val: string) => {
    setLeadState(val);
    patchLead.mutate({ lead_state: val });
  };

  const handleRowClick = () => {
    if (!expanded && isUnread) {
      setIsUnread(false);
      patchLead.mutate({ unread: false });
    }
    setExpanded(prev => !prev);
  };

  return (
    <div className={`lead-item-wrapper ${isUnread ? 'unread' : ''}`}>
      <div className="lead-item" onClick={handleRowClick} style={{ cursor: 'pointer' }}>
        <span className="lead-dot" />
        <Checkbox label="" checked={checked} onChange={(val) => { onCheckedChange?.(val); }} />
        <img
          className="lead-star"
          src={`/icons/${isHighlighted ? "starIsFavorite" : "star_development"}.svg`}
          alt="Icono de favorito"
          onClick={handleStarClick}
          style={{ cursor: 'pointer' }}
        />
        <span className="lead-name">{lead.name}</span>
        <span className="lead-property">
          <span>ID: {lead?.property_id}</span>
          {lead?.property?.street}
        </span>
        <span className="lead-operation">
          <span>{OPERATION_TYPE_LABELS[lead.property?.operation_type as keyof typeof OPERATION_TYPE_LABELS]}</span>
          {(lead.property?.price ?? 0) > 0 ? `${formatCurrency(lead.property?.currency)} ${lead.property?.price ?? ''}` : lead.property?.publication_title ?? ''}
        </span>
        <span className="lead-status lead-status-badge" onClick={e => e.stopPropagation()}>
          <Select options={LEAD_STATE_OPTIONS} value={leadState} onChange={handleStateChange} />
        </span>
        <span className="lead-date">{new Date(lead.created_at).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' }).replace('.', '')}</span>
      </div>
      {expanded && lead.message && (        
        <div className="lead-message">
          Nombre: {lead.name ?? "-"}<br />
          Email: {lead.email ?? "-"}<br />
          Teléfono: {lead.phone ?? "-"}<br />
          <p className="mt-4">{lead.message}</p></div>
        
      )}
    </div>
  );
}
