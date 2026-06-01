'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import './PropertyDetailSubmenu.scss';
import { HeartIcon } from '@/utils/utils';

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
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  openShareModal?: () => void;
}

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
  isFavorite = false,
  onToggleFavorite,
  openShareModal
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
        <button
          type="button"
          className={`property-detail-submenu-action ${isFavorite ? 'is-favorite' : ''}`}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={isFavorite}
        >
          <HeartIcon isFavorite={isFavorite} />
          <span>{isFavorite ? 'En favoritos' : 'Agregar a favoritos'}</span>
        </button>
        <button type="button" className="property-detail-submenu-action" onClick={openShareModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none">
            <path d="M13.7599 18.15C13.0972 18.15 12.5349 17.9183 12.0729 17.455C11.6116 16.991 11.3809 16.4277 11.3809 15.765C11.3809 15.665 11.4249 15.4127 11.5129 15.008L4.3159 10.735C4.0999 10.9843 3.83557 11.18 3.5229 11.322C3.21024 11.464 2.87457 11.535 2.5159 11.535C1.85857 11.535 1.2999 11.301 0.839902 10.833C0.379902 10.365 0.149902 9.804 0.149902 9.15C0.149902 8.496 0.379902 7.935 0.839902 7.467C1.2999 6.999 1.85857 6.765 2.5159 6.765C2.8739 6.765 3.20957 6.836 3.5229 6.978C3.83624 7.12 4.10057 7.316 4.3159 7.566L11.5139 3.311C11.4672 3.18167 11.4336 3.05333 11.4129 2.926C11.3916 2.798 11.3809 2.66733 11.3809 2.534C11.3809 1.872 11.6132 1.309 12.0779 0.845001C12.5426 0.381668 13.1066 0.150002 13.7699 0.150002C14.4332 0.150002 14.9959 0.382335 15.4579 0.847002C15.9199 1.31167 16.1506 1.87567 16.1499 2.539C16.1492 3.20233 15.9176 3.765 15.4549 4.227C14.9922 4.689 14.4289 4.91967 13.7649 4.919C13.4036 4.919 13.0702 4.845 12.7649 4.697C12.4596 4.549 12.1996 4.35 11.9849 4.1L4.7859 8.373C4.83257 8.50233 4.86624 8.631 4.8869 8.759C4.90824 8.88634 4.9189 9.01667 4.9189 9.15C4.9189 9.28333 4.90824 9.41367 4.8869 9.541C4.86557 9.66833 4.83224 9.797 4.7869 9.927L11.9849 14.2C12.2002 13.95 12.4602 13.751 12.7649 13.603C13.0702 13.455 13.4036 13.381 13.7649 13.381C14.4276 13.381 14.9909 13.613 15.4549 14.077C15.9182 14.5423 16.1499 15.1067 16.1499 15.77C16.1499 16.4333 15.9176 16.996 15.4529 17.458C14.9882 17.92 14.4232 18.1507 13.7599 18.15ZM13.7649 17.15C14.1576 17.15 14.4866 17.0173 14.7519 16.752C15.0172 16.4867 15.1499 16.158 15.1499 15.766C15.1499 15.374 15.0172 15.045 14.7519 14.779C14.4866 14.513 14.1579 14.3803 13.7659 14.381C13.3739 14.3817 13.0449 14.5143 12.7789 14.779C12.5129 15.0437 12.3802 15.3723 12.3809 15.765C12.3816 16.1577 12.5142 16.4867 12.7789 16.752C13.0436 17.0173 13.3716 17.15 13.7649 17.15ZM2.5159 10.534C2.91324 10.534 3.24657 10.4013 3.5159 10.136C3.78457 9.87067 3.9189 9.542 3.9189 9.15C3.9189 8.758 3.78457 8.42933 3.5159 8.164C3.24724 7.89867 2.9139 7.766 2.5159 7.766C2.12857 7.766 1.80424 7.89867 1.5429 8.164C1.28157 8.42933 1.15057 8.758 1.1499 9.15C1.14924 9.542 1.28024 9.871 1.5429 10.137C1.80557 10.403 2.1299 10.5353 2.5159 10.534ZM13.7659 3.919C14.1579 3.919 14.4866 3.78633 14.7519 3.521C15.0172 3.25567 15.1499 2.92667 15.1499 2.534C15.1499 2.14133 15.0172 1.81267 14.7519 1.548C14.4866 1.28333 14.1579 1.15067 13.7659 1.15C13.3739 1.14933 13.0449 1.282 12.7789 1.548C12.5129 1.814 12.3802 2.143 12.3809 2.535C12.3816 2.927 12.5142 3.25567 12.7789 3.521C13.0436 3.78633 13.3726 3.919 13.7659 3.919Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3"/>
          </svg>
          <span>Compartir</span>
        </button>
      </div>
    </div>
  );
}
