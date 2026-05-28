import SectionHeader from "../components/ui/SectionHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function Settings({ theme, onToggleTheme }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Workspace preferences</h1>
          <p className="page-description">Configure your Scalioz CRM defaults, notifications, and pipeline experience.</p>
        </div>
      </div>

      <SectionHeader title="Branding" description="Customize the look and messaging for your team." />
      <Card className="settings-card">
        <div className="form-row">
          <div className="field-group full-width">
            <label>Company name</label>
            <input placeholder="Scalioz Digital" />
          </div>
          <div className="field-group full-width">
            <label>Product name</label>
            <input placeholder="Scalioz Lead CRM Lite" />
          </div>
        </div>
      </Card>

      <SectionHeader title="Notifications" description="Manage how your team stays informed." action={<Button variant="secondary">Test notification</Button>} />
      <Card className="settings-card">
        <div className="form-row">
          <div className="field-group full-width">
            <label>Notify on new leads</label>
            <input type="checkbox" />
          </div>
          <div className="field-group full-width">
            <label>Notify on follow-ups</label>
            <input type="checkbox" />
          </div>
        </div>
      </Card>

      <SectionHeader title="Lead defaults" description="Set default values for new lead creation." />
      <Card className="settings-card">
        <div className="form-row">
          <div className="field-group full-width">
            <label>Default source</label>
            <select>
              <option>WhatsApp</option>
              <option>Meta Ads</option>
              <option>Google Ads</option>
              <option>Website</option>
            </select>
          </div>
          <div className="field-group full-width">
            <label>Default priority</label>
            <select>
              <option>Warm</option>
              <option>Hot</option>
              <option>Cold</option>
            </select>
          </div>
        </div>
      </Card>

      <SectionHeader title="Pipeline stages" description="Manage the workflow stages visible in the pipeline." />
      <Card className="settings-card">
        <div className="form-row">
          <div className="field-group full-width">
            <label>Pipeline stage labels</label>
            <textarea rows="3" placeholder="New, Qualified, Follow-up, Converted, Lost" />
          </div>
        </div>
      </Card>

      <SectionHeader title="Theme" description="Switch between light and dark mode with persistence." />
      <Card className="settings-card theme-settings-card">
        <div className="theme-toggle-row">
          <div>
            <p className="detail-label">Workspace theme</p>
            <strong>{theme === "dark" ? "Dark mode" : "Light mode"}</strong>
          </div>
          <button type="button" className="button" onClick={onToggleTheme}>
            Toggle theme
          </button>
        </div>
        <p className="card-note">Theme mode is stored locally and preserves your workspace style across sessions.</p>
      </Card>
    </div>
  );
}

export default Settings;
