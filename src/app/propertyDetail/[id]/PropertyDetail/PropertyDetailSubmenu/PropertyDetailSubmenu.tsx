'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import './PropertyDetailSubmenu.scss';

interface SubmenuItem {
  id: string;
  label: string;
}

interface PropertyDetailSubmenuProps {
  items?: SubmenuItem[];
  activeItemId?: string;
  onItemClick?: (itemId: string) => void;
  className?: string;
  style?: CSSProperties;
}

const iconFavorite = '/icons/corazon.svg';
const iconShare = 'https://www.figma.com/api/mcp/asset/d664cf1d-8bd3-4688-aee1-e64843854396';

const defaultItems: SubmenuItem[] = [
  { id: 'fotos', label: 'Fotos' },
  { id: 'descripcion', label: 'Descripción' },
  { id: 'amenities', label: 'Información' },
  { id: 'direccion', label: 'Dirección' },
];

export default function PropertyDetailSubmenu({
  items = defaultItems,
  activeItemId,
  onItemClick,
  className = '',
  style,
}: PropertyDetailSubmenuProps) {
  const [internalActive, setInternalActive] = useState(items[0]?.id || '');
  const currentActive = activeItemId ?? internalActive;

  const handleItemClick = (itemId: string) => {
    setInternalActive(itemId);
    onItemClick?.(itemId);
  };

  return (
    <div className={`property-detail-submenu ${className}`.trim()} style={style}>
      <div className="property-detail-submenu-left">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`property-detail-submenu-item ${currentActive === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="property-detail-submenu-right">
        <button type="button" className="property-detail-submenu-action">
          <img src={iconFavorite} alt="" aria-hidden="true" />
          <span>Favoritos</span>
        </button>
        <button type="button" className="property-detail-submenu-action">
          <img src={iconShare} alt="" aria-hidden="true" />
          <span>Compartir</span>
        </button>
      </div>
    </div>
  );
}
