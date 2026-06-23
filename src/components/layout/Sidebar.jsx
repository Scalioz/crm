import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, MessageCircle, Layers, CheckCircle, Settings as SettingsIcon, X } from "lucide-react";
import Logo from "../ui/Logo";
import { brand } from "../../data/brand";

const menuItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Leads", to: "/leads", icon: Users },
  { label: "Pipeline", to: "/pipeline", icon: Layers },
  { label: "Tasks", to: "/tasks", icon: CheckCircle },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Messages", to: "/messages", icon: MessageCircle },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
];

function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <Logo />
            <div>
              <p className="brand-name">{brand.companyName}</p>
              <p className="brand-subtitle">{brand.appName.replace(brand.companyName + " ", "")}</p>
            </div>
          </div>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              to={item.to}
              key={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>{brand.tagline}</p>
      </div>
    </aside>

    {mobileOpen && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
}

export default Sidebar;
