'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './TopUserMenu.scss';

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

export default function TopUserMenu() {
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        // Check if user is logged in
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (authToken && userData) {
        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Error parsing user data:', error);
            setIsLoggedIn(false);
        }
        }
    }, []);

    const getInitials = (name: string): string => {
        return name
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        
        // Call API route to clear authentication cookie on server
        fetch('/api/auth/clear-cookie', {
        method: 'POST',
        credentials: 'include',
        }).catch(err => console.error('Error clearing cookie:', err));
        
        setIsLoggedIn(false);
        setUser(null);
        setShowUserDropdown(false);
        router.push('/');
    };

    const handlePublish = () => {
        // Navigate to publish/create listing page
        router.push('/create-listing');
    };

    const menuItems: MenuItemType[] = [
        {
            id: 'contactos',
            label: 'Contactos',
            icon: contactosIcon,
            href: '/profile/contacts'
        },
        {
            id: 'favoritos',
            label: 'Favoritos',
            icon: favoritosIcon,
            href: '/profile/favorites'
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
            href: '/profile/publications'
        },
        {
            id: 'cuenta',
            label: 'Mi cuenta',
            icon: cuentaIcon,
            href: '/profile/account'
        },
        {
            id: 'logout',
            label: 'Cerrar sesión',
            // icon: cuentaIcon,
            onClick: handleLogout,
            isLogout: true
        }
    ];

    return !isLoggedIn ? (
    <a className="header-button-primary" href="/login" title="Ingresar">
        <img src={chevronIcon} alt="" className="header-button-icon"  />
        <span>Ingresar</span>
    </a>
    ) : (
    <div className="header-logged-in-menu">
        {/* Publish Button */}
        <button 
            className="header-publish-button"
            onClick={handlePublish}
            title="Publicar propiedad"
        >
            <span>Publicar</span>
        </button>

        {/* Notification Icon */}
        <button className="header-notification-button" title="Notificaciones">
        <img src="/icons/iconoir_bell.svg" alt="Notificaciones" />
        </button>

        {/* User Avatar Dropdown */}
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
                {/* Publish Button in Dropdown */}
                <div className="header-dropdown-publish-wrapper">
                    <button 
                        className="header-dropdown-publish-button"
                        onClick={handlePublish}
                        title="Publicar"
                    >
                        Publicar
                    </button>
                </div>

                {/* User Info Header */}
                <div className="header-dropdown-user-header">
                    <div className="header-dropdown-avatar">
                        {getInitials(user?.name || '')}
                    </div>
                    <div className="header-dropdown-user-info">
                        <p className="header-dropdown-user-name">{user?.name}</p>
                        <p className="header-dropdown-user-email">{user?.email}</p>
                    </div>
                </div>

                {/* Menu Items */}
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
)}