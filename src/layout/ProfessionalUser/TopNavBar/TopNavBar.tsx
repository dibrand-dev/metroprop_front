'use client';

import './TopNavBar.scss';
import TopUserMenu from '@/layout/TopUserMenu/TopUserMenu';
import { useSession } from 'next-auth/react';

const logoMetroprop = "/images/metroprop.svg";
interface TopNavBarProps {
  menuItems?: { label: string; link: string }[];
}

export default function TopNavBar({ 
  menuItems = [{label:'Mis publicaciones', link: '/protected/myProperties'}, {label: 'Interesados', link: '/protected/leads'}],
}: TopNavBarProps) {
  const { data: sessionData } = useSession();
  const isRole4 = (sessionData?.user as any)?.role_id === 4;
  return (
    <header className="topnavbar-container">
      {/* Left Section - Menu Dropdowns */}
      <nav className="topnavbar-nav">
        <div className="topnavbar-menu-items">
          {!isRole4 && menuItems.map((item, index) => (
            <button key={index} className="topnavbar-dropdown">
              <a href={item.link}>{item.label}</a>
            </button>
          ))}
        </div>

        {/* Logo */}
        <div className="topnavbar-logo">
          <a href="/"><img src={logoMetroprop} alt="MetroProp Logo" /></a>
        </div>
        <TopUserMenu />
      </nav>
    </header>
  );
}
