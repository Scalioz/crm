import { MessageCircle } from "lucide-react";

const statuses = ["New", "Qualified", "Follow-up", "Converted", "Lost"];
const stageProbability = {
  New: 14,
  Qualified: 36,
  "Follow-up": 58,
  Converted: 92,
  Lost: 8,
};

function formatFollowUpDate(dateString) {
  if (!dateString) return "No follow-up";
  const date = new Date(dateString);
  if (Number.isNaN(date.valueOf())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPhoneLink(phone) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
}

function Pipeline({ leads, onUpdateStatus }) {
  const groupedLeads = statuses.map((status) => ({
    status,
    items: leads.filter((lead) => lead.status === status),
  }));

  const totalLeads = leads.length;
  const conversionRate = totalLeads ? Math.round((groupedLeads.find((group) => group.status === "Converted")?.items.length / totalLeads) * 100) : 0;

  return (
    <div className="page-content">
      <div className="page-header pipeline-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1>Sales funnel</h1>
          <p className="page-description">
            Visualize stage totals, conversion probability, and task-ready follow-ups in an easy pipeline board.
          </p>
        </div>
        <div className="pipeline-summary-card">
          <div>
            <p className="card-title">Conversion summary</p>
            <h2>{conversionRate}%</h2>
            <p className="card-note">Based on active pipeline stage counts.</p>
          </div>
          <div className="pipeline-summary-meta">
            <span>{totalLeads} leads in funnel</span>
            <span>{groupedLeads.find((group) => group.status === "Follow-up")?.items.length ?? 0} follow-ups active</span>
          </div>
        </div>
      </div>

      <div className="board-grid pipeline-board-grid">
        {groupedLeads.map((group) => (
          <div key={group.status} className="pipeline-column">
            <div className="pipeline-column-header">
              <div>
                <h3>{group.status}</h3>
                <span>{group.items.length} lead{group.items.length === 1 ? "" : "s"}</span>
              </div>
              <span className="probability-pill">{stageProbability[group.status]}% chance</span>
            </div>

            {group.items.length === 0 ? (
              <div className="pipeline-card empty-stage-card">
                <p className="card-note">No leads in this stage yet.</p>
              </div>
            ) : (
              group.items.map((lead) => (
                <div key={lead.id} className="pipeline-card" draggable="true" data-drag-ready>
                  <div className="pipeline-card-header">
                    <h4>{lead.name}</h4>
                    <span className={`pill temp-pill temp-${lead.temperature.toLowerCase()}`}>
                      {lead.temperature}
                    </span>
                  </div>

                  <div className="pipeline-card-meta">
                    <p>{lead.company}</p>
                    <p>{lead.serviceInterest}</p>
                    <p>Follow-up {formatFollowUpDate(lead.followUpDate)}</p>
                  </div>

                  <div className="pipeline-card-actions">
                    <a
                      href={formatPhoneLink(lead.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-secondary"
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                    <select
                      value={lead.status}
                      onChange={(event) => onUpdateStatus(lead.id, { status: event.target.value })}
                    >
                      {statuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pipeline;
