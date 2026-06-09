'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { Lead, LeadContactType, OPERATION_TYPE_LABELS } from '@/types/propiedad';
import LeadItem from '../Leads/Lead/Lead';
import '../Leads/Leads.scss';

const iconArrowBack = '/icons/arrow.svg';
const LIMIT = 20;

export default function PropertyLeads({ propertyId }: { propertyId: number }) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState('1');
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      Promise.all(ids.map(id => apiFetch(`${API_BASE_URL}/leads/${id}`, { method: 'PATCH', body: { deleted: true } }))),
    onSuccess: () => {
      setSelectedLeadIds([]);
      setDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['property-leads', propertyId] });
    },
  });

  const { data: contactosData } = useQuery<any>({
    queryKey: ['property-leads', propertyId, currentPage],
    queryFn: () =>
      apiFetch(`${API_BASE_URL}/leads/search?property_id=${propertyId}&offset=${currentPage}&limit=${LIMIT}`),
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
  console.log("contactos", contactos)

  const property = allContactos[0]?.property as any;

  return (
    <div className="professionalContainer activeMenuMobile">
      <div className="leads-container">
        {/* Back + property info */}
        <div className="property-leads-header">
          <Link prefetch={false}  href="/protected/leads" className="leads-back-button">
            <img src={iconArrowBack} alt="Volver" />
            <span>Interesados</span>
          </Link>
          {property && (
            <div className="property-leads-info">
              {property.title && (
                <span className="property-leads-title">{property.title}</span>
              )}
              {property.street && (
                <span className="property-leads-street">{property.street}</span>
              )}
              {property.operation_type && (
                <span className="property-leads-operation">
                  {OPERATION_TYPE_LABELS[property.operation_type as keyof typeof OPERATION_TYPE_LABELS]}
                </span>
              )}
              {(property.currency || property.price) && (
                <span className="property-leads-price">
                  {property.currency} {property.price}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="leads-content">
          <div className="leads-filter">
            <Checkbox
              label=""
              checked={contactos.length > 0 && contactos.every(l => selectedLeadIds.includes(l.id!))}
              onChange={(val) => {
                if (val) setSelectedLeadIds(contactos.map(l => l.id!));
                else setSelectedLeadIds([]);
              }}
            />
            <button
              className=""
              type="button"
              aria-label="Eliminar contacto"
              onClick={() => { if (selectedLeadIds.length > 0) setDeleteModalOpen(true); }}
            >
              <img src="/icons/trash.svg" alt="" />
            </button>
          </div>

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
