'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import './TopUserMenu.scss';
import Button from '@/ui/Button/Button';

const chevronIcon = "/icons/chevron-up.svg";
const contactosIcon = "/icons/message.svg";
const favoritosIcon ="/icons/heart.svg";
const alertasIcon ="/icons/bell.svg";
const publicacionesIcon ="/icons/publicaciones.svg";
const cuentaIcon ="/icons/user.svg";

interface MenuItemType {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  isLogout?: boolean;
}

interface AppUser {
  id?: number | string;
  email: string;
  name: string;
}

export default function TopUserMenu() {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [user, setUser] = useState<AppUser | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (sessionData?.user?.email) {
          const sessionUser = sessionData.user as { id?: string; email: string; name?: string | null };
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.name || sessionUser.email,
          });
          return;
        }
      } catch (error) {
        console.error('Error loading NextAuth session:', error);
      }

      setUser(null);
    };

    loadUser();
  }, [sessionData]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');

    await fetch('/api/auth/clear-cookie', {
      method: 'POST',
      credentials: 'include',
    }).catch(err => console.error('Error clearing cookie:', err));

    await signOut({
      redirect: false,
    }).catch(err => console.error('Error signing out from NextAuth:', err));

    setUser(null);
    setShowUserDropdown(false);
    router.push('/');
    router.refresh();
  };

  const handlePublish = () => {
    router.push('/protected/publish');
  };

  const menuItems: MenuItemType[] = [
    {
      id: 'contactos',
      label: 'Contactos',
      icon: contactosIcon,
      href: '/protected/contacts'
    },
    {
      id: 'favoritos',
      label: 'Favoritos',
      icon: favoritosIcon,
      href: '/protected/favorites'
    },
    {
      id: 'alertas',
      label: 'Búsquedas y alertas',
      icon: alertasIcon,
      href: '/profile/alerts'
    },
    {
      id: 'publicaciones',
      label: 'Mis publicaciones',
      icon: publicacionesIcon,
      href: '/protected/myProperties'
    },
    {
      id: 'cuenta',
      label: 'Mi cuenta',
      icon: cuentaIcon,
      href: '/protected/profile'
    },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      onClick: () => {
        void handleLogout();
      },
      isLogout: true
    }
  ];

  return sessionStatus === "unauthenticated" ? (    
    <Button
      label="Ingresar"
      type="button"
      variant="primary"
      buttonType="2"
      state="default"                 
      fullWidth={false}
      size="medium"
      onClick={() => router.push('/login')}
    /> 
  ) : (
    <div className="header-logged-in-menu">     
      {showUserDropdown && (
        <button
          type="button"
          className="header-user-menu-overlay"
          aria-label="Cerrar menu de usuario"
          onMouseDown={(event) => {
            event.preventDefault();
            setShowUserDropdown(false);
          }}
        />
      )}
      <Button
        label="Publicar"
        type="button"
        variant="primary"
        buttonType="1"
        state="default"                 
        fullWidth={false}
        size="medium"
        onClick={handlePublish}
      /> 

      <button className="header-notification-button" title="Notificaciones">
        <img src="/icons/iconoir_bell.svg" alt="Notificaciones" />
      </button>

      <div className="header-avatar-wrapper">
        <button
          className="header-avatar-button"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          title={user?.name}
        >
          <div className="header-avatar">
            {getInitials(user?.name || '')}
          </div>
          <img src={chevronIcon} alt="" className="header-avatar-chevron" />
        </button>

        {showUserDropdown && (
          <div className="header-user-dropdown-menu">
            <div className="header-dropdown-publish-wrapper">
              <button
                className="header-dropdown-publish-button"
                onClick={handlePublish}
                title="Publicar"
              >
                Publicar
              </button>
            </div>

            <div className="header-dropdown-user-header">
              <div className="header-dropdown-avatar">
                {getInitials(user?.name || '')}
              </div>
              <div className="header-dropdown-user-info">
                <p className="header-dropdown-user-name">{user?.name}</p>
                <p className="header-dropdown-user-email">{user?.email}</p>
              </div>
            </div>

            <div className="header-dropdown-items">
              {menuItems.map((item) => (
                item.isLogout ? (
                  <button
                    key={item.id}
                    className="header-dropdown-item header-dropdown-logout"
                    onClick={item.onClick}
                  >
                    {item.icon && <div className="header-dropdown-item-icon">
                      <img src={item.icon} alt={item.label} />
                    </div>}
                    <span className="header-dropdown-item-label">{item.label}</span>
                  </button>
                ) : (
                  <a
                    key={item.id}
                    href={item.href}
                    className="header-dropdown-item"
                  >
                    {item.icon && <div className="header-dropdown-item-icon">
                      <img src={item.icon} alt={item.label} />
                    </div>}
                    <span className="header-dropdown-item-label">{item.label}</span>
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
