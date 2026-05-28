import { useMemo, useState } from "react";
import { Download, CalendarDays } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#2563eb"];
const timeframes = ["Last 7 days", "Last 30 days", "This quarter"];

function Reports({ leads }) {
  const [timeframe, setTimeframe] = useState(timeframes[0]);

  const leadsBySource = useMemo(() => {
    return Object.entries(leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {})).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const pipelineData = useMemo(() => {
    const stages = ["New", "Qualified", "Follow-up", "Converted", "Lost"];
    return stages.map((stage) => ({ stage, value: leads.filter((lead) => lead.status === stage).length }));
  }, [leads]);

  const trendData = useMemo(() => {
    const baseDates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return baseDates.map((day, index) => ({ day, leads: Math.max(3, 12 - index + (index % 2) * 2) }));
  }, []);

  const followUpData = useMemo(() => {
    return [
      { name: "Completed", value: leads.filter((lead) => !lead.followUpDate).length },
      { name: "Pending", value: leads.filter((lead) => lead.followUpDate).length },
    ];
  }, [leads]);

  const conversion = leads.length ? Math.round((leads.filter((lead) => lead.status === "Converted").length / leads.length) * 100) : 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Performance insights</h1>
          <p className="page-description">Visualize the Scalioz pipeline with charts, export tools, and analysis cards.</p>
        </div>
        <button type="button" className="button button-secondary">
          <Download size={16} /> Export report
        </button>
      </div>

      <div className="card-grid">
        <Card>
          <p className="card-title">Conversion rate</p>
          <h2>{conversion}%</h2>
          <p className="card-note">Closed vs total leads</p>
        </Card>
        <Card>
          <p className="card-title">Active follow-ups</p>
          <h2>{leads.filter((lead) => lead.followUpDate).length}</h2>
          <p className="card-note">Leads with upcoming or pending follow-ups</p>
        </Card>
        <Card>
          <p className="card-title">Hot leads</p>
          <h2>{leads.filter((lead) => lead.temperature === "Hot").length}</h2>
          <p className="card-note">High priority pipeline</p>
        </Card>
        <Card>
          <p className="card-title">Weekly growth</p>
          <h2>+14.8%</h2>
          <p className="card-note">New lead growth trend</p>
        </Card>
      </div>

      <SectionHeader
        title="Timeframe analysis"
        description="Switch the timeframe to compare trends and export key metrics."
        action={(
          <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
            {timeframes.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}
      />

      <div className="reports-grid">
        <Card className="report-chart-card">
          <h3>Leads by source</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={leadsBySource} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {leadsBySource.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="report-chart-card">
          <h3>Pipeline stage distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="reports-grid">
        <Card className="report-chart-card">
          <h3>Conversion trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="report-chart-card">
          <h3>Follow-up completion</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={followUpData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

export default Reports;
