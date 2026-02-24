import './SuccessModal.scss';

const iconCheck = "/icons/check.svg";

interface SuccessModalProps {
  title: string;
  text: string;
}

export default function SuccessModal({ title, text }: SuccessModalProps) {
  return (
  <div className="email-verification-modal-container">
    <div className="email-verification-modal">
      {/* Header */}
      <div className="modal-header">        
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
            <h2 className="modal-message-title">
              {title}
            </h2>
            <p className="modal-message-text">
              {text}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
