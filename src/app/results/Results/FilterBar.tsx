'use client';

import { useState } from 'react';

export default function FilterBar() {
  const [filters, setFilters] = useState({    
    location: 'Dirección, barrio, c...',
    price: 'Precio',
    rooms: 'Amb / Dorm',
  });

  return (
    <div className="filter-bar">
      <div className="filter-bar-container">
        <div className="filter-group">          

          <div className="filter-search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              placeholder={filters.location}
              className="filter-input"
            />
          </div>

          <button className="filter-dropdown">
            <span>Operación</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className="filter-dropdown">
            <span>{filters.price}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className="filter-dropdown">
            <span>{filters.rooms}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className="filter-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5h15M5 10h10M7.5 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Filtros</span>
            <span className="filter-badge">2</span>
          </button>
        </div>

        <button className="create-alert-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Crear Alerta
        </button>
      </div>
    </div>
  );
}
