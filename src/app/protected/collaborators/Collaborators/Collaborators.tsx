'use client';

import { useEffect, useState } from 'react';
import './Collaborators.scss';
import Submenu from '@/layout/ProfessionalUser/Submenu/Submenu';
import { useSession } from 'next-auth/react';

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

interface CollaboratorItem {
  id: number;
  name: string;
  email: string;
  branchName: string;
  role_id: number | null;
  actions: CollaboratorAction[];
}

export default function Collaborators() {
  const { data: sessionData } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorItem[]>([]);

  useEffect(() => {
    const branches: any[] = (sessionData?.user as any)?.organization?.branches ?? [];
    const items: CollaboratorItem[] = [];
    branches.forEach((branch) => {
      (branch.users ?? []).forEach((user: any) => {
        items.push({
          id: user.id,
          name: user.name,
          email: user.email,
          branchName: branch.branch_name,
          role_id: user.role_id ?? null,
          actions: ['lock', 'edit', 'delete'],
        });
      });
    });
    setCollaborators(items);
  }, [sessionData]);

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
                    Sucursal: {collaborator.branchName}
                  </p>
                </div>
                <div className="collaborators-card-actions">
                  <span className="collaborators-role-chip">Role {collaborator.role_id ?? '-'}</span>
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
