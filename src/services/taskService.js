import { supabase } from "../lib/supabase";

function buildTaskPayload(task) {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date || null,
    related_lead_id: task.related_lead_id || null,
  };
}

export async function getTasks(clinicId) {
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (clinicId) {
    query = query.eq("clinic_id", clinicId);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}

// clinicId must be passed in from the logged-in user's profile
// (see AuthContext's clinicId). Without it, the database will
// reject the insert, since Row Level Security requires every new
// task to be tagged with the creator's own clinic.
export async function createTask(task, clinicId) {
  const payload = { ...buildTaskPayload(task), clinic_id: clinicId };
  const { data, error } = await supabase.from("tasks").insert([payload]).select().single();
  if (error) {
    throw error;
  }
  return data;
}

export async function updateTask(id, updates) {
  const payload = buildTaskPayload(updates);
  const { data, error } = await supabase.from("tasks").update(payload).eq("id", id).select().single();
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

export function subscribeTasks(onUpdate) {
  const channel = supabase
    .channel("tasks-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      (payload) => {
        if (typeof onUpdate === "function") {
          onUpdate(payload);
        }
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
