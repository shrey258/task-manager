import { Request, Response } from 'express';
import { Task } from '../models/Task';

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = new Task({
      ...req.body,
      user: req.user._id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid task data' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { priority, status, sortBy, page = 1, limit = 10 } = req.query;
    const query: any = { user: req.user._id };
    const sort: any = {};

    // Apply filters
    if (priority) query.priority = priority;
    if (status) query.status = status;

    // Apply sorting
    if (sortBy === 'startTime') sort.startTime = 1;
    if (sortBy === 'endTime') sort.endTime = 1;

    const tasks = await Task.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // If marking as finished, update endTime to current time
    if (req.body.status === 'finished' && task.status === 'pending') {
      req.body.endTime = new Date();
    }

    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid update data' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const currentTime = new Date();

    // Get total counts
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ 
      user: userId,
      status: 'finished'
    });
    const pendingTasks = totalTasks - completedTasks;

    // Calculate percentages
    const completedPercentage = (completedTasks / totalTasks) * 100 || 0;
    const pendingPercentage = (pendingTasks / totalTasks) * 100 || 0;

    // Get pending tasks statistics by priority
    const pendingTaskStats = await Task.aggregate([
      {
        $match: {
          user: userId,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: '$priority',
          timeLapsed: {
            $sum: {
              $cond: [
                { $lt: ['$startTime', currentTime] },
                {
                  $divide: [
                    { $subtract: [currentTime, '$startTime'] },
                    3600000 // Convert to hours
                  ]
                },
                0
              ]
            }
          },
          balanceTime: {
            $sum: {
              $cond: [
                { $gt: ['$endTime', currentTime] },
                {
                  $divide: [
                    { $subtract: ['$endTime', currentTime] },
                    3600000 // Convert to hours
                  ]
                },
                0
              ]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate average completion time for finished tasks
    const completedTaskStats = await Task.aggregate([
      {
        $match: {
          user: userId,
          status: 'finished'
        }
      },
      {
        $group: {
          _id: null,
          averageCompletionTime: {
            $avg: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                3600000 // Convert to hours
              ]
            }
          }
        }
      }
    ]);

    res.json({
      totalTasks,
      taskStatus: {
        completed: {
          count: completedTasks,
          percentage: completedPercentage
        },
        pending: {
          count: pendingTasks,
          percentage: pendingPercentage
        }
      },
      pendingTasksByPriority: pendingTaskStats,
      averageCompletionTime: completedTaskStats[0]?.averageCompletionTime || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
