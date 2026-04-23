'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Notifications.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';

const iconArrowBack = '/icons/arrow.svg';

const initialNotifications = [
  {
    id: '17010603',
    name: 'Newsletter',
    description: 'Recibí noticias del mercado inmobiliario, oportunidades de inversión y tendencias del sector.',
    active: true,
  },
];

export default function Notifications() {
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();

  const handleToggle = (id: string, nextValue: boolean) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, active: nextValue } : notification
      )
    );
  };

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`branches-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="branches-mobile-header">
          <button
            className="branches-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Notificaciones</span>
          </button>
        </div>

        <div className="branches-content">
          <div className="branches-header">
            <div>
              <h1>Notificaciones</h1>
            </div>
          </div>

          <div className="branches-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="branches-card">
                <div className="branches-card-info">
                  <p className="branches-card-title">
                    {notification.name}
                  </p>
                  <div className="branches-card-meta">
                    {notification.description}
                  </div>
                </div>
                <div className="branches-card-actions">
                  <div className="branches-card-status">
                    <SwitchToggle
                      checked={notification.active}
                      onChange={(nextValue) => handleToggle(notification.id, nextValue)}
                      ariaLabel={`Cambiar estado de ${notification.name}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="branches-mobile-footer">
          <button className="branches-add-button" type="button" disabled>
            Agregar sucursal
          </button>
        </div>
      </div>
    </div>
  );
}
