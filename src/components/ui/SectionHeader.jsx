function SectionHeader({ title, description, action }) {
  return (
    <div className="section-header modern">
      <div>
        <p className="eyebrow">{title}</p>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
}

export default SectionHeader;
