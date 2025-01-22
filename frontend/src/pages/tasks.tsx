import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import type { Task } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    sortBy: '',
  });

  const { isAuthenticated } = useAuth();
  const { fetchTasks, createTask, updateTask, deleteTask, loading } = useTasks();
  const router = useRouter();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadTasks();
  }, [isAuthenticated, currentPage, filters]);

  const loadTasks = async () => {
    const response = await fetchTasks({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      ...(filters.priority && { priority: parseInt(filters.priority) }),
      ...(filters.status && { status: filters.status as 'pending' | 'finished' }),
      ...(filters.sortBy && { sortBy: filters.sortBy as 'startTime' | 'endTime' }),
    });

    if (response) {
      setTasks(response.tasks);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, '_id' | 'user' | 'createdAt' | 'updatedAt'>) => {
    const newTask = await createTask(taskData);
    if (newTask) {
      setShowForm(false);
      loadTasks();
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, '_id' | 'user' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      const updated = await updateTask(editingTask._id, taskData);
      if (updated) {
        setEditingTask(null);
        loadTasks();
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const success = await deleteTask(taskId);
      if (success) {
        loadTasks();
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">All Priorities</option>
          {[1, 2, 3, 4, 5].map((p) => (
            <option key={p} value={p}>
              Priority {p}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="finished">Finished</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="border rounded p-2"
        >
          <option value="">Sort By</option>
          <option value="startTime">Start Time</option>
          <option value="endTime">End Time</option>
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No tasks found. Create one to get started!
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h2>
            <TaskForm
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              initialData={editingTask || undefined}
              buttonText={editingTask ? 'Update Task' : 'Create Task'}
            />
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
