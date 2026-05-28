import {
  ArrowUpRight,
  Users,
  Sparkles,
  Clock,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

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
    { New: 0, Qualified: 0, "Follow-up": 0, Converted: 0, Lost: 0 }
  );

  const temperatureCounts = leads.reduce(
    (acc, lead) => {
      acc[lead.temperature] = (acc[lead.temperature] || 0) + 1;
      return acc;
    },
    { Hot: 0, Warm: 0, Cold: 0 }
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
    { overdue: 0, today: 0, upcoming: 0, later: 0, none: 0 }
  );

  const hottestSource =
    Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "WhatsApp";

  const predictedHotLead =
    leads.find(
      (lead) =>
        lead.temperature === "Hot" && lead.status !== "Converted"
    ) ||
    leads[0] ||
    {};

  const bestResponseTime = "2.4 hrs";

  const conversionWarning =
    followUpStatusCounts.overdue > 2
      ? "Missing follow-ups on warm leads."
      : "Healthy pipeline pace.";

  const followUpCompletion = totalLeads
    ? Math.round(
        ((totalLeads - followUpStatusCounts.overdue) / totalLeads) * 100
      )
    : 0;

  const sourceConversion = totalLeads
    ? Math.round((statusCounts.Converted / totalLeads) * 100)
    : 0;

  return (
    <div className="page-content dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-left">
          <div className="dashboard-brand">
            <Logo className="page-logo" />

            <div>
              <p className="eyebrow">Enterprise dashboard</p>
              <h1>{brand.appName}</h1>

              <p className="page-description">
                Monitor leads, conversions, customer engagement and sales
                momentum from one intelligent workspace.
              </p>
            </div>
          </div>

          <div className="hero-highlight-card">
            <div className="hero-highlight-top">
              <div>
                <p>Pipeline velocity</p>
                <h2>+24.3%</h2>
              </div>

              <div className="hero-growth-badge">
                <TrendingUp size={18} />
                Growing
              </div>
            </div>

            <p className="hero-highlight-text">
              Lead activity is trending upward across follow-ups,
              conversions and customer conversations.
            </p>
          </div>
        </div>

        <div className="dashboard-hero-right">
          <div className="hero-mini-card">
            <span>Total leads</span>
            <strong>{totalLeads}</strong>
          </div>

          <div className="hero-mini-card">
            <span>Hot leads</span>
            <strong>{temperatureCounts.Hot}</strong>
          </div>

          <div className="hero-mini-card">
            <span>Conversions</span>
            <strong>{statusCounts.Converted}</strong>
          </div>

          <div className="hero-mini-card">
            <span>Follow-ups today</span>
            <strong>{followUpStatusCounts.today}</strong>
          </div>
        </div>
      </div>

      <section className="dashboard-kpi-grid">
        <div className="dashboard-kpi-card">
          <p>Total leads</p>
          <h2>{totalLeads}</h2>
          <span>All active records in CRM</span>
        </div>

        <div className="dashboard-kpi-card">
          <p>Hot opportunities</p>
          <h2>{temperatureCounts.Hot}</h2>
          <span>High-priority prospects</span>
        </div>

        <div className="dashboard-kpi-card">
          <p>Overdue follow-ups</p>
          <h2>{followUpStatusCounts.overdue}</h2>
          <span>Require immediate action</span>
        </div>

        <div className="dashboard-kpi-card">
          <p>Upcoming this week</p>
          <h2>{followUpStatusCounts.upcoming}</h2>
          <span>Tasks scheduled soon</span>
        </div>
      </section>

      <section className="section-panel premium-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Pipeline overview</p>
            <h2>Lead performance</h2>
          </div>

          <span className="pill">Live CRM activity</span>
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
              <p className="status-label">WhatsApp chats</p>
              <h3>{leadCountFromSource(sourceCounts, "WhatsApp")}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="section-panel compact-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Channel insights</p>
            <h2>Lead sources</h2>
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

            <p className="card-note">
              This channel is driving the most active CRM conversations.
            </p>
          </div>

          <div className="analytics-card ai-card">
            <p className="card-title">Predicted hot lead</p>

            <h3>{predictedHotLead.name || "No strong lead yet"}</h3>

            <p className="card-note">
              Priority opportunity from{" "}
              {predictedHotLead.source || "your pipeline"}.
            </p>
          </div>

          <div className="analytics-card ai-card">
            <p className="card-title">Best response time</p>
            <h3>{bestResponseTime}</h3>

            <p className="card-note">
              Goal for your next customer outreach.
            </p>
          </div>

          <div className="analytics-card ai-card">
            <p className="card-title">Follow-up completion</p>
            <h3>{followUpCompletion}%</h3>

            <p className="card-note">
              Leads with active follow-up plans.
            </p>
          </div>

          <div className="analytics-card">
            <p className="card-title">Source conversion</p>
            <h3>{sourceConversion}%</h3>

            <p className="card-note">
              Overall conversion from active lead pool.
            </p>
          </div>

          <div className="analytics-card">
            <p className="card-title">Pipeline status</p>
            <h3>{conversionWarning}</h3>

            <p className="card-note">
              Monitor overdue tasks and warm leads.
            </p>
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