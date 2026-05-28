import { brand } from "../data/brand";

function Placeholder({ title, subtitle }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">{title}</p>
          <h1>{subtitle}</h1>
          <p className="page-description">
            This placeholder page is designed to inherit {brand.companyName} branding and CRM layout consistency.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Placeholder;
