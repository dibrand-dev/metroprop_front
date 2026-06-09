'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import './Notifications.scss';
import { useAdminMenu } from '../../AdminLayoutClient';
import SwitchToggle from '@/ui/SwitchToggle/SwitchToggle';
import { API_BASE_URL } from '@/utils/utils';
import { apiFetch } from '@/lib/apiFetch';

const iconArrowBack = '/icons/arrow.svg';

const initialNotifications = [
  {
    id: '1',
    name: 'Newsletter',
    description: 'Recibí noticias del mercado inmobiliario, oportunidades de inversión y tendencias del sector.',
    active: false,
  },
];

export default function Notifications() {
  const { showMenu, setShowMenu } = useAdminMenu();
  const [notifications, setNotifications] = useState(initialNotifications);
  const { data: sessionData, update } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      const userId = (sessionData?.user as any)?.id;
      if (!userId) return;

      await apiFetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        }).then((data) => {
          const acceptNewsletters = data?.accept_newsletters ?? false;
          setNotifications((prev) =>
            prev.map((n) => (n.id === '1' ? { ...n, active: acceptNewsletters } : n))
          );
        });
    };

    fetchData();
  }, [sessionData]);

  const handleToggle = async (id: string, nextValue: boolean) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, active: nextValue } : notification
      )
    );
    const userId = (sessionData?.user as any)?.id;
    if (!userId) return;
    await apiFetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      body: { accept_newsletters: nextValue },
    });
    await update({ accept_newsletters: nextValue });
  };

  return (
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
  );
}
