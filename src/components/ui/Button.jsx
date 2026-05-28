function Button({ type = "button", variant = "primary", children, ...props }) {
  return (
    <button type={type} className={`button button-${variant}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
