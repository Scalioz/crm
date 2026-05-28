import { useMemo } from "react";
import { Bell, Plus, Menu, Search, Moon, Sun, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "../ui/Button";

const pageTitles = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/tasks": "Tasks",
  "/reports": "Reports",
  "/settings": "Settings",
  "/messages": "Messages",
};

function Topbar({ searchQuery, onSearchChange, onToggleSidebar, onOpenSearch, onQuickAdd, theme, onToggleTheme, onLogout, isMobileOpen }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const title = pageTitles[currentPath] || "CRM";

  const breadcrumbs = useMemo(() => {
    const segments = currentPath.split("/").filter(Boolean);
    if (segments.length === 0) return ["Dashboard"];
    return ["Dashboard", ...segments.map((segment) => segment.replace(/-/g, " "))];
  }, [currentPath]);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button topbar-hamburger" onClick={onToggleSidebar}>
          <Menu size={18} />
        </button>
        <div className="topbar-title-group">
          <p className="page-title">{title}</p>
          <div className="breadcrumb-row">
            {breadcrumbs.map((item, index) => (
              <span key={item} className="breadcrumb-item">
                {item}
                {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="topbar-search">
        <label className="search-field">
          <Search size={16} />
          <input
            value={searchQuery}
            onFocus={onOpenSearch}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search leads, companies, emails..."
          />
        </label>
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-button" title="Theme toggle" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button type="button" className="icon-button" title="Notifications">
          <Bell size={18} />
        </button>
        <Button className="button-compact" onClick={onQuickAdd}>
          <Plus size={14} /> Add lead
        </Button>
        {onLogout && (
          <button type="button" className="icon-button" title="Logout" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        )}
        <div className={`topbar-avatar ${isMobileOpen ? "active" : ""}`}>
          <span>AK</span>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
