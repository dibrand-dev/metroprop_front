import './EmailVerificatedModal.scss';

const iconCheck = "/icons/check.svg";

export default function EmailVerificatedModal() {
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
              ¡Email verificado!
            </h2>
            <p className="modal-message-text">
              Puedes loguearte con tu email.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
