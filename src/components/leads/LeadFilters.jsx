function LeadFilters({ filters, onFilterChange, onReset }) {
  const sources = ["", "WhatsApp", "Meta Ads", "Google Ads", "GBP", "LinkedIn", "Instagram", "FB Page", "Website"];
  const services = ["", "Lead Generation", "WhatsApp Automation", "AI Automation", "Landing Pages", "Ads"];
  const statuses = ["", "New", "Qualified", "Follow-up", "Converted", "Lost"];
  const temperatures = ["", "Hot", "Warm", "Cold"];

  return (
    <div className="lead-filters">
      <div className="filter-group">
        <label>Source</label>
        <select
          value={filters.source}
          onChange={(e) => onFilterChange({ ...filters, source: e.target.value })}
        >
          {sources.map((value) => (
            <option key={value || "all"} value={value}>
              {value || "All sources"}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Service</label>
        <select
          value={filters.serviceInterest}
          onChange={(e) => onFilterChange({ ...filters, serviceInterest: e.target.value })}
        >
          {services.map((value) => (
            <option key={value || "all"} value={value}>
              {value || "All services"}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        >
          {statuses.map((value) => (
            <option key={value || "all"} value={value}>
              {value || "All statuses"}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Temperature</label>
        <select
          value={filters.temperature}
          onChange={(e) => onFilterChange({ ...filters, temperature: e.target.value })}
        >
          {temperatures.map((value) => (
            <option key={value || "all"} value={value}>
              {value || "All temperatures"}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="button button-secondary compact" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}

export default LeadFilters;
