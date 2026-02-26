'use client';

import { useState } from 'react';
import './Collaborators.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';

const iconArrowBack = '/icons/arrow.svg';
const iconLock = '/icons/lock.svg';
const iconEdit = '/icons/pencil.svg';
const iconTrash = '/icons/trash.svg';

const collaboratorsDescription =
  'Aca podes editar los datos de tus colaboradores, activarlos y /o agregar nuevos.';

type CollaboratorAction = 'lock' | 'edit' | 'delete';

const actionIcons: Record<CollaboratorAction, { src: string; label: string }> = {
  lock: { src: iconLock, label: 'Bloquear colaborador' },
  edit: { src: iconEdit, label: 'Editar colaborador' },
  delete: { src: iconTrash, label: 'Eliminar colaborador' },
};

const initialCollaborators = [
  {
    id: 'dibrand',
    name: 'Dibrand',
    email: 'dibrand@gmail.com.ar',
    company: 'Dibrand empresa',
    role: 'Administrador',
    actions: [] as CollaboratorAction[],
  },
  {
    id: 'rodrigo',
    name: 'Rodrigo',
    email: 'rodrigoperez@gmail.com',
    company: 'Rodrigo Perez',
    role: 'Vendedor',
    actions: ['lock', 'edit', 'delete'] as CollaboratorAction[],
  },
];

export default function Collaborators() {
  const [showMenu, setShowMenu] = useState(false);
  const [collaborators] = useState(initialCollaborators);

  return (
    <div className={`professionalContainer ${!showMenu ? 'activeMenuMobile' : ''}`}>
      <Submenu active={showMenu} />
      <div className={`collaborators-container ${showMenu ? 'mobile-hidden' : ''}`}>
        <div className="collaborators-mobile-header">
          <button
            className="collaborators-back-button"
            type="button"
            onClick={() => setShowMenu(true)}
          >
            <img src={iconArrowBack} alt="Back" />
            <span>Colaboradores</span>
          </button>
        </div>

        <div className="collaborators-content">
          <div className="collaborators-header">
            <div>
              <h1>Colaboradores</h1>
              <p>{collaboratorsDescription}</p>
            </div>
            <button className="collaborators-add-button" type="button">
              Agregar colaborador
            </button>
          </div>

          <div className="collaborators-list">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="collaborators-card">
                <div className="collaborators-card-info">
                  <p className="collaborators-card-title">
                    {collaborator.name} - {collaborator.email}
                  </p>
                  <p className="collaborators-card-subtitle">
                    {collaborator.company}
                  </p>
                </div>
                <div className="collaborators-card-actions">
                  <span className="collaborators-role-chip">{collaborator.role}</span>
                  {collaborator.actions.length > 0 ? (
                    <div className="collaborators-card-tools">
                      {collaborator.actions.map((action) => (
                        <button
                          key={action}
                          className="collaborators-action-button"
                          type="button"
                          aria-label={actionIcons[action].label}
                        >
                          <img src={actionIcons[action].src} alt="" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="collaborators-mobile-footer">
          <button className="collaborators-add-button" type="button">
            Agregar colaborador
          </button>
        </div>
      </div>
    </div>
  );
}
