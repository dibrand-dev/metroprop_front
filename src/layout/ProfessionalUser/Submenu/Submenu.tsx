'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import './Submenu.scss';

const iconChevron = "/icons/chevron_blue.svg";

interface SubmenuItem {
  id: string
  label: string;
  href?: string;
  onClick?: () => void;
  roles?: number[];
}

interface SubmenuProps {
  active: boolean;  
}

const items: SubmenuItem[] = [
  { id: 'datos_inmobiliaria', label: 'Datos de inmobiliaria', href: "/protected/organization", roles: [1, 4] },
  { id: 'sucursales', label: 'Sucursales', href: "/protected/branches", roles: [1, 4] },
  { id: 'destaques', label: 'Destaques', href: "/protected/highlights", roles: [1, 4] },
  { id: 'colaboradores', label: 'Colaboradores', href: "/protected/collaborators", roles: [1, 4] },
  { id: 'datos', label: 'Datos', href: "/protected/profile", roles: [1, 2, 3, 4] },
  { id: 'cambiar_contraseña', label: 'Cambiar contraseña', href: "/protected/changePassword", roles: [1, 2, 3, 4] },
  { id: 'cambiar_email', label: 'Cambiar email', href: "/protected/changeEmail", roles: [1, 2, 3, 4] },
  { id: 'notificaciones', label: 'Notificaciones', href: "/protected/notifications", roles: [1, 2, 3, 4] },
  { id: 'eliminar_cuenta', label: 'Eliminar cuenta', href: "/protected/deleteAccount", roles: [1, 2, 3, 4] },
  { id: 'partners', label: 'Partners', href: "/protected/partners", roles: [4,1] },
];

function getUserRoleId(user: any): number | null {
  return user?.role_id ?? null;
}

export default function Submenu({ active }: SubmenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const roleId = useMemo(() => getUserRoleId((session as any)?.user), [session]);
  console.log("roleId", roleId)
  const visibleItems = useMemo(
    () => items.filter((item) => {
      if (!item.roles) return true;                        // no roles field → always visible
      if (item.roles.length === 0) return roleId === null; // empty array → only for roleless users
      return roleId !== null && item.roles.includes(roleId); // non-empty array → role must match
    }),
    [roleId]
  );

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
