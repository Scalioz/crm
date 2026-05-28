import { useState } from "react";
import { brand } from "../../data/brand";

function Logo({ className = "", size = 40 }) {
  const [failed, setFailed] = useState(false);
  const logoSrc = brand.logoImage || "/scalioz-logo.png";

  if (failed) {
    return <div className={`brand-mark ${className}`}>{brand.logoText}</div>;
  }

  return (
    <img
      src={logoSrc}
      alt={`${brand.companyName} logo`}
      className={`brand-logo ${className}`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default Logo;
