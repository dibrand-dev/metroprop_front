'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './TopNavBar.scss';
import TopUserMenu from '@/layout/TopUserMenu/TopUserMenu';

const logoMetroprop = "/images/metropropLogo.png";
const iconChevron = "https://www.figma.com/api/mcp/asset/17656c9e-10e8-428d-84c5-78ac19fac2cf";

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
          <img src={logoMetroprop} alt="MetroProp Logo" />
        </div>
        <TopUserMenu />
      </nav>
    </header>
  );
}
