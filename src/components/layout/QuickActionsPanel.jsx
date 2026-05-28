import { Plus, CalendarPlus, ClipboardList, Download, Smartphone } from "lucide-react";

function QuickActionsPanel({ onAddLead, onAddFollowUp, onCreateTask, onExport }) {
  return (
    <div className="quick-actions-panel">
      <div className="quick-actions-card">
        <div className="quick-actions-title">
          <p className="eyebrow">Quick actions</p>
          <h3>Fast sales workflow</h3>
        </div>
        <div className="quick-actions-list">
          <button type="button" className="quick-action" onClick={onAddLead}>
            <Plus size={18} /> Add lead
          </button>
          <button type="button" className="quick-action" onClick={onAddFollowUp}>
            <CalendarPlus size={18} /> Add follow-up
          </button>
          <button type="button" className="quick-action" onClick={onCreateTask}>
            <ClipboardList size={18} /> Create task
          </button>
          <button type="button" className="quick-action" onClick={onExport}>
            <Download size={18} /> Export CSV
          </button>
          <button type="button" className="quick-action quick-action-secondary" onClick={() => window.alert("WhatsApp shortcut placeholder")}> 
            <Smartphone size={18} /> WhatsApp
          </button>
        </div>
      </div>
      <button type="button" className="quick-fab" onClick={onAddLead}>
        <Plus size={18} />
      </button>
    </div>
  );
}

export default QuickActionsPanel;
