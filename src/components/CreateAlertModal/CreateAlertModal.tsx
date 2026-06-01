'use client';

import { useState, useEffect } from 'react';
import './CreateAlertModal.scss';
import Select from '@/ui/Select/Select';
import Button from '@/ui/Button/Button';
import InputField from '@/ui/InputField/InputField';
import { FREQUENCY_OPTIONS } from '@/types/propiedad';

interface CreateAlertModalProps {
  onClose: () => void;
  alertId?: number;
  initialName?: string;
  initialFrequency?: string;
}

const iconCheck = '/icons/check.svg';

export default function CreateAlertModal({ onClose, alertId, initialName, initialFrequency }: CreateAlertModalProps) {
  const isEditMode = alertId !== undefined;
  const [alertName, setAlertName] = useState(initialName ?? '');
  const [frequency, setFrequency] = useState(initialFrequency ?? 'inmediata');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [isSuccess, onClose]);

  const handleAccept = async () => {
    if (!alertName.trim()) return;
    setIsLoading(true);
    try {
      if (isEditMode) {
        // TODO: call the alert edit service here
        // await apiFetch(`${API_BASE_URL}/alerts/${alertId}`, { method: 'PATCH', body: JSON.stringify({ name: alertName, frequency }) });
      } else {
        // TODO: call the alert creation service here
        // await apiFetch(`${API_BASE_URL}/alerts`, { method: 'POST', body: JSON.stringify({ name: alertName, frequency }) });
      }
      setIsSuccess(true);
    } catch {
      // handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-alert-modal-container" onClick={onClose}>
      <div className="create-alert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditMode ? 'Editar alerta' : 'Crear alerta'}</h2>
          <button className="modal-close-button" type="button" onClick={onClose} aria-label="Cerrar modal">
            <img src="/icons/close.svg" alt="Cerrar" />
          </button>
        </div>

        <div className="modal-content-container">
          {isSuccess ? (
            <div className="create-alert-success">
              <div className="modal-check-icon">
                <img src={iconCheck} alt="" />
              </div>
              <div className="modal-message-section">
                <div className="modal-message">
                  <h3 className="modal-message-title">
                    {isEditMode ? '¡Tu alerta se editó correctamente!' : '¡Tu alerta se creó correctamente respetando tus filtros!'}
                  </h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="create-alert-form">
              <div className="create-alert-field">
                <label className="create-alert-label" htmlFor="alert-name">
                  Nombre de tu alerta
                </label>
                <InputField
                  id="alert-name"
                  type="text"
                  placeholder="PH-Villa del parque"
                  value={alertName}
                  onChange={(e) => setAlertName(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="create-alert-field">
                <Select
                    label="Frecuencia de notificaciones por mail"
                    options={FREQUENCY_OPTIONS}
                    value={frequency}
                    onChange={setFrequency}
                    placeholder="Inmediata"
                />
              </div>

              <div className="alert-actions">
                <Button onClick={onClose} label="Cancelar" variant="secondary" disabled={isLoading} />
                <Button
                    label={isEditMode ? 'Guardar' : 'Crear alerta'}
                    variant="primary"
                    onClick={handleAccept}
                    disabled={!alertName.trim() || isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
