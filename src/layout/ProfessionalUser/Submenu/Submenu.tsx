'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  { id: 'datos', label: 'Datos de inmobiliaria', href: "/protected/profile" },
  { id: 'ubicacion', label: 'Sucursales', href: "/protected/branches" },
  { id: 'destaques', label: 'Destaques', href: "/protected/highlights" },
  { id: 'colaboradores', label: 'Colaboradores', href: "/protected/collaborators" },
  { id: 'partners', label: 'Partners', href: "/protected/partners" },
];

function getUserRoleId(user: any): number | null {
  if (!user?.organization) return null;
  const userId = String(user.id);
  for (const branch of user.organization.branches ?? []) {
    const found = (branch.users ?? []).find((u: any) => String(u.id) === userId);
    if (found) return found.role_id ?? null;
  }
  return null;
}

function getVisibleItems(roleId: number | null): SubmenuItem[] {
  if (roleId === 4) return items;
  if (roleId === 1) return items.filter((i) => i.id !== 'partners');
  return items.filter((i) => i.id === 'datos');
}

export default function Submenu({ active }: SubmenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const roleId = useMemo(() => getUserRoleId((session as any)?.user), [session]);
  const visibleItems = useMemo(() => getVisibleItems(roleId), [roleId]);

  const activeItemId = useMemo(() => {
    if (!pathname) return '';
    if (pathname.startsWith('/protected/branchForm')) return 'ubicacion';
    const matched = visibleItems.find((item) => item.href === pathname);
    return matched?.id ?? '';
  }, [pathname, visibleItems]);

  return (
    <div className={`submenu-container ${active ? 'submenu-active' : ''}`}>
      <p className="submenu-header-mobile">Inmobiliaria</p>
      {visibleItems.map((item) => {
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
