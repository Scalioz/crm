import { X } from "lucide-react";
import highlightText from "../ui/HighlightText";

function GlobalSearch({ query, results, onClose }) {
  const normalizedQuery = query.trim().toLowerCase();

  return (
    <div className="global-search-overlay">
      <div className="global-search-panel">
        <div className="global-search-header">
          <div>
            <p className="eyebrow">Global search</p>
            <h2>Search results for "{normalizedQuery}"</h2>
          </div>
          <button type="button" className="icon-button close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="global-search-body">
          {normalizedQuery === "" ? (
            <div className="empty-state">
              <h3>Start typing to search your CRM</h3>
              <p>Search by lead name, company, phone, email, tags or notes.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <h3>No results found</h3>
              <p>Try broader terms or remove filters.</p>
            </div>
          ) : (
            <div className="search-results">
              {results.map((lead) => (
                <div key={lead.id} className="search-result-card">
                  <div className="result-card-header">
                    <h4>{highlightText(lead.name, normalizedQuery)}</h4>
                    <span>{lead.company}</span>
                  </div>
                  <p>{highlightText(lead.email || lead.phone || "", normalizedQuery)}</p>
                  <div className="search-result-tags">
                    {lead.tags?.map((tag) => (
                      <span key={tag} className="chip chip-small">
                        {highlightText(tag, normalizedQuery)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
