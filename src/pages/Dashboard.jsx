import { ArrowUpRight, Users, Sparkles, Clock, MessageCircle } from "lucide-react";
import { brand } from "../data/brand";
import { getFollowUpStatus } from "../utils/leadHelpers";
import Logo from "../components/ui/Logo";

function Dashboard({ leads }) {
  const totalLeads = leads.length;
  const statusCounts = leads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    },
    { New: 0, Qualified: 0, "Follow-up": 0, Converted: 0, Lost: 0 },
  );
  const temperatureCounts = leads.reduce(
    (acc, lead) => {
      acc[lead.temperature] = (acc[lead.temperature] || 0) + 1;
      return acc;
    },
    { Hot: 0, Warm: 0, Cold: 0 },
  );
  const sourceCounts = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});
  const followUpStatusCounts = leads.reduce(
    (acc, lead) => {
      const status = getFollowUpStatus(lead).state;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { overdue: 0, today: 0, upcoming: 0, later: 0, none: 0 },
  );
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
    .slice(0, 4);

  const hottestSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "WhatsApp";
  const predictedHotLead = leads.find((lead) => lead.temperature === "Hot" && lead.status !== "Converted") || leads[0] || {};
  const bestResponseTime = "2.4 hrs";
  const conversionWarning = followUpStatusCounts.overdue > 2 ? "Missing follow-ups on warm leads." : "Healthy pipeline pace.";
  const followUpCompletion = totalLeads
    ? Math.round(((totalLeads - followUpStatusCounts.overdue) / totalLeads) * 100)
    : 0;
  const sourceConversion = totalLeads ? Math.round((statusCounts.Converted / totalLeads) * 100) : 0;

  return (
    <div className="page-content">
      <div className="page-header dashboard-header">
        <div className="page-header-brand">
          <Logo className="page-logo" />
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>{brand.appName}</h1>
          </div>
        </div>
        <div className="card highlight-card">
          <div className="card-meta">
            <span>Pipeline velocity</span>
            <ArrowUpRight size={16} />
          </div>
          <h2>+24.3%</h2>
          <p>Lead activity is trending upward across follow-ups and conversions.</p>
        </div>
      </div>
      <p className="page-description">
        Track leads, growth signals, and campaign momentum in one place with {brand.companyName}.
      </p>

      <div className="card-grid">
        <div className="card">
          <p className="card-title">Total leads</p>
          <h2>{totalLeads}</h2>
          <p className="card-note">All active records in CRM</p>
        </div>
        <div className="card">
          <p className="card-title">Hot leads</p>
          <h2>{temperatureCounts.Hot}</h2>
          <p className="card-note">High priority opportunities</p>
        </div>
        <div className="card">
          <p className="card-title">Overdue follow-ups</p>
          <h2>{followUpStatusCounts.overdue}</h2>
          <p className="card-note">Require immediate action</p>
        </div>
        <div className="card">
          <p className="card-title">Converted</p>
          <h2>{statusCounts.Converted}</h2>
          <p className="card-note">Closed opportunities</p>
        </div>
        <div className="card">
          <p className="card-title">Today’s follow-ups</p>
          <h2>{followUpStatusCounts.today}</h2>
          <p className="card-note">Tasks scheduled for today</p>
        </div>
        <div className="card">
          <p className="card-title">Upcoming this week</p>
          <h2>{followUpStatusCounts.upcoming}</h2>
          <p className="card-note">Follow-ups due soon</p>
        </div>
      </div>

      <section className="section-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Pipeline snapshot</p>
            <h2>Lead performance</h2>
          </div>
          <span className="pill">Source distribution</span>
        </div>

        <div className="stats-grid">
          <div className="status-block">
            <div className="status-icon status-icon-primary">
              <Users size={18} />
            </div>
            <div>
              <p className="status-label">New leads</p>
              <h3>{statusCounts.New}</h3>
            </div>
          </div>
          <div className="status-block">
            <div className="status-icon status-icon-secondary">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="status-label">Hot prospects</p>
              <h3>{temperatureCounts.Hot}</h3>
            </div>
          </div>
          <div className="status-block">
            <div className="status-icon status-icon-tertiary">
              <Clock size={18} />
            </div>
            <div>
              <p className="status-label">Warm follow-ups</p>
              <h3>{temperatureCounts.Warm}</h3>
            </div>
          </div>
          <div className="status-block">
            <div className="status-icon status-icon-quaternary">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="status-label">Chats available</p>
              <h3>{leadCountFromSource(sourceCounts, "WhatsApp")}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="section-panel compact-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Channel insights</p>
            <h2>Source distribution</h2>
          </div>
        </div>
        <div className="source-grid">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <div className="source-card" key={source}>
              <p>{source}</p>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-panel analytics-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">AI Insights</p>
            <h2>Smart recommendations</h2>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card ai-card">
            <p className="card-title">Hottest lead source</p>
            <h3>{hottestSource}</h3>
            <p className="card-note">This channel is driving the most active CRM conversations.</p>
          </div>
          <div className="analytics-card ai-card">
            <p className="card-title">Predicted hot lead</p>
            <h3>{predictedHotLead.name || "No strong lead yet"}</h3>
            <p className="card-note">Priority opportunity from {predictedHotLead.source || "your pipeline"}.</p>
          </div>
          <div className="analytics-card ai-card">
            <p className="card-title">Best response time</p>
            <h3>{bestResponseTime}</h3>
            <p className="card-note">Goal for your next customer outreach.</p>
          </div>
          <div className="analytics-card ai-card">
            <p className="card-title">Follow-up completion</p>
            <h3>{followUpCompletion}%</h3>
            <p className="card-note">Proportion of leads with current follow-up plans.</p>
          </div>
          <div className="analytics-card">
            <p className="card-title">Source conversion</p>
            <h3>{sourceConversion}%</h3>
            <p className="card-note">Overall conversion from active lead pool.</p>
          </div>
          <div className="analytics-card">
            <p className="card-title">Conversion warning</p>
            <h3>{conversionWarning}</h3>
            <p className="card-note">Keep an eye on overdue tasks and warm leads.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function leadCountFromSource(sourceCounts, source) {
  return sourceCounts[source] ?? 0;
}

export default Dashboard;
