function Chip({ children, className = "", onRemove, ...props }) {
  return (
    <div className={`chip ${className}`} {...props}>
      <span>{children}</span>
      {onRemove && (
        <button type="button" className="chip-remove" onClick={onRemove}>
          ×
        </button>
      )}
    </div>
  );
}

export default Chip;
