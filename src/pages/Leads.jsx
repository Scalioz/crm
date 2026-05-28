import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Download, X } from "lucide-react";
import { brand } from "../data/brand";
import LeadFilters from "../components/leads/LeadFilters";
import LeadTable from "../components/leads/LeadTable";
import LeadForm from "../components/leads/LeadForm";
import LeadDetailDrawer from "../components/leads/LeadDetailDrawer";
import { useToast } from "../components/ui/ToastProvider";
import { exportLeadsToCsv } from "../utils/csvExport";

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

function Leads({
  leads,
  onSaveLead,
  onDeleteLead,
  onUpdateLead,
  onAddNote,
  onCompleteFollowUp,
  isLoadingLeads,
}) {
  const location = useLocation();
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    source: "",
    serviceInterest: "",
    status: "",
    temperature: "",
  });
  const [sortKey, setSortKey] = useState("followUpDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [compactMode, setCompactMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [editorLead, setEditorLead] = useState(null);
  const [editorMode, setEditorMode] = useState("add");
  const [showForm, setShowForm] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const queryText = search.toLowerCase();
        return (
          !queryText ||
          lead.name.toLowerCase().includes(queryText) ||
          lead.company.toLowerCase().includes(queryText) ||
          lead.email.toLowerCase().includes(queryText) ||
          lead.phone.toLowerCase().includes(queryText)
        );
      })
      .filter((lead) => (filters.source ? lead.source === filters.source : true))
      .filter((lead) =>
        filters.serviceInterest ? lead.serviceInterest === filters.serviceInterest : true
      )
      .filter((lead) => (filters.status ? lead.status === filters.status : true))
      .filter((lead) =>
        filters.temperature ? lead.temperature === filters.temperature : true
      );
  }, [leads, search, filters]);

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];

    sorted.sort((a, b) => {
      const first = a[sortKey] ?? "";
      const second = b[sortKey] ?? "";

      if (sortKey === "createdAt" || sortKey === "followUpDate") {
        return (
          (new Date(first).valueOf() - new Date(second).valueOf()) *
          (sortDirection === "asc" ? 1 : -1)
        );
      }

      return (
        String(first).localeCompare(String(second), "en", {
          sensitivity: "base",
        }) * (sortDirection === "asc" ? 1 : -1)
      );
    });

    return sorted;
  }, [filteredLeads, sortKey, sortDirection]);

  const leadStats = useMemo(
    () =>
      filteredLeads.reduce(
        (acc, lead) => {
          const key = lead.temperature.toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          acc.total += 1;
          return acc;
        },
        { total: 0, hot: 0, warm: 0, cold: 0 }
      ),
    [filteredLeads]
  );

  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / rowsPerPage));

  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const selectedCount = selectedLeadIds.length;
  const isLoading = isLoadingLeads;

  useEffect(() => {
    setSelectedLeadIds((current) =>
      current.filter((id) => filteredLeads.some((lead) => lead.id === id))
    );
    setCurrentPage(1);
  }, [filteredLeads]);

  useEffect(() => {
    if (location.state?.openAdd) {
      setEditorLead({ ...emptyLead, createdAt: new Date().toISOString() });
      setEditorMode("add");
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const handleToggleLeadSelection = (leadId) => {
    setSelectedLeadIds((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId]
    );
  };

  const handleToggleSelectAll = () => {
    const currentPageIds = paginatedLeads.map((lead) => lead.id);
    const allSelected = currentPageIds.every((id) =>
      selectedLeadIds.includes(id)
    );

    setSelectedLeadIds((current) =>
      allSelected
        ? current.filter((id) => !currentPageIds.includes(id))
        : [...new Set([...current, ...currentPageIds])]
    );
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedLeadIds.length === 0) return;

    try {
      switch (bulkAction) {
        case "delete":
          await Promise.all(selectedLeadIds.map((leadId) => onDeleteLead(leadId)));
          addToast(`${selectedLeadIds.length} lead(s) deleted.`, "success");
          setSelectedLeadIds([]);
          break;

        case "assign":
          await Promise.all(
            selectedLeadIds.map((leadId) =>
              onUpdateLead(
                leadId,
                { assignedTo: "Sales team" },
                "Assigned lead to sales team."
              )
            )
          );
          addToast(`${selectedLeadIds.length} lead(s) assigned.`, "info");
          break;

        case "status":
          await Promise.all(
            selectedLeadIds.map((leadId) =>
              onUpdateLead(
                leadId,
                { status: "Follow-up" },
                "Updated status to Follow-up."
              )
            )
          );
          addToast(`${selectedLeadIds.length} lead(s) updated.`, "info");
          break;

        case "export":
          exportLeadsToCsv(
            sortedLeads.filter((lead) => selectedLeadIds.includes(lead.id)),
            "Scalioz_CRM_Export_Selected.csv"
          );
          addToast(`${selectedLeadIds.length} lead(s) exported.`, "success");
          break;

        default:
          break;
      }
    } catch (error) {
      addToast(error?.message || "Bulk lead action failed.", "danger");
    } finally {
      setBulkAction("");
    }
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (direction) => {
    setCurrentPage((current) => {
      const next = direction === "prev" ? current - 1 : current + 1;
      return Math.min(Math.max(next, 1), totalPages);
    });
  };

  const handleEdit = (lead) => {
    setEditorLead(lead);
    setEditorMode("edit");
    setShowForm(true);
  };

  const handleView = (lead) => {
    setEditorLead(lead);
    setEditorMode("view");
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditorLead({ ...emptyLead, createdAt: new Date().toISOString() });
    setEditorMode("add");
    setShowForm(true);
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Delete this lead? This action cannot be undone.")) return;
    await onDeleteLead(leadId);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditorLead(null);
  };

  const handleSubmit = async (lead) => {
    setIsSavingLead(true);

    try {
      await onSaveLead(lead);
      addToast("Lead saved successfully.", "success");
      setShowForm(false);
      setEditorLead(null);
    } catch (error) {
      addToast(error?.message || "Could not save lead.", "danger");
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      source: "",
      serviceInterest: "",
      status: "",
      temperature: "",
    });
  };

  return (
    <div className="page-content leads-page">
      <div className="page-header leads-page-header">
        <div>
          <p className="eyebrow">Leads</p>
          <h1>{brand.appName}</h1>
          <p className="page-description">
            Search, filter, and manage your pipeline with Scalioz branding.
          </p>
        </div>

        <div className="action-group">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => exportLeadsToCsv(filteredLeads, brand.exportFilename)}
          >
            <Download size={16} /> Export CSV
          </button>

          <button type="button" className="button" onClick={handleAdd}>
            <Plus size={16} /> Add lead
          </button>
        </div>
      </div>

      <section className="lead-stat-strip">
        <div>
          <span>Total visible</span>
          <strong>{filteredLeads.length}</strong>
        </div>
        <div>
          <span>Selected</span>
          <strong>{selectedCount}</strong>
        </div>
        <div>
          <span>Hot leads</span>
          <strong>{leadStats.hot}</strong>
        </div>
        <div>
          <span>Warm leads</span>
          <strong>{leadStats.warm}</strong>
        </div>
      </section>

      <div className="leads-toolbar">
        <div>
          <p className="text-sm">{filteredLeads.length} leads found</p>
          <p className="lead-meta">
            {selectedCount > 0 ? `${selectedCount} selected • ` : ""}
            Sorted by {sortKey === "followUpDate" ? "follow-up" : sortKey} ·{" "}
            {sortDirection.toUpperCase()}
          </p>
        </div>

        <div className="bulk-toolbar">
          <select
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value)}
          >
            <option value="">Bulk action</option>
            <option value="delete">Delete selected</option>
            <option value="assign">Assign selected</option>
            <option value="status">Mark follow-up</option>
            <option value="export">Export selected</option>
          </select>

          <button
            type="button"
            className="button button-secondary"
            onClick={handleBulkApply}
            disabled={!bulkAction || selectedCount === 0}
          >
            Apply
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setCompactMode((current) => !current)}
          >
            {compactMode ? "Standard mode" : "Compact mode"}
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setSelectedLeadIds([])}
            disabled={selectedCount === 0}
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="leads-main-panel">
        <div className="search-wrapper">
          <input
            className="search-input"
            placeholder="Search leads by name, company, email or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <LeadFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <div className="table-card">
            <div className="empty-state">
              <h3>Loading leads…</h3>
              <p>Fetching your lead list from Supabase.</p>
            </div>
          </div>
        ) : (
          <LeadTable
            leads={paginatedLeads}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selected={selectedLeadIds}
            onToggleSelect={handleToggleLeadSelection}
            onToggleSelectAll={handleToggleSelectAll}
            allSelected={
              paginatedLeads.length > 0 &&
              paginatedLeads.every((lead) => selectedLeadIds.includes(lead.id))
            }
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            compactMode={compactMode}
            rowsPerPage={rowsPerPage}
            noResults={!isLoading && filteredLeads.length === 0}
            onEmptyAction={handleAdd}
          />
        )}

        <div className="pagination-panel">
          <div className="pagination-info">
            <span>Rows per page</span>
            <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
              {[5, 8, 12, 16].map((amount) => (
                <option key={amount} value={amount}>
                  {amount}
                </option>
              ))}
            </select>
          </div>

          <div className="pagination-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="button button-secondary"
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        <div className="export-center-card">
          <h3>Export center</h3>
          <p>
            Download current lead selection, visible results, or the full Scalioz
            export package.
          </p>

          <div className="export-actions">
            <button
              type="button"
              className="button"
              onClick={() =>
                exportLeadsToCsv(
                  filteredLeads,
                  "Scalioz_CRM_Export_Visible.csv"
                )
              }
            >
              Export visible
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                exportLeadsToCsv(leads, "Scalioz_CRM_Export_All.csv")
              }
            >
              Export all
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="modal-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editorMode === "view" ? "Lead detail" : "Lead form"}
                </p>

                <h2>
                  {editorMode === "view"
                    ? "View lead"
                    : editorMode === "edit"
                    ? "Edit lead"
                    : "New lead"}
                </h2>
              </div>

              <button
                type="button"
                className="icon-button close-button"
                onClick={handleCancel}
                title="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {editorMode === "view" ? (
                <LeadDetailDrawer
                  lead={editorLead}
                  onClose={handleCancel}
                  onUpdateLead={onUpdateLead}
                  onAddNote={onAddNote}
                  onCompleteFollowUp={onCompleteFollowUp}
                />
              ) : (
                <LeadForm
                  lead={editorLead}
                  mode={editorMode}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  loading={isSavingLead}
                  formId="lead-form"
                  showActions={false}
                />
              )}
            </div>

            {editorMode !== "view" && (
              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleCancel}
                  disabled={isSavingLead}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button"
                  form="lead-form"
                  disabled={isSavingLead}
                >
                  {isSavingLead ? "Saving..." : "Save lead"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;