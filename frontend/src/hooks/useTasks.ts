import { useState, useCallback } from 'react';
import { Task, TaskStats } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface TaskFilters {
  priority?: number;
  status?: 'pending' | 'finished';
  sortBy?: 'startTime' | 'endTime';
  page?: number;
  limit?: number;
}

interface LoadingStates {
  tasks: boolean;
  stats: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export function useTasks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<LoadingStates>({
    tasks: false,
    stats: false,
    create: false,
    update: false,
    delete: false
  });
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, [user?.token]);

  const createTask = useCallback(async (taskData: {
    title: string;
    startTime: string;
    endTime: string;
    priority: number;
    status: 'pending' | 'finished';
  }) => {
    try {
      setLoading(prev => ({ ...prev, create: true }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) throw new Error('Failed to create task');
      return await response.json() as Task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [user?.token]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      setLoading(prev => ({ ...prev, update: true }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error('Failed to update task');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, [user?.token]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete task');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [user?.token]);

  const fetchTaskStats = useCallback(async (): Promise<TaskStats | null> => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/stats`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch task statistics');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [user?.token]);

  return {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchTaskStats,
    loading: loading.tasks || loading.stats || loading.create || loading.update || loading.delete,
    isLoadingStats: loading.stats,
    error,
  };
}
