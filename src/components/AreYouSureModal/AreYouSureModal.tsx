import './AreYouSureModal.scss';

interface AreYouSureModalProps {
  title: string;
  text?: string | JSX.Element;
  icon?: string;
  iconBackgroundColor?: string;
  onAccept?: () => void;
  onCancel: () => void;
  cancelText?: string;
  acceptText?: string;
  subTitle?: string;
}

export default function AreYouSureModal({ title, text, icon, onAccept, onCancel, cancelText, acceptText, subTitle, iconBackgroundColor }: AreYouSureModalProps) {
  return (
    <div className="are-you-sure-modal-container" onClick={onCancel}>
      <div className="are-you-sure-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-button" type="button" onClick={onCancel} aria-label="Cerrar modal">
            <img src="/icons/close.svg" alt="Cerrar" />
          </button>
        </div>

        <div className="modal-content-container">          
          <div className="modal-message-section">
            {icon && (
              <div className="are-you-sure-icon" style={{ backgroundColor: iconBackgroundColor }}>
                <img src={icon} alt="" />
              </div>
            )}
            <div className="modal-message">
              {subTitle && <h3 className="modal-message-title">{subTitle}</h3>}
              {text && (typeof text === 'string' ? <p className="modal-message-text">{text}</p> : text)}
            </div>
          </div>

          <div className="are-you-sure-actions">
            <button className="are-you-sure-btn are-you-sure-btn--cancel" type="button" onClick={onCancel}>
              {cancelText || 'Cancelar'}
            </button>
            {onAccept && (
              <button className="are-you-sure-btn are-you-sure-btn--accept" type="button" onClick={onAccept}>
                {acceptText || 'Aceptar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
