function Badge({ children, className = "", variant = "default", ...props }) {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
