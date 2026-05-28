'use client';

import { useState } from 'react';
import './Leads.scss';
// import { useRouter } from 'next/navigation';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
// import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';
// import AreYouSureModal from '@/components/AreYouSureModal/AreYouSureModal';
import Paginator from '@/components/Paginator/Paginator';
import InputField2 from '@/ui/InputField2/InputField2';
// import { CreateProperty } from '@/types/propiedad';

const iconArrowBack = '/icons/arrow.svg';
// const iconLock = '/icons/lock.svg';
//const iconEdit = '/icons/pencil.svg';
const iconTrash = '/icons/trash.svg';
const iconView = '/icons/verDetalle.svg';

type OrganizationAction = 'delete' | 'view';

const actionIcons: Record<OrganizationAction, { src: string; label: string }> = {
  // lock: { src: iconLock, label: 'Bloquear organización' },
  // edit: { src: iconEdit, label: 'Editar organización' },
  delete: { src: iconTrash, label: 'Eliminar organización' },
  view: { src: iconView, label: 'Ver propiedad' },
};

interface OrganizationItem {
  id: number;
  company_name: string;
  email: string;
  branchName: string;
  branchId: string;
  role_id: number | null;
  cuit: string | null;
  actions: OrganizationAction[];
}
const LIMIT = 20;
export default function Leads() {
  // const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryEmail, setSearchQueryEmail] = useState('');
  const [searchId, setSearchId] = useState<number | null>(null);
  const [searchEmail, setSearchEmail] = useState<string | null>(null);
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
    queryKey: ['leads', currentPage, searchId, searchEmail],
    queryFn: async () => {
      let searchParams = '';
      if (searchId !== null) {
        searchParams = `/search?property_id=${searchId}`;
      }
      if (searchEmail !== null) {
        searchParams = searchParams === '' ? `/search?email=${searchEmail}` : `${searchParams}&email=${searchEmail}`;
      }
      return apiFetch(`${API_BASE_URL}/leads${searchParams ? `${searchParams}&page=${currentPage}&limit=${LIMIT}` : `?page=${currentPage}&limit=${LIMIT}`}`);
    },
    staleTime: 5 * 60 * 1000,
  });


  const rawData: any = contactosData;
  const rawContactos: any[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);
  const total: number = rawData?.total ?? rawContactos.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const contactos: any[] = rawContactos.map((contacto: any) => ({
    id: contacto.id,
    name: contacto.lead?.name ?? contacto.lead?.name ?? '',
    email: contacto.lead?.email ?? contacto.lead?.email ?? '',
    phone: contacto.country_code && contacto.phone ? `${contacto.country_code} ${contacto.phone}` : contacto.lead?.country_code && contacto.lead?.phone ? `+${contacto.lead.country_code} ${contacto.lead.phone}` : '',
    date: contacto.created_at ? new Date(contacto.created_at).toLocaleDateString("es-ES") : '',
    property: contacto.property,    
    actions: [/*'delete',*/ 'view'] as OrganizationAction[],
  })) ?? [];
  console.log("contactos", contactos, "total", total, "totalPages", totalPages);
  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`collaborators-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="collaborators-mobile-header">
          <button
            className="collaborators-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Leads</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div>
              <h1>Leads</h1>
              <p>Aca podes ver la lista de contactos que los usuarios han hecho.</p>
            </div>
          </div>

          <div className="collaborators-filter">
            <InputField2
              placeholder="ID"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
              iconPosition="right"
              onIconClick={handleSearchById}
            />
            <InputField2
              placeholder="Email"
              value={searchQueryEmail}
              onChange={handleSearchInputChangeEmail}
              onKeyDown={handleSearchKeyDownEmail}
              icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
              iconPosition="right"
              onIconClick={handleSearchByEmail}
            />
          </div>

          <div className="collaborators-list">
            {contactos.map((contacto) => (
              <div key={contacto.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  <p className="collaborators-card-title">
                    {contacto.name} - {contacto.email} - {contacto.phone}
                  </p>
                  <p className="collaborators-card-subtitle">                    
                    {contacto.property.id} - {contacto.property.publication_title}<br /> 
                    {contacto.property.street}
                  </p>
                </div>
                <div className="collaborators-card-actions">
                  <span className="collaborators-role-chip">Fecha de contacto: {contacto.date ?? '-'}</span>
                  <div className="collaborators-card-tools">
                    {contacto.actions.map((action) => (
                      <button
                        key={action}
                        className="collaborators-action-button"
                        type="button"
                        aria-label={actionIcons[action].label}
                        title={actionIcons[action].label}
                        onClick={() => {
                          // if (action === 'edit') handleEdit(String(contacto.id));
                          // if (action === 'lock') { setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setLockModal({ open: true, userId: contacto.id, userName: contacto.name }); }
                          // if (action === 'delete') setDeleteModal({ open: true, name: contacto.name, propertyId: contacto.property.id, leadId: contacto.id });
                          if (action === 'view') window.open(`/propertyDetail/${contacto.property.id}`, '_blank');
                        }}
                      >
                        <img src={actionIcons[action].src} alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => { setCurrentPage(page); }}
        />

        <div className="collaborators-mobile-footer">
          {/*<button className="collaborators-add-button" type="button">
            Agregar colaborador
          </button>*/}
        </div>
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
  );
}
