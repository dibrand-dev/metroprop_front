'use client';

import './TopNavBar.scss';
import TopUserMenu from '@/layout/TopUserMenu/TopUserMenu';

const logoMetroprop = "/images/metropropLogo.png";
interface TopNavBarProps {
  menuItems?: string[];
}

export default function TopNavBar({ 
  menuItems = ['Mis publicaciones', 'Interesados'],
}: TopNavBarProps) {
  
  return (
    <header className="topnavbar-container">
      {/* Left Section - Menu Dropdowns */}
      <nav className="topnavbar-nav">
        <div className="topnavbar-menu-items">
          {menuItems.map((item, index) => (
            <button key={index} className="topnavbar-dropdown">
              <span>{item}</span>
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
