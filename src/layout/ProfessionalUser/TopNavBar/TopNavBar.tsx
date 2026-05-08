'use client';

import './TopNavBar.scss';
import TopUserMenu from '@/layout/TopUserMenu/TopUserMenu';

const logoMetroprop = "/images/metroprop.svg";
interface TopNavBarProps {
  menuItems?: { label: string; link: string }[];
}

export default function TopNavBar({ 
  menuItems = [{label:'Mis publicaciones', link: '/protected/myProperties'}, {label: 'Interesados', link: '/protected/interested'}],
}: TopNavBarProps) {
  
  return (
    <header className="topnavbar-container">
      {/* Left Section - Menu Dropdowns */}
      <nav className="topnavbar-nav">
        <div className="topnavbar-menu-items">
          {menuItems.map((item, index) => (
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
