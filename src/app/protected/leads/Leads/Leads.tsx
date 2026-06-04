'use client';

import { useState } from 'react';
import './Leads.scss';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
// import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import InputField2 from '@/ui/InputField2/InputField2';
import SubmenuLeads from './Submenu/Submenu';
import Checkbox from '@/ui/Checkbox/Checkbox';
import Select from '@/ui/Select/Select';
import { LEAD_STATE_OPTIONS, LeadContactType } from '@/types/propiedad';
import LeadItem from './Lead/Lead';
import { Lead } from '@/types/propiedad';
// import { CreateProperty } from '@/types/propiedad';

const iconArrowBack = '/icons/arrow.svg';


const LIMIT = 20;
export default function Leads() {
  // const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryEmail, setSearchQueryEmail] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [searchEmail, setSearchEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("1");
  const [activeSubmenu, setActiveSubmenu] = useState<'entrada' | 'destacados' | 'eliminados' | 'bloqueados'>('entrada');
  // const [deleteModal, setDeleteModal] = useState<{ open: boolean; name: string | null; propertyId: number; leadId: number }>({ open: false, name: null, propertyId: 0, leadId: 0 });
/*
  const deleteMutation = useMutation({
    mutationFn: (organizationId: number) =>
      apiFetch(`${API_BASE_URL}/organizations/${organizationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      setDeleteModal({ open: false, name: null, propertyId: 0, leadId: 0 });
      queryClient.invalidateQueries({ queryKey: ['all-organizations'] });
    },
  });
  */

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() === '') {
      setSearchId(null);
    }
  };

  const handleSearchInputChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQueryEmail(val);
    if (val.trim() === '') {
      setSearchEmail(null);
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

  const handleSearchKeyDownEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearchByEmail();
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
  const contactos: Lead[] = allContactos.filter((lead) => lead.contact_type === contactTypeFilter);
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
              checked={true}
              onChange={() => {}}
            />
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
                1 - 10
              </div>
            </div>
            <div className="leads-list">
              {contactos.map((lead) => <LeadItem key={lead.id} lead={lead} />)}
          </div>
        </div>

        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => { setCurrentPage(page); }}
        />
      </div>

      {/*deleteModal.open && (
        <AreYouSureModal
          title="Eliminar Contacto"
          subTitle={`¿Está seguro que desea eliminar el contacto de ${deleteModal.name}?`}
          text="Todos los datos del contacto se eliminarán permanentemente."
          icon="/icons/trash.svg"
          onCancel={() => setDeleteModal({ open: false, name: null, propertyId: 0, leadId: 0 })}
          onAccept={() => { if (deleteModal.leadId) deleteMutation.mutate(deleteModal.leadId); }}
          acceptText={deleteMutation.isPending ? 'Eliminando...' : 'Aceptar'}
        />
      )*/}
    </div>
  </div>
  );
}
