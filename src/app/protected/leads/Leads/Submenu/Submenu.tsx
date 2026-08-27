'use client';

import { useState } from 'react';
import './Submenu.scss';
import Select from '@/ui/Select/Select';

const iconChevron = "/icons/chevron_blue.svg";

interface SubmenuItem {
  id: 'entrada' | 'destacados' | 'eliminados' | 'bloqueados';
  label: string;
}

interface SubmenuProps {
  active: boolean;
  onItemChange?: (id: SubmenuItem['id']) => void;
}

const items: SubmenuItem[] = [
  { id: 'entrada', label: 'Bandeja de entrada' },
  { id: 'destacados', label: 'Destacados' },
  { id: 'eliminados', label: 'Eliminados'},
  //{ id: 'bloqueados', label: 'Bloqueados'}
];

export default function SubmenuLeads({ active, onItemChange }: SubmenuProps) {
  
  const [activeItemId, setActiveItemId] = useState<'entrada' | 'destacados' | 'eliminados' | 'bloqueados'>('entrada');

  const handleDropdownChange = (id: SubmenuItem['id']) => {
    setActiveItemId(id);
    onItemChange?.(id);
  };

  return (
    <>
      <div className="submenu-dropdown-mobile">
        <Select 
          value={activeItemId}
          onChange={(value) => {
            handleDropdownChange(value as any);
          }}
          options={items.map((item) => ({ value: item.id, label: item.label }))}
        />
      </div>
      <div className={`submenu-container ${active ? 'submenu-active' : ''}`}>
        {items.map((item) => {
          const isActive = activeItemId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveItemId(item.id); onItemChange?.(item.id); }}
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
    </>
  );
}
