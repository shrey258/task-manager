import mongoose from 'mongoose';

export interface ITask extends mongoose.Document {
  title: string;
  startTime: Date;
  endTime: Date;
  priority: number;
  status: 'pending' | 'finished';
  user: mongoose.Types.ObjectId;
}

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'finished'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add validation for endTime >= startTime
taskSchema.pre('save', function(next) {
  if (this.endTime < this.startTime) {
    next(new Error('End time must be greater than or equal to start time'));
  }
  next();
});

export const Task = mongoose.model<ITask>('Task', taskSchema);
