'use client';

import { createContext, useContext, useState } from 'react';
import Submenu from '@/layout/Submenu/Submenu';

interface AdminMenuContextType {
  showMenu: boolean;
  setShowMenu: (v: boolean) => void;
}

const AdminMenuCtx = createContext<AdminMenuContextType>({
  showMenu: false,
  setShowMenu: () => {},
});

export function useAdminMenu() {
  return useContext(AdminMenuCtx);
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <AdminMenuCtx.Provider value={{ showMenu, setShowMenu }}>
      <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
        <Submenu active={showMenu} onHide={() => setShowMenu(false)} />
        {children}
      </div>
    </AdminMenuCtx.Provider>
  );
}
