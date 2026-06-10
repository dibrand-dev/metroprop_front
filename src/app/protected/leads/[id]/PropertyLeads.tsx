'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL, setImagePath } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import { Lead, LeadContactType, OPERATION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/types/propiedad';
import LeadItem from '../Leads/Lead/Lead';
import '../Leads/Leads.scss';
import LeadsFilter from '../Leads/LeadsFilter/LeadsFilter';

const iconArrowBack = '/icons/chevron-up.svg';
const LIMIT = 20;

export default function PropertyLeads({ propertyId }: { propertyId: number }) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState('1');
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      Promise.all(ids.map(id => apiFetch(`${API_BASE_URL}/leads/${id}`, { method: 'PATCH', body: { deleted: true } }))),
    onSuccess: () => {
      setSelectedLeadIds([]);
      setDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['property-leads', propertyId] });
    },
  });
console.log("search", search)
  const { data: contactosData } = useQuery<any>({
    queryKey: ['leads', propertyId, currentPage, search],
    queryFn: async () => {
      let searchParams = '';
      if (search !== null) {
        searchParams = `&search=${search}`;
      }
      return apiFetch(`${API_BASE_URL}/leads/search?property_id=${propertyId}${searchParams}&offset=${currentPage}&limit=${LIMIT}`)
    },
    staleTime: 5 * 60 * 1000,
  });

  const rawData: any = contactosData;
  const allContactos: Lead[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const contactTypeFilter =
    activeTab === '1' ? LeadContactType.MESSAGE
    : activeTab === '2' ? LeadContactType.SAW_CONTACT
    : LeadContactType.WHATSAPP;
  const contactos = allContactos.filter(l => l.contact_type === contactTypeFilter && !l.deleted);
  const total: number = rawData?.total ?? allContactos.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const property = allContactos[0]?.property as any;

  return (
    <div className="professionalContainer activeMenuMobile">
      <div className="leads-container property-leads">
        {/* Back + property info */}
        <div className="property-leads-header">
          <Link prefetch={false}  href="/protected/myProperties" className="leads-back-button">
            <img src={iconArrowBack} alt="Volver" />
            <span>Volver a mis publicaciones</span>
          </Link>
          {property && (
            <div className="property-leads-info">
              {property.images?.[0]?.url && (
                <img
                  src={setImagePath(property.images[0].url)} 
                />
              )}
              {property.property_type && (
                <span className="property-leads-type">{PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS]}</span>
              )}
              {property.publication_title && (
                <span className="property-leads-title">{property.publication_title}</span>
              )}
              {property.street && (
                <span className="property-leads-street">{property.street}</span>
              )}             
            </div>
          )}
        </div>

        <div className="leads-content">
          <LeadsFilter
            allChecked={contactos.length > 0 && contactos.every(l => selectedLeadIds.includes(l.id!))}
            onCheckAll={(val) => {
              if (val) setSelectedLeadIds(contactos.map(l => l.id!));
              else setSelectedLeadIds([]);
            }}
            onDeleteClick={() => { if (selectedLeadIds.length > 0) setDeleteModalOpen(true); }}
            setSearch={setSearch}
          />

          <div className="leads-list-container">
            <div className="leads-header">
              <div className="leads-tabs">
                <button
                  type="button"
                  className={`leads-tab ${activeTab === '1' ? 'active' : ''}`}
                  onClick={() => setActiveTab('1')}
                >
                  Mensajes
                </button>
                <button
                  type="button"
                  className={`leads-tab ${activeTab === '2' ? 'active' : ''}`}
                  onClick={() => setActiveTab('2')}
                >
                  Telefono
                </button>
                <button
                  type="button"
                  className={`leads-tab ${activeTab === '3' ? 'active' : ''}`}
                  onClick={() => setActiveTab('3')}
                >
                  Whatsapp
                </button>
              </div>
            </div>
            <div className="leads-list">
              {contactos.length === 0 ? (
                <p className="leads-empty">No hay mensajes</p>
              ) : contactos.map((lead) => (
                <LeadItem
                  key={lead.id}
                  lead={lead}
                  checked={selectedLeadIds.includes(lead.id!)}
                  onCheckedChange={(val) => {
                    if (val) setSelectedLeadIds(prev => [...prev, lead.id!]);
                    else setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                  }}
                />
              ))}
            </div>
          </div>

          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {deleteModalOpen && (
        <AreYouSureModal
          title="Eliminar"
          subTitle={`Vas a eliminar ${selectedLeadIds.length} contacto${selectedLeadIds.length !== 1 ? 's' : ''}`}
          text="¿Estás seguro?"
          icon="/icons/trash.svg"
          onCancel={() => setDeleteModalOpen(false)}
          onAccept={() => deleteMutation.mutate(selectedLeadIds)}
          acceptText={deleteMutation.isPending ? 'Eliminando...' : 'Aceptar'}
        />
      )}
    </div>
  );
}
