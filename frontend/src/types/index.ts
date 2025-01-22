export interface Task {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: number;
  status: 'pending' | 'finished';
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  totalTasks: number;
  taskStatus: {
    completed: {
      count: number;
      percentage: number;
    };
    pending: {
      count: number;
      percentage: number;
    };
  };
  pendingTasksByPriority: {
    _id: number;
    timeLapsed: number;
    balanceTime: number;
  }[];
  averageCompletionTime: number;
}

export interface User {
  email: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
