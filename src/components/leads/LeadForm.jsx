import { useEffect, useState } from "react";
import Button from "../ui/Button";

const emptyLead = {
  name: "",
  phone: "",
  email: "",
  company: "",
  source: "WhatsApp",
  serviceInterest: "Lead Generation",
  status: "New",
  temperature: "Warm",
  followUpDate: "",
  notes: "",
  notesHistory: [],
  activity: [],
  createdAt: "",
};

function LeadForm({ lead, mode = "add", onSubmit, onCancel, loading = false, formId = "lead-form", showActions = true }) {
  const [formState, setFormState] = useState(emptyLead);
  const readOnly = mode === "view";
  const isSubmitDisabled = !formState.name.trim() || !formState.phone.trim();

  useEffect(() => {
    if (lead) {
      setFormState({ ...emptyLead, ...lead });
    } else {
      setFormState({ ...emptyLead, createdAt: new Date().toISOString() });
    }
  }, [lead]);

  const handleChange = (key) => (event) => {
    setFormState((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (readOnly || isSubmitDisabled || loading) return;
    onSubmit({
      ...formState,
      id: lead?.id ?? crypto.randomUUID?.() ?? String(Date.now()),
      createdAt: formState.createdAt || new Date().toISOString(),
    });
  };

  return (
    <form id={formId} className="lead-form" onSubmit={handleSubmit}>
      <div className="lead-form-body">
        <div className="form-row">
          <div className="field-group">
            <label>Name</label>
            <input value={formState.name} onChange={handleChange("name")} required disabled={readOnly} />
          </div>
          <div className="field-group">
            <label>Company</label>
            <input value={formState.company} onChange={handleChange("company")} disabled={readOnly} />
          </div>
        </div>

        <div className="form-row">
          <div className="field-group">
            <label>Phone</label>
            <input value={formState.phone} onChange={handleChange("phone")} required disabled={readOnly} />
          </div>
          <div className="field-group">
            <label>Email</label>
            <input type="email" value={formState.email} onChange={handleChange("email")} disabled={readOnly} />
          </div>
        </div>

        <div className="form-row">
          <div className="field-group">
            <label>Source</label>
            <select value={formState.source} onChange={handleChange("source")} disabled={readOnly}>
              <option>WhatsApp</option>
              <option>Meta Ads</option>
              <option>Google Ads</option>
              <option>GBP</option>
              <option>LinkedIn</option>
              <option>Instagram</option>
              <option>FB Page</option>
              <option>Website</option>
            </select>
          </div>
          <div className="field-group">
            <label>Service interest</label>
            <select value={formState.serviceInterest} onChange={handleChange("serviceInterest")} disabled={readOnly}>
              <option>Lead Generation</option>
              <option>WhatsApp Automation</option>
              <option>AI Automation</option>
              <option>Landing Pages</option>
              <option>Ads</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field-group">
            <label>Status</label>
            <select value={formState.status} onChange={handleChange("status")} disabled={readOnly}>
              <option>New</option>
              <option>Qualified</option>
              <option>Follow-up</option>
              <option>Converted</option>
              <option>Lost</option>
            </select>
          </div>
          <div className="field-group">
            <label>Temperature</label>
            <select value={formState.temperature} onChange={handleChange("temperature")} disabled={readOnly}>
              <option>Hot</option>
              <option>Warm</option>
              <option>Cold</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field-group">
            <label>Follow-up date</label>
            <input type="date" value={formState.followUpDate} onChange={handleChange("followUpDate")} disabled={readOnly} />
          </div>
          <div className="field-group">
            <label>Notes</label>
            <textarea value={formState.notes} onChange={handleChange("notes")} rows="4" disabled={readOnly} />
          </div>
        </div>
      </div>
      {showActions && (
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={isSubmitDisabled || loading}>
              {loading ? "Saving..." : lead?.id ? "Update lead" : "Add lead"}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}

export default LeadForm;
