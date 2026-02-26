'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Branches.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';

const iconArrowBack = '/icons/arrow.svg';
const iconEditPencil = '/icons/pencil.svg';

const branchDescription =
  'Acá podes editar los datos de tus sucursales, activarlas y /o desactivarlas y agregar nuevas';

const initialBranches = [
  {
    id: '17010603',
    name: 'Estudio GALAS',
    listings: '9421 avisos',
    collaborators: '3 colaboradores',
    active: true,
  },
];

export default function Branches() {
  const [showMenu, setShowMenu] = useState(false);
  const [branches, setBranches] = useState(initialBranches);
  const router = useRouter();

  const handleToggle = (id: string, nextValue: boolean) => {
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === id ? { ...branch, active: nextValue } : branch
      )
    );
  };

  const handleEdit = (id: string) => {
    router.push(`/protected/branchForm/${id}`);
  };

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`branches-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="branches-mobile-header">
          <button
            className="branches-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Sucursales</span>
          </button>
        </div>

        <div className="branches-content">
          <div className="branches-header">
            <div>
              <h1>Sucursales</h1>
              <p>{branchDescription}</p>
            </div>
            <button className="branches-add-button" type="button" disabled>
              Agregar sucursal
            </button>
          </div>

          <div className="branches-list">
            {branches.map((branch) => (
              <div key={branch.id} className="branches-card">
                <div className="branches-card-info">
                  <p className="branches-card-title">
                    {branch.name} - Sucursal: {branch.id}
                  </p>
                  <div className="branches-card-meta">
                    <span>{branch.listings}</span>
                    <span>{branch.collaborators}</span>
                  </div>
                </div>
                <div className="branches-card-actions">
                  <div className="branches-card-status">
                    <SwitchToggle
                      checked={branch.active}
                      onChange={(nextValue) => handleToggle(branch.id, nextValue)}
                      ariaLabel={`Cambiar estado de ${branch.name}`}
                    />
                    <span className="branches-status-chip">Activa</span>
                  </div>
                  <button
                    className="branches-card-edit"
                    type="button"
                    aria-label="Editar sucursal"
                    onClick={() => handleEdit(branch.id)}
                  >
                    <img src={iconEditPencil} alt="" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="branches-mobile-footer">
          <button className="branches-add-button" type="button" disabled>
            Agregar sucursal
          </button>
        </div>
      </div>
    </div>
  );
}
