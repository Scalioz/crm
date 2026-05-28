import { ChevronsUpDown, Eye, Edit3, Trash2, MessageCircle } from "lucide-react";
import EmptyState from "../ui/EmptyState";

function formatShortDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return Number.isNaN(date.valueOf())
    ? dateString
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function LeadTable({
  leads,
  onView,
  onEdit,
  onDelete,
  selected = [],
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  sortKey,
  sortDirection,
  onSort,
  compactMode,
  noResults,
  onEmptyAction,
}) {
  const sortLabel = (key) => {
    if (sortKey !== key) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  if (noResults) {
    return (
      <div className="table-card">
        <EmptyState
          title="No leads match your filters"
          description="Refine the search or add a new lead to get this table moving."
          actionLabel="Add lead"
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className={`table-card ${compactMode ? "compact-table" : ""}`}>
      <table className="lead-table">
        <thead>
          <tr>
            <th className="checkbox-cell">
              <label className="checkbox-label">
                <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} />
              </label>
            </th>
            <th onClick={() => onSort("name")} className="sortable">
              Name <ChevronsUpDown size={14} />{sortLabel("name")}
            </th>
            <th onClick={() => onSort("company")} className="sortable">
              Company <ChevronsUpDown size={14} />{sortLabel("company")}
            </th>
            <th onClick={() => onSort("phone")} className="sortable">
              Phone <ChevronsUpDown size={14} />{sortLabel("phone")}
            </th>
            <th onClick={() => onSort("source")} className="sortable">
              Source <ChevronsUpDown size={14} />{sortLabel("source")}
            </th>
            <th onClick={() => onSort("serviceInterest")} className="sortable">
              Service <ChevronsUpDown size={14} />{sortLabel("serviceInterest")}
            </th>
            <th onClick={() => onSort("status")} className="sortable">
              Status <ChevronsUpDown size={14} />{sortLabel("status")}
            </th>
            <th onClick={() => onSort("temperature")} className="sortable">
              Temp <ChevronsUpDown size={14} />{sortLabel("temperature")}
            </th>
            <th onClick={() => onSort("followUpDate")} className="sortable">
              Follow-up <ChevronsUpDown size={14} />{sortLabel("followUpDate")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="lead-row">
              <td className="checkbox-cell">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selected.includes(lead.id)}
                    onChange={() => onToggleSelect(lead.id)}
                  />
                </label>
              </td>
              <td>
                <div className="lead-contact">
                  <strong>{lead.name}</strong>
                  <span>{lead.email}</span>
                </div>
              </td>
              <td>{lead.company}</td>
              <td>{lead.phone}</td>
              <td>{lead.source}</td>
              <td>{lead.serviceInterest}</td>
              <td>
                <span className={`pill status-pill status-${lead.status.replace(/\s+/g, "-").toLowerCase()}`}>
                  {lead.status}
                </span>
              </td>
              <td>
                <span className={`pill temp-pill temp-${lead.temperature.toLowerCase()}`}>
                  {lead.temperature}
                </span>
              </td>
              <td>{formatShortDate(lead.followUpDate)}</td>
              <td className="action-cell">
                <button type="button" className="icon-button" onClick={() => onView(lead)} title="View lead">
                  <Eye size={16} />
                </button>
                <button type="button" className="icon-button" onClick={() => onEdit(lead)} title="Edit lead">
                  <Edit3 size={16} />
                </button>
                <button type="button" className="icon-button danger" onClick={() => onDelete(lead.id)} title="Delete lead">
                  <Trash2 size={16} />
                </button>
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-button"
                  title="WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadTable;
