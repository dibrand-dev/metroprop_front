'use client';

import { useState } from 'react';
import './Submenu.scss';

const iconChevron = "/icons/chevron_blue.svg";

interface SubmenuItem {
  id: 'entrada' | 'destacados' | 'eliminados' | 'bloqueados';
  label: string;
}

interface SubmenuProps {
  active: boolean;  
}

const items: SubmenuItem[] = [
  { id: 'entrada', label: 'Bandeja de entrada' },
  { id: 'destacados', label: 'Destacados' },
  { id: 'eliminados', label: 'Eliminados'},
  { id: 'bloqueados', label: 'Bloqueados'}
];

export default function SubmenuLeads({ active }: SubmenuProps) {
  
  const [activeItemId, setActiveItemId] = useState<'entrada' | 'destacados' | 'eliminados' | 'bloqueados'>('entrada');

  return (
    <div className={`submenu-container ${active ? 'submenu-active' : ''}`}>
      <p className="submenu-header-mobile">aa</p>
      {items.map((item) => {
        const isActive = activeItemId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveItemId(item.id)}
            className={`submenu-item ${isActive ? 'submenu-item-active' : 'submenu-item-inactive'}`}
          >
            <div className="submenu-item-label">
              <span>{item.label}</span>
            </div>
            <img src={iconChevron} alt="chevron" className="submenu-item-chevron" />
          </button>
        );
      })}
    </div>
  );
}
