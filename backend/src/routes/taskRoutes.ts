import express from 'express';
import { 
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController';
import { auth } from '../middleware/auth';
import { body } from 'express-validator';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Create task
router.post('/',
  [
    body('title').trim().notEmpty(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('priority').isInt({ min: 1, max: 5 }),
    body('status').isIn(['pending', 'finished'])
  ],
  createTask
);

// Get tasks with filters and pagination
router.get('/', getTasks);

// Get task statistics
router.get('/stats', getTaskStats);

// Update task
router.patch('/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('priority').optional().isInt({ min: 1, max: 5 }),
    body('status').optional().isIn(['pending', 'finished'])
  ],
  updateTask
);

// Delete task
router.delete('/:id', deleteTask);

export default router;
