import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import GlobalSearch from "./components/layout/GlobalSearch";
import QuickActionsPanel from "./components/layout/QuickActionsPanel";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Placeholder from "./pages/Placeholder";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import sampleLeads from "./data/sampleLeads";
import { createActivityEntry, createNoteEntry } from "./utils/leadHelpers";
import { exportLeadsToCsv } from "./utils/csvExport";
import { ToastProvider, useToast } from "./components/ui/ToastProvider";
import { supabase } from "./lib/supabase";

function AppRoutes() {
  const [leads, setLeads] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem("crm-theme") || "light");
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isLoading: authLoading } = useAuth();

  const isAuthRoute = location.pathname === "/login";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("crm-theme", theme);
  }, [theme]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return leads.filter((lead) => {
      const haystack = [
        lead.name,
        lead.company,
        lead.phone,
        lead.email,
        lead.assignedTo,
        ...(lead.tags ?? []),
        lead.notes,
        ...(lead.notesHistory ?? []).map((note) => note.text),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [leads, searchQuery]);

  const isSupabaseEnabled = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const mapLeadFromDb = (record) => ({
    id: record.id,
    name: record.name || "",
    email: record.email || "",
    phone: record.phone || "",
    company: record.company || "",
    source: record.source || "",
    serviceInterest: record.service || "",
    status: record.status || "",
    temperature: record.temperature || "",
    followUpDate: record.follow_up_date || record.followUpDate || "",
    notes: record.notes || "",
    createdAt: record.created_at || record.createdAt || new Date().toISOString(),
    assignedTo: record.assigned_to || record.assignedTo || "",
    tags: record.tags || record.tags || [],
    notesHistory: record.notes_history || record.notesHistory || [],
    activity: record.activity || [],
  });

  const mapLeadToDb = (lead) => ({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    service: lead.serviceInterest,
    status: lead.status,
    temperature: lead.temperature,
    follow_up_date: lead.followUpDate,
    notes: lead.notes,
  });

  const { addToast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoadingLeads(true);

      if (!isSupabaseEnabled) {
        setLeads(sampleLeads);
        setIsLoadingLeads(false);
        return;
      }

      if (!user) {
        setLeads([]);
        setIsLoadingLeads(false);
        return;
      }

      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

      if (error) {
        addToast(`Unable to load leads: ${error.message}`, "danger");
        setLeads(sampleLeads);
      } else {
        setLeads(data.map(mapLeadFromDb));
      }

      setIsLoadingLeads(false);
    };

    if (!authLoading) {
      void fetchLeads();
    }
  }, [authLoading, isSupabaseEnabled, user]);

  const saveLead = async (lead) => {
    const existingIndex = leads.findIndex((item) => item.id === lead.id);
    const liveLead = leads[existingIndex];
    const activityEvent = createActivityEntry(
      existingIndex >= 0 ? "Lead edited" : "Lead created",
      existingIndex >= 0 ? "Lead details updated." : "New lead record created."
    );

    const nextLead = {
      ...lead,
      notesHistory: liveLead?.notesHistory ?? lead.notesHistory ?? [],
      activity: [...(liveLead?.activity ?? lead.activity ?? []), activityEvent],
    };

    if (!isSupabaseEnabled) {
      setLeads((current) =>
        existingIndex >= 0
          ? current.map((item) => (item.id === lead.id ? nextLead : item))
          : [nextLead, ...current]
      );
      return;
    }

    const payload = mapLeadToDb(lead);

    if (existingIndex >= 0) {
      const { data, error } = await supabase.from("leads").update(payload).eq("id", lead.id).select().single();
      if (error) {
        addToast(`Unable to update lead: ${error.message}`, "danger");
        throw error;
      }
      const updatedLead = mapLeadFromDb(data);
      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id ? { ...item, ...nextLead, ...updatedLead } : item
        )
      );
      return;
    }

    const { data, error } = await supabase.from("leads").insert([payload]).select().single();
    if (error) {
      addToast(`Unable to create lead: ${error.message}`, "danger");
      throw error;
    }

    const createdLead = { ...nextLead, ...mapLeadFromDb(data) };
    setLeads((current) => [createdLead, ...current]);
  };

  const deleteLead = async (leadId) => {
    if (isSupabaseEnabled) {
      setIsDeletingLead(true);
      const { error } = await supabase.from("leads").delete().eq("id", leadId);
      setIsDeletingLead(false);
      if (error) {
        addToast(`Unable to delete lead: ${error.message}`, "danger");
        throw error;
      }
    }

    setLeads((current) => current.filter((lead) => lead.id !== leadId));
  };

  const updateLead = async (leadId, updates, description = "Lead updated.") => {
    const existingLead = leads.find((lead) => lead.id === leadId);
    if (!existingLead) return;

    const nextLead = {
      ...existingLead,
      ...updates,
      activity: [...(existingLead.activity ?? []), createActivityEntry("Lead updated", description)],
    };

    const updatePayload = mapLeadToDb(nextLead);

    if (isSupabaseEnabled && Object.keys(updatePayload).length > 0) {
      const { error } = await supabase.from("leads").update(updatePayload).eq("id", leadId);
      if (error) {
        addToast(`Unable to update lead: ${error.message}`, "danger");
        return;
      }
    }

    setLeads((current) => current.map((lead) => (lead.id === leadId ? nextLead : lead)));
  };

  const addLeadNote = (leadId, noteText) => {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              notesHistory: [...(lead.notesHistory ?? []), createNoteEntry(noteText)],
              notes: noteText,
              activity: [
                ...(lead.activity ?? []),
                createActivityEntry("Note added", `Added note: ${noteText.slice(0, 80)}`),
              ],
            }
          : lead
      )
    );
  };

  const clearFollowUp = (leadId) => {
    updateLead(leadId, { followUpDate: "" }, "Follow-up completed and cleared.");
  };

  const handleQuickAdd = () => {
    setMobileSidebarOpen(false);
    setSearchOpen(false);
    navigate("/leads", { state: { openAdd: true } });
  };

  const handleQuickFollowUp = () => {
    setMobileSidebarOpen(false);
    navigate("/tasks");
  };

  const handleQuickTask = () => {
    setMobileSidebarOpen(false);
    navigate("/tasks", { state: { createTask: true } });
  };

  const handleExportAll = () => {
    exportLeadsToCsv(leads, "Scalioz_CRM_Export.csv");
  };

  const closeSearch = () => setSearchOpen(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      // ignore logout errors here; auth provider will manage session state
    }
  };

  return (
    <div className="app-shell">
      {!isAuthRoute && <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />}
      <main className="main-shell">
        {!isAuthRoute && (
          <Topbar
            searchQuery={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setSearchOpen(true);
            }}
            onOpenSearch={() => setSearchOpen(true)}
            onToggleSidebar={() => setMobileSidebarOpen((current) => !current)}
            onQuickAdd={handleQuickAdd}
            theme={theme}
            onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            onLogout={handleLogout}
            isMobileOpen={mobileSidebarOpen}
          />
        )}

        <div className="page-frame">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard leads={leads} /></ProtectedRoute>} />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Leads
                    leads={leads}
                    onSaveLead={saveLead}
                    onDeleteLead={deleteLead}
                    onUpdateLead={updateLead}
                    onAddNote={addLeadNote}
                    onCompleteFollowUp={clearFollowUp}
                    isLoadingLeads={isLoadingLeads}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="/pipeline" element={<ProtectedRoute><Pipeline leads={leads} onUpdateStatus={updateLead} /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks leads={leads} onCompleteFollowUp={clearFollowUp} /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports leads={leads} /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings theme={theme} onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))} /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Placeholder title="Messages" subtitle="Message center" /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {!isAuthRoute && (
        <QuickActionsPanel
          onAddLead={handleQuickAdd}
          onAddFollowUp={handleQuickFollowUp}
          onCreateTask={handleQuickTask}
          onExport={handleExportAll}
        />
      )}

      {searchOpen && <GlobalSearch query={searchQuery} results={searchResults} onClose={closeSearch} />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
