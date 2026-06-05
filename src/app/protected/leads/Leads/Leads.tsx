'use client';

import { useState } from 'react';
import './Leads.scss';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import InputField2 from '@/ui/InputField2/InputField2';
import SubmenuLeads from './Submenu/Submenu';
import Checkbox from '@/ui/Checkbox/Checkbox';
import { LeadContactType } from '@/types/propiedad';
import LeadItem from './Lead/Lead';
import { Lead } from '@/types/propiedad';

const iconArrowBack = '/icons/arrow.svg';

const LIMIT = 10;
export default function Leads() {
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryEmail, setSearchQueryEmail] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [searchEmail, setSearchEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("1");
  const [activeSubmenu, setActiveSubmenu] = useState<'entrada' | 'destacados' | 'eliminados' | 'bloqueados'>('entrada');
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      Promise.all(ids.map(id => apiFetch(`${API_BASE_URL}/leads/${id}`, { method: 'PATCH', body: { deleted: true, highlighted: false } }))),
    onSuccess: () => {
      setSelectedLeadIds([]);
      setDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() === '') {
      setSearchId(null);
    }
  };

  const handleSearchById = () => {
    const trimmed = searchQuery.trim();
    const num = Number(trimmed);
    if (trimmed && !Number.isNaN(num) && num > 0) {
      setSearchId(num);
    }
  };

  const handleSearchByEmail = () => {
    const trimmed = searchQueryEmail.trim();
    if (trimmed) {
      setSearchEmail(trimmed);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchById();
  };
  
  const { data: contactosData } = useQuery<any>({
    queryKey: ['leads', activeSubmenu, currentPage, searchId, searchEmail],
    queryFn: async () => {
      if (activeSubmenu === 'destacados') {
        return apiFetch(`${API_BASE_URL}/leads/search?highlighted=true&offset=${currentPage}&limit=${LIMIT}`);
      }
      if (activeSubmenu === 'eliminados') {
        return apiFetch(`${API_BASE_URL}/leads/search?deleted=true&offset=${currentPage}&limit=${LIMIT}`);
      }
      if (activeSubmenu === 'bloqueados') {
        return apiFetch(`${API_BASE_URL}/leads/search?blocked=true&offset=${currentPage}&limit=${LIMIT}`);
      }
      // entrada — default, supports search filters
      let searchParams = '';
      if (searchId !== null) {
        searchParams = `/search?property_id=${searchId}`;
      }
      if (searchEmail !== null) {
        searchParams = searchParams === '' ? `/search?email=${searchEmail}` : `${searchParams}&email=${searchEmail}`;
      }
      return apiFetch(`${API_BASE_URL}/leads${searchParams ? `${searchParams}&offset=${currentPage}&limit=${LIMIT}` : `?offset=${currentPage}&limit=${LIMIT}`}`);
    },
    staleTime: 5 * 60 * 1000,
  });


  const rawData: any = contactosData;
  const allContactos: Lead[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const contactTypeFilter = activeTab === "1" ? LeadContactType.MESSAGE : activeTab === "2" ? LeadContactType.SAW_CONTACT : LeadContactType.WHATSAPP;
  const contactos: Lead[] = allContactos.filter((lead) =>
    lead.contact_type === contactTypeFilter &&
    (activeSubmenu === 'eliminados' ? lead.deleted : !lead.deleted)
  );
  const total: number = rawData?.total ?? allContactos.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <SubmenuLeads active={showMenu} onItemChange={(id) => { setActiveSubmenu(id); setCurrentPage(0); }} />
      <div className={`leads-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="leads-mobile-header">
          <button
            className="leads-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Interesados</span>
          </button>
        </div>

        <div className="leads-content">
          <div className="leads-filter">
            <Checkbox
              label=""
              checked={contactos.length > 0 && contactos.every(l => selectedLeadIds.includes(l.id!))}
              onChange={(val) => {
                if (val) {
                  setSelectedLeadIds(contactos.map(l => l.id!));
                } else {
                  setSelectedLeadIds([]);
                }
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
            <InputField2
              placeholder="ID / Título"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
              iconPosition="right"
              onIconClick={handleSearchById}
            />
          </div>

          <div className="leads-list-container">
            <div className="leads-header">
              <div className="leads-tabs">
                <button
                  type="button"
                  className={`leads-tab ${activeTab === "1" ? 'active' : ''}`}
                  onClick={() => setActiveTab("1")}
                >
                  Mensajes
                </button>
                <button
                  type="button"
                  className={`leads-tab ${activeTab === "2" ? 'active' : ''}`}
                  onClick={() => setActiveTab("2")}
                >
                  Telefono
                </button>
                <button
                  type="button"
                  className={`leads-tab ${activeTab === "3" ? 'active' : ''}`}
                  onClick={() => setActiveTab("3")}
                >
                  Whatsapp
                </button>
              </div>
              <div className='leads-paginator'>
                
                <span className="leads-paginator-label">
                  {total > 0
                    ? `${currentPage * LIMIT + 1} - ${Math.min((currentPage + 1) * LIMIT, total)} de ${total}`
                    : '0 - 0 de 0'}
                </span>
                <button
                  type="button"
                  className="leads-paginator-btn"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => p - 1)}
                  aria-label="Página anterior"
                >
                  <img src="/icons/chevron_blue.svg" alt="" style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button
                  type="button"
                  className="leads-paginator-btn"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(p => p + 1)}
                  aria-label="Página siguiente"
                >
                  <img src="/icons/chevron_blue.svg" alt="" />
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
                    if (val) {
                      setSelectedLeadIds(prev => [...prev, lead.id!]);
                    } else {
                      setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                    }
                  }}
                />
              ))}
          </div>
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
  </div>
  );
}
