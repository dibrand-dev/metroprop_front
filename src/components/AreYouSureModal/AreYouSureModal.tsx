import './AreYouSureModal.scss';

interface AreYouSureModalProps {
  title: string;
  text: string | JSX.Element;
  icon?: string;
  onAccept?: () => void;
  onCancel: () => void;
}

export default function AreYouSureModal({ title, text, icon, onAccept, onCancel }: AreYouSureModalProps) {
  return (
    <div className="are-you-sure-modal-container" onClick={onCancel}>
      <div className="are-you-sure-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" />

        <div className="modal-content-container">
          {icon && (
            <div className="are-you-sure-icon">
              <img src={icon} alt="" />
            </div>
          )}

          <div className="modal-message-section">
            <div className="modal-message">
              <h3 className="modal-message-title">{title}</h3>
              {typeof text === 'string' ? <p className="modal-message-text">{text}</p> : text}
            </div>
          </div>

          <div className="are-you-sure-actions">
            <button className="are-you-sure-btn are-you-sure-btn--cancel" type="button" onClick={onCancel}>
              Cancelar
            </button>
            {onAccept && (
              <button className="are-you-sure-btn are-you-sure-btn--accept" type="button" onClick={onAccept}>
                Aceptar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
