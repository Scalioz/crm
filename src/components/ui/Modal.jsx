function Modal({ title, children, className = "", onClose, ...props }) {
  return (
    <div className="modal-overlay modal-smooth" onClick={onClose}>
      <div className={`modal-window ${className}`} onClick={(event) => event.stopPropagation()} {...props}>
        <div className="modal-window-header">
          <h3>{title}</h3>
          {onClose && (
            <button type="button" className="icon-button close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
