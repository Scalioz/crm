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

export async function getTasks() {
  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return data;
}

export async function createTask(task) {
  const payload = buildTaskPayload(task);
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
