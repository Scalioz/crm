import { useMemo, useState } from "react";
import { MessageCircle, Phone, Mail, CalendarPlus, ArrowRightCircle } from "lucide-react";
import Button from "../ui/Button";
import { formatTimestamp, getLeadPriority, getFollowUpStatus, getTimeline, formatPhoneLink, formatEmailLink } from "../../utils/leadHelpers";

function LeadDetailDrawer({ lead, onClose, onUpdateLead, onAddNote, onCompleteFollowUp }) {
  const [noteText, setNoteText] = useState("");
  const priority = getLeadPriority(lead);
  const followUp = getFollowUpStatus(lead);
  const timeline = useMemo(() => getTimeline(lead), [lead]);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(lead.id, noteText.trim());
    setNoteText("");
  };

  const handleStatusChange = (event) => {
    onUpdateLead(lead.id, { status: event.target.value }, `Status updated to ${event.target.value}.`);
  };

  const handleFollowUpChange = (event) => {
    onUpdateLead(lead.id, { followUpDate: event.target.value }, `Follow-up scheduled for ${event.target.value}.`);
  };

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Lead info</p>
          <h2>{lead.name}</h2>
          <p className="page-description">Manage notes, activity, and follow-up actions for this lead.</p>
        </div>
        <button type="button" className="icon-button close-button" onClick={onClose} title="Close detail view">
          <ArrowRightCircle size={20} />
        </button>
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <div className="detail-row">
            <div>
              <p className="detail-label">Company</p>
              <strong>{lead.company || "—"}</strong>
            </div>
            <div>
              <p className="detail-label">Service</p>
              <strong>{lead.serviceInterest}</strong>
            </div>
          </div>
          <div className="detail-row">
            <div>
              <p className="detail-label">Phone</p>
              <strong>{lead.phone}</strong>
            </div>
            <div>
              <p className="detail-label">Email</p>
              <strong>{lead.email || "—"}</strong>
            </div>
          </div>
          <div className="detail-row">
            <div>
              <p className="detail-label">Source</p>
              <strong>{lead.source}</strong>
            </div>
            <div>
              <p className="detail-label">Temperature</p>
              <strong>{lead.temperature}</strong>
            </div>
          </div>
          <div className="detail-row">
            <div>
              <p className="detail-label">Assigned to</p>
              <strong>{lead.assignedTo || "Sales team"}</strong>
            </div>
            <div>
              <p className="detail-label">Tags</p>
              <div className="tag-list">
                {(lead.tags || []).map((tag) => (
                  <span key={tag} className="pill tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="detail-row">
            <div>
              <p className="detail-label">Lead priority</p>
              <span className={`pill ${priority.badgeClass}`}>{priority.level}</span>
            </div>
            <div>
              <p className="detail-label">Priority score</p>
              <strong>{priority.score}%</strong>
            </div>
          </div>
          <div className="detail-row">
            <div>
              <p className="detail-label">Status</p>
              <select value={lead.status} onChange={handleStatusChange}>
                <option>New</option>
                <option>Qualified</option>
                <option>Follow-up</option>
                <option>Converted</option>
                <option>Lost</option>
              </select>
            </div>
            <div>
              <p className="detail-label">Follow-up</p>
              <select value={lead.followUpDate || ""} onChange={handleFollowUpChange}>
                <option value="">No follow-up</option>
                <option value={new Date().toISOString().slice(0, 10)}>Today</option>
                <option value={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}>Tomorrow</option>
              </select>
            </div>
          </div>

          <div className="detail-row">
            <div>
              <p className="detail-label">Follow-up status</p>
              <span className={`pill ${followUp.badgeClass}`}>{followUp.label}</span>
            </div>
            <div>
              <p className="detail-label">Lead created</p>
              <strong>{formatTimestamp(lead.createdAt)}</strong>
            </div>
          </div>

          <div className="detail-actions">
            <a href={formatPhoneLink(lead.phone)} target="_blank" rel="noreferrer" className="button button-secondary">
              <Phone size={16} /> Call
            </a>
            <a href={formatEmailLink(lead.email)} target="_blank" rel="noreferrer" className="button button-secondary">
              <Mail size={16} /> Email
            </a>
            <a href={formatPhoneLink(lead.phone)} target="_blank" rel="noreferrer" className="button">
              <MessageCircle size={16} /> WhatsApp
            </a>
            {lead.followUpDate && (
              <button type="button" className="button" onClick={() => onCompleteFollowUp(lead.id)}>
                <CalendarPlus size={16} /> Complete follow-up
              </button>
            )}
          </div>
        </section>

        <section className="detail-card detail-notes">
          <div className="detail-section-header">
            <h3>Notes</h3>
            <span>{(lead.notesHistory || []).length} entries</span>
          </div>
          <div className="note-input-group">
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Add a quick note about this lead"
            />
            <Button type="button" onClick={handleAddNote} disabled={!noteText.trim()}>
              Save note
            </Button>
          </div>
          <div className="timeline-list">
            {(lead.notesHistory || []).length === 0 ? (
              <p className="empty-state-text">No notes yet for this lead.</p>
            ) : (
              [...lead.notesHistory].reverse().map((note) => (
                <div className="timeline-item" key={note.id}>
                  <div className="timeline-item-meta">
                    <span>Note</span>
                    <span>{formatTimestamp(note.timestamp)}</span>
                  </div>
                  <p>{note.text}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="detail-card detail-activity">
          <div className="detail-section-header">
            <h3>Activity timeline</h3>
            <span>{timeline.length} events</span>
          </div>
          <div className="timeline-list">
            {timeline.map((event) => (
              <div className="timeline-item" key={event.id}>
                <div className="timeline-item-meta">
                  <span>{event.type}</span>
                  <span>{formatTimestamp(event.timestamp)}</span>
                </div>
                <p>{event.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default LeadDetailDrawer;
