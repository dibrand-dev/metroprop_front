'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import './Submenu.scss';
import Link from 'next/link';

const iconChevron = "/icons/chevron_blue.svg";

interface SubmenuItem {
  id: string
  label: string;
  href: string;
  roles?: number[];
}

interface SubmenuProps {
  active: boolean;
  onHide?: () => void;
}

const items: SubmenuItem[] = [
  { id: 'partners', label: 'Partners', href: "/protected/admin/partners", roles: [4] },
  { id: 'plans', label: 'Planes', href: "/protected/admin/plans", roles: [4] },
  { id: 'users', label: 'Usuarios', href: "/protected/admin/users", roles: [4] },
  { id: 'organizations', label: 'Inmobiliarias', href: "/protected/admin/organizations", roles: [4] },
  { id: 'all-properties', label: 'Todas las Propiedades', href: "/protected/admin/properties", roles: [4] },
  { id: 'datos_inmobiliaria', label: 'Datos de inmobiliaria', href: "/protected/admin/organization", roles: [1] },
  { id: 'sucursales', label: 'Sucursales', href: "/protected/admin/branches", roles: [1] },
  { id: 'destaques', label: 'Destaques', href: "/protected/admin/highlights", roles: [1] },
  { id: 'colaboradores', label: 'Colaboradores', href: "/protected/admin/collaborators", roles: [1] },
  // { id: 'leads', label: 'Interesados', href: "/protected/admin/leadsBack", roles: [1, 3] },
  { id: 'datos', label: 'Datos', href: "/protected/admin/profile", roles: [1, 2, 3, 4] },
  { id: 'cambiar_contraseña', label: 'Cambiar contraseña', href: "/protected/admin/changePassword", roles: [1, 2, 3, 4] },
  { id: 'cambiar_email', label: 'Cambiar email', href: "/protected/admin/changeEmail", roles: [1, 2, 3, 4] },
  { id: 'notificaciones', label: 'Notificaciones', href: "/protected/admin/notifications", roles: [1, 2, 3] },
  { id: 'eliminar_cuenta', label: 'Dar de baja avisos', href: "/protected/admin/deleteAccount", roles: [1, 2, 3] }
];

function getUserRoleId(user: any): number | null {
  return user?.role_id ?? null;
}

export default function Submenu({ active, onHide }: SubmenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const roleId = useMemo(() => getUserRoleId((session as any)?.user), [session]);
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

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`submenu-item ${isActive ? 'submenu-item-active' : 'submenu-item-inactive'}`}
            onClick={() => { if (isActive) onHide?.(); }}
          >
            <div className="submenu-item-label">
              <span>{item.label}</span>
            </div>
            <img src={iconChevron} alt="chevron" className="submenu-item-chevron" />
          </Link>
        );
      })}
    </div>
  );
}
