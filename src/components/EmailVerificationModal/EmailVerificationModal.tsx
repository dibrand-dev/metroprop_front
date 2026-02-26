'use client';

import { useState } from 'react';
import './EmailVerificationModal.scss';

const iconClose = "/icons/close.svg";
const iconCheck = "/icons/check.svg";

interface EmailVerificationModalProps {
  title: string;
  text: string;
  onClose?: () => void;
  onBack?: () => void;
  onResendEmail?: () => void;
}

export default function EmailVerificationModal({
  onClose,
  title,
  text,
  onResendEmail,
}: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    if (onResendEmail) {
      await onResendEmail();
    }
    setIsResending(false);
  };

  return (
  <div className="email-verification-modal-container">
    <div className="email-verification-modal">
      {/* Header */}
      <div className="modal-header">       
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <img src={iconClose} alt="" />
        </button>
      </div>

      {/* Content Container */}
      <div className="modal-content-container">
        {/* Alert Notification */}
        <div className="modal-check-icon">
          <img src={iconCheck} alt="" />
        </div>

        {/* Message Section */}
        <div className="modal-message-section">
          <div className="modal-message">
            <h3 className="modal-message-title">
              {title}
            </h3>
            <p className="modal-message-text">
              {text}
            </p>
          </div>

          <button className="modal-link-button" onClick={handleResendEmail}>
            No recibí el e-mail
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
