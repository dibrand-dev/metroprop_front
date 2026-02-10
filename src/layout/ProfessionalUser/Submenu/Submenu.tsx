'use client';

import { useState } from 'react';
import './Submenu.scss';

const iconChevron = "/icons/chevron-up.svg";

interface SubmenuItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SubmenuProps {
  onItemClick?: (itemId: string) => void;
  active: boolean,
  
}

const items: SubmenuItem[] = [
  { id: 'datos', label: 'Datos de inmobiliaria', href: "/protected/professionalProfile" },
  { id: 'ubicacion', label: 'Sucursales', href: "/protected/professionalProfile" },
  { id: 'destaques', label: 'Destaques', href: "/protected/professionalProfile" },
  { id: 'colaboradores', label: 'Colaboradores', href: "/protected/professionalProfile" },
];

export default function Submenu({ onItemClick, active }: SubmenuProps) {
  const [activeItemId, setActiveItemId] = useState<string>("");
  const handleItemClick = (item: SubmenuItem) => {
    if (onItemClick) {
      onItemClick(item.id);
      setActiveItemId(item.id);
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div className={`submenu-container ${active ? 'submenu-active' : ''}`}>
      <p className="submenu-header-mobile">Inmobiliaria</p>
      {items.map((item) => {
        const isActive = activeItemId === item.id;
        const Component = item.href ? 'a' : 'button';

        return (
          <Component
            key={item.id}
            href={item.href}
            className={`submenu-item ${isActive ? 'submenu-item-active' : 'submenu-item-inactive'}`}           
          >
            <div className="submenu-item-label">
              <span>{item.label}</span>
            </div>
            <img src={iconChevron} alt="chevron" className="submenu-item-chevron" />
          </Component>
        );
      })}
    </div>
  );
}
