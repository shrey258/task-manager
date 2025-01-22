import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import Dashboard from '@/components/Dashboard';
import type { TaskStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const { isAuthenticated } = useAuth();
  const { fetchTaskStats, isLoadingStats, error } = useTasks();
  const router = useRouter();

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchTaskStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [fetchTaskStats]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Initial load
    loadStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(loadStats, 300000);

    return () => clearInterval(interval);
  }, [isAuthenticated, router, loadStats]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingStats && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        <Dashboard stats={stats} />
      </div>
    </div>
  );
}
