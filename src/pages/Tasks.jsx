import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, CheckCircle2, Trash2, X } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import { getFollowUpStatus } from "../utils/leadHelpers";
import { useToast } from "../components/ui/ToastProvider";
import { useTasks } from "../hooks/useTasks";
import { useFormState } from "../hooks/useFormState";

function formatFollowUpDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.valueOf())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatNotesPreview(notes) {
  if (!notes) return "No notes available.";
  return notes.length > 90 ? `${notes.slice(0, 90)}...` : notes;
}

function formatPhoneLink(phone) {
  return `https://wa.me/${String(phone).replace(/[^0-9]/g, "")}`;
}

const statusOrder = ["overdue", "today", "upcoming", "later"];
const statusLabel = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
  later: "Scheduled",
};

const defaultTask = {
  title: "",
  description: "",
  status: "Open",
  priority: "Medium",
  due_date: "",
  related_lead_id: "",
};

function mapPriorityToTemperature(priority) {
  switch (priority?.toLowerCase()) {
    case "high":
      return "Hot";
    case "medium":
      return "Warm";
    case "low":
      return "Cold";
    default:
      return "Warm";
  }
}

function Tasks({ leads, onCompleteFollowUp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const {
    tasks,
    isLoading,
    isSaving,
    isDeleting,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  } = useTasks({ onError: addToast });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const taskForm = useFormState(defaultTask);
  const [selectedTask, setSelectedTask] = useState(null);
  const submitInProgressRef = useRef(false);
  const deleteInProgressRef = useRef(false);

  const taskLeadMap = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);

  useEffect(() => {
    if (location.state?.createTask) {
      setShowTaskModal(true);
      setModalMode("add");
      taskForm.resetForm(defaultTask);
      setSelectedTask(null);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state, taskForm.resetForm]);

  const mapTaskToView = (task) => {
    const relatedLead = taskLeadMap.get(task.related_lead_id);
    return {
      ...task,
      name: relatedLead?.name || task.title || "Untitled task",
      company: relatedLead?.company || "",
      phone: relatedLead?.phone || "",
      notes: task.description || "",
      followUpDate: task.due_date || "",
      assignedTo: relatedLead?.assignedTo || "Team",
      temperature: mapPriorityToTemperature(task.priority),
    };
  };

  const tasksWithLeads = useMemo(() => tasks.map(mapTaskToView), [tasks, taskLeadMap]);

  const summary = useMemo(
    () =>
      tasksWithLeads.reduce(
        (acc, task) => {
          const status = getFollowUpStatus(task).state;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { overdue: 0, today: 0, upcoming: 0, later: 0 }
      ),
    [tasksWithLeads]
  );

  const totalCompleted = useMemo(
    () => tasksWithLeads.filter((task) => task.status?.toLowerCase() === "completed").length,
    [tasksWithLeads]
  );

  const openNewTask = () => {
    setModalMode("add");
    taskForm.resetForm(defaultTask);
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setModalMode("edit");
    setSelectedTask(task);
    taskForm.resetForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Open",
      priority: task.priority || "Medium",
      due_date: task.due_date || "",
      related_lead_id: task.related_lead_id || "",
    });
    setShowTaskModal(true);
  };

  const closeModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    taskForm.resetForm(defaultTask);
    setModalMode("add");
  };

  const handleDraftChange = taskForm.handleChange;

  const handleSaveTask = async (event) => {
    event.preventDefault();

    if (submitInProgressRef.current || isSaving || isDeleting) {
      return;
    }

    if (!taskForm.values.title.trim()) {
      addToast("Task title is required.", "danger");
      return;
    }

    submitInProgressRef.current = true;

    try {
      if (modalMode === "add") {
        await createTask(taskForm.values);
        addToast("Task created successfully.", "success");
      } else if (selectedTask) {
        await updateTask(selectedTask.id, taskForm.values);
        addToast("Task updated successfully.", "success");
      }
      closeModal();
    } catch (error) {
      addToast(error.message || "Unable to save task.", "danger");
    } finally {
      submitInProgressRef.current = false;
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask || deleteInProgressRef.current || isSaving || isDeleting) return;
    if (!window.confirm("Delete this task? This action cannot be undone.")) {
      return;
    }

    deleteInProgressRef.current = true;

    try {
      await deleteTask(selectedTask.id);
      addToast("Task deleted successfully.", "success");
      closeModal();
    } catch (error) {
      addToast(error.message || "Unable to delete task.", "danger");
    } finally {
      deleteInProgressRef.current = false;
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await completeTask(task);
      addToast("Task marked completed.", "success");
    } catch (error) {
      addToast(error.message || "Unable to complete task.", "danger");
    }
  };

  const relatedLeadOptions = useMemo(
    () => leads.map((lead) => ({ id: lead.id, label: `${lead.name} — ${lead.company || "No company"}` })),
    [leads]
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>Follow-up management</h1>
          <p className="page-description">
            Track overdue, today, and upcoming follow-ups with built-in urgency indicators.
          </p>
        </div>
      </div>

      <div className="card-grid task-summary-grid">
        <div className="card">
          <p className="card-title">Overdue follow-ups</p>
          <h2>{summary.overdue}</h2>
          <p className="card-note">Needs immediate attention</p>
        </div>
        <div className="card">
          <p className="card-title">Today</p>
          <h2>{summary.today}</h2>
          <p className="card-note">Due by end of day</p>
        </div>
        <div className="card">
          <p className="card-title">Upcoming</p>
          <h2>{summary.upcoming}</h2>
          <p className="card-note">Scheduled within a week</p>
        </div>
        <div className="card">
          <p className="card-title">Completed</p>
          <h2>{totalCompleted}</h2>
          <p className="card-note">Closed or cleared tasks</p>
        </div>
      </div>

      {isLoading ? (
        <div className="table-card">
          <div className="empty-state">
            <h3>Loading tasks…</h3>
            <p>Fetching tasks from Supabase.</p>
          </div>
        </div>
      ) : error ? (
        <div className="table-card">
          <div className="empty-state">
            <h3>Unable to load tasks</h3>
            <p>{error.message || "There was an issue loading tasks. Try refreshing the page."}</p>
          </div>
        </div>
      ) : tasksWithLeads.length === 0 ? (
        <EmptyState
          title="No follow-ups scheduled"
          description="Create a task or connect a follow-up date to an existing lead to get started."
          actionLabel="View leads"
          onAction={() => navigate("/leads")}
        />
      ) : (
        <div className="task-grid">
          {statusOrder.map((status) => (
            <div key={status} className="task-column">
              <div className="task-column-header">
                <h3>{statusLabel[status]}</h3>
                <span>{summary[status]} items</span>
              </div>
              <div className="task-column-body">
                {tasksWithLeads
                  .filter((task) => getFollowUpStatus(task).state === status)
                  .sort((a, b) => new Date(a.followUpDate).valueOf() - new Date(b.followUpDate).valueOf())
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`task-card task-card-${status}`}
                      onClick={() => openEditTask(task)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="task-card-head">
                        <div>
                          <h4>{task.name}</h4>
                          <p>{task.company}</p>
                        </div>
                        <div className="task-card-meta">
                          <span>{formatFollowUpDate(task.followUpDate)}</span>
                          <span>{task.assignedTo || "Team"}</span>
                        </div>
                      </div>
                      <div className="task-card-body">
                        <span className={`pill status-pill status-${task.status?.replace(/\s+/g, "-").toLowerCase()}`}>
                          {task.status}
                        </span>
                        <p>{formatNotesPreview(task.notes)}</p>
                      </div>
                      <div className="task-card-footer">
                        <a
                          href={formatPhoneLink(task.phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-secondary"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                        <button
                          type="button"
                          className="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCompleteTask(task);
                          }}
                        >
                          <CheckCircle2 size={16} /> Complete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">{modalMode === "edit" ? "Edit task" : "New task"}</p>
                <h2>{modalMode === "edit" ? "Update task details" : "Create a task"}</h2>
              </div>
              <button type="button" className="icon-button close-button" onClick={closeModal} title="Close form">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form id="task-form" className="lead-form" onSubmit={handleSaveTask}>
                <div className="lead-form-body">
                  <div className="form-row">
                    <div className="field-group">
                      <label>Title</label>
                      <input value={taskForm.values.title} onChange={handleDraftChange("title")} required />
                    </div>
                    <div className="field-group">
                      <label>Due date</label>
                      <input type="date" value={taskForm.values.due_date} onChange={handleDraftChange("due_date")} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Status</label>
                      <select value={taskForm.values.status} onChange={handleDraftChange("status")}> 
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Blocked</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Priority</label>
                      <select value={taskForm.values.priority} onChange={handleDraftChange("priority")}> 
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Related lead</label>
                      <select value={taskForm.values.related_lead_id} onChange={handleDraftChange("related_lead_id")}> 
                        <option value="">None</option>
                        {relatedLeadOptions.map((lead) => (
                          <option key={lead.id} value={lead.id}>
                            {lead.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Description</label>
                      <textarea value={taskForm.values.description} onChange={handleDraftChange("description")} rows="4" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="button button-secondary" onClick={closeModal} disabled={isSaving || isDeleting}>
                Cancel
              </button>
              {modalMode === "edit" && (
                <button type="button" className="button button-secondary" onClick={handleDeleteTask} disabled={isSaving || isDeleting}>
                  <Trash2 size={16} /> Delete
                </button>
              )}
              <button type="submit" form="task-form" className="button" disabled={isSaving || isDeleting || !taskForm.values.title.trim()}>
                {isSaving ? "Saving..." : modalMode === "edit" ? "Save task" : "Create task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
