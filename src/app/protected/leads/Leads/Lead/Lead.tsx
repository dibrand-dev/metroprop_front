import { Lead, LEAD_STATE_OPTIONS, OPERATION_TYPE_LABELS } from "@/types/propiedad";
import Checkbox from "@/ui/Checkbox/Checkbox";
import Select from "@/ui/Select/Select";

export default function LeadItem({ lead }: {lead: Lead}) {

return <div className={`lead-item ${lead.unread ? 'unread' : ''}`}>
        <span className="lead-dot" />
        <Checkbox
            label=""
            checked={true}
            onChange={() => {}}
        />
        <img className="lead-star" src={`/icons/${lead.highlighted ? "starIsFavorite" : "star_development"}.svg`} alt="Icono de favorito" />
        <span className="lead-name">{lead.name}</span>
        <span className="lead-property">
            <span>ID: {lead?.property_id}</span>
            {lead?.property?.street}
        </span>
        <span className="lead-operation">
            <span>{OPERATION_TYPE_LABELS[lead.property?.operation_type]}</span>
            {`${lead.property?.currency ?? ''} ${lead.property?.price ?? ''}`}
        </span>
        <span className="lead-status lead-status-badge">
            <Select options={LEAD_STATE_OPTIONS} value={lead.lead_state} onChange={(val) => console.log(val)} />
        </span>
        <span className="lead-date">{`${new Date(lead.created_at ?? lead.created_at).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' }).replace('.', '')}`}</span>
    </div>
}