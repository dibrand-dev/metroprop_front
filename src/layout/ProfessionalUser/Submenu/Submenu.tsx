'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import './Submenu.scss';

const iconChevron = "/icons/chevron_blue.svg";

interface SubmenuItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SubmenuProps {
  active: boolean;  
}

const items: SubmenuItem[] = [
  { id: 'datos', label: 'Datos de inmobiliaria', href: "/protected/professionalProfile" },
  { id: 'ubicacion', label: 'Sucursales', href: "/protected/branches" },
  { id: 'destaques', label: 'Destaques', href: "/protected/highlights" },
  { id: 'colaboradores', label: 'Colaboradores', href: "/protected/collaborators" },
];

export default function Submenu({ active }: SubmenuProps) {
  const pathname = usePathname();
  const activeItemId = useMemo(() => {
    if (!pathname) return '';
    if (pathname.startsWith('/protected/branchForm')) return 'ubicacion';
    const matched = items.find((item) => item.href === pathname);
    return matched?.id ?? '';
  }, [pathname]);

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
