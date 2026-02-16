'use client';

import { useState } from 'react';
import './Highlights.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import Select from '@/ui/Select/Select';

const iconArrowBack = '/icons/arrow.svg';

const highlightDescription =
  'Los productos se actualizarán automáticamente según las adquisiciones y usos.';

const branchOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'galas', label: 'Estudio Galas' },
  { value: 'galas-2', label: 'Estudio Galas 2' },
];

const highlightData = [
  {
    id: 'galas',
    name: 'Estudio Galas',
    products: [
      { name: 'Premium', purchased: 4, available: 0, active: 4 },
      { name: 'Destacados', purchased: 12, available: 1, active: 11 },
      { name: 'Simple', purchased: 120, available: 64, active: 127 },
    ],
  },
  {
    id: 'galas-2',
    name: 'Nombre de la sucursal 2',
    products: [
      { name: 'Premium', purchased: 4, available: 0, active: 4 },
      { name: 'Destacados', purchased: 12, available: 1, active: 11 },
      { name: 'Simple', purchased: 120, available: 64, active: 127 },
    ],
  },
];

export default function Highlights() {
  const [showMenu, setShowMenu] = useState(false);
  const [branchFilter, setBranchFilter] = useState('todas');

  const filteredBranches =
    branchFilter === 'todas'
      ? highlightData
      : highlightData.filter((branch) => branch.id === branchFilter);

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`highlights-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="highlights-mobile-header">
          <button
            className="highlights-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Destaques</span>
          </button>
        </div>

        <div className="highlights-content">
          <div className="highlights-header">
            <div>
              <h1>Destaques</h1>
              <h2>Productos disponibles</h2>
              <p>{highlightDescription}</p>
            </div>
          </div>

          <div className="highlights-filter">
            <label className="highlights-label">Sucursal</label>
            <Select
              label="Sucursal"
              placeholder="Todas"
              value={branchFilter}
              onChange={(value) => setBranchFilter(value)}
              options={branchOptions}
            />
          </div>

          <div className="highlights-list">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="highlights-card">
                <h3>{branch.name}</h3>
                <div className="highlights-table">
                  <div className="highlights-row highlights-row-header">
                    <span>Productos</span>
                    <span>Comprados</span>
                    <span>Disponibles</span>
                    <span>Activos</span>
                  </div>
                  {branch.products.map((product) => (
                    <div key={product.name} className="highlights-row">
                      <span>{product.name}</span>
                      <span>{product.purchased}</span>
                      <span>{product.available}</span>
                      <span>{product.active}</span>
                    </div>
                  ))}
                </div>
                <div className="highlights-progress">
                  <div className="highlights-progress-bar" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
