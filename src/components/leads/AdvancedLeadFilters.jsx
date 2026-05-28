import Chip from "../ui/Chip";
import { useMemo } from "react";

function AdvancedLeadFilters({ leads, filters, onFilterChange, onClear }) {
  const statuses = useMemo(() => [...new Set(leads.map((lead) => lead.status))], [leads]);
  const sources = useMemo(() => [...new Set(leads.map((lead) => lead.source))], [leads]);
  const priorities = ["High", "Medium", "Low"];
  const assigned = useMemo(() => [...new Set(leads.map((lead) => lead.assignedTo).filter(Boolean))], [leads]);
  const tags = useMemo(() => [...new Set(leads.flatMap((lead) => lead.tags ?? []))], [leads]);

  const activeFilters = Object.entries(filters).filter(([, value]) => value && (Array.isArray(value) ? value.length > 0 : true));

  const handleTagToggle = (tag) => {
    const currentTags = filters.tags ?? [];
    if (currentTags.includes(tag)) {
      onFilterChange({ ...filters, tags: currentTags.filter((item) => item !== tag) });
    } else {
      onFilterChange({ ...filters, tags: [...currentTags, tag] });
    }
  };

  return (
    <div className="advanced-filters-panel">
      <div className="filters-grid">
        <div className="filter-group">
          <label>Status</label>
          <select value={filters.status} onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select value={filters.priority} onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}>
            <option value="">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Source</label>
          <select value={filters.source} onChange={(e) => onFilterChange({ ...filters, source: e.target.value })}>
            <option value="">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Assigned</label>
          <select value={filters.assignedTo} onChange={(e) => onFilterChange({ ...filters, assignedTo: e.target.value })}>
            <option value="">Anyone</option>
            {assigned.map((person) => (
              <option key={person} value={person}>{person}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Date created</label>
          <input type="date" value={filters.createdAfter} onChange={(e) => onFilterChange({ ...filters, createdAfter: e.target.value })} />
        </div>
        <div className="filter-group">
          <label>Follow-up due</label>
          <select value={filters.followUpDue} onChange={(e) => onFilterChange({ ...filters, followUpDue: e.target.value })}>
            <option value="">Any</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      <div className="filter-tags-panel">
        <div className="filter-tags-list">
          {tags.map((tag) => (
            <Chip
              key={tag}
              className={filters.tags?.includes(tag) ? "chip-active" : ""}
              onRemove={filters.tags?.includes(tag) ? () => handleTagToggle(tag) : undefined}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-summary-row">
        <div>
          {activeFilters.length > 0 && (
            <p className="filter-pill-count">{activeFilters.length} active filters</p>
          )}
        </div>
        <button type="button" className="button button-secondary compact" onClick={onClear}>
          Clear filters
        </button>
      </div>
    </div>
  );
}

export default AdvancedLeadFilters;
