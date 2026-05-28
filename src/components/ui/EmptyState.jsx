import Logo from "./Logo";

function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-illustration">{icon || <Logo className="empty-logo" />}</div>
      <div className="empty-state-copy">
        <h3>{title}</h3>
        <p>{description}</p>
        {actionLabel && onAction && (
          <button type="button" className="button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
