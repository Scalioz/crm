import { useCallback, useEffect, useState } from "react";
import { createTask as apiCreateTask, deleteTask as apiDeleteTask, getTasks as apiGetTasks, subscribeTasks as apiSubscribeTasks, updateTask as apiUpdateTask } from "../services/taskService";

export function useTasks({ onError } = {}) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback(
    (error) => {
      setError(error);
      if (typeof onError === "function") {
        onError(error);
      }
    },
    [onError]
  );

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGetTasks();
      setTasks(data ?? []);
      return data ?? [];
    } catch (loadError) {
      handleError(loadError);
      setTasks([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const createTask = useCallback(
    async (task) => {
      setIsSaving(true);
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const optimisticTask = {
        ...task,
        id: optimisticId,
        created_at: new Date().toISOString(),
      };

      setTasks((current) => [optimisticTask, ...current]);

      try {
        const created = await apiCreateTask(task);
        setTasks((current) => current.map((item) => (item.id === optimisticId ? created : item)));
        return created;
      } catch (createError) {
        setTasks((current) => current.filter((item) => item.id !== optimisticId));
        handleError(createError);
        throw createError;
      } finally {
        setIsSaving(false);
      }
    },
    [handleError]
  );

  const updateTask = useCallback(
    async (id, updates) => {
      setIsSaving(true);
      let previousTask;

      setTasks((current) =>
        current.map((task) => {
          if (task.id !== id) {
            return task;
          }
          previousTask = task;
          return { ...task, ...updates };
        })
      );

      try {
        const updated = await apiUpdateTask(id, updates);
        setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
        return updated;
      } catch (updateError) {
        if (previousTask) {
          setTasks((current) => current.map((task) => (task.id === id ? previousTask : task)));
        }
        handleError(updateError);
        throw updateError;
      } finally {
        setIsSaving(false);
      }
    },
    [handleError]
  );

  const deleteTask = useCallback(
    async (id) => {
      setIsDeleting(true);
      let deletedTask;

      setTasks((current) => current.filter((task) => {
        if (task.id === id) {
          deletedTask = task;
          return false;
        }
        return true;
      }));

      try {
        await apiDeleteTask(id);
      } catch (deleteError) {
        if (deletedTask) {
          setTasks((current) => [deletedTask, ...current]);
        }
        handleError(deleteError);
        throw deleteError;
      } finally {
        setIsDeleting(false);
      }
    },
    [handleError]
  );

  const completeTask = useCallback(
    async (task) => {
      return updateTask(task.id, { status: "Completed" });
    },
    [updateTask]
  );

  useEffect(() => {
    let unsubscribe;

    void loadTasks();

    if (typeof apiSubscribeTasks === "function") {
      unsubscribe = apiSubscribeTasks(async () => {
        await loadTasks();
      });
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [loadTasks]);

  return {
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
  };
}
