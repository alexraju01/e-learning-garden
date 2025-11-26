import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getAllSimpleTask,
  getAllTasks,
  getOneTask,
  updateTask,
} from '../controllers/task.controller';

export const taskRouter = Router();

taskRouter.route('/').get(getAllTasks).post(createTask);
taskRouter.route('/simple').get(getAllSimpleTask);

taskRouter.route('/:id').get(getOneTask).patch(updateTask).delete(deleteTask);
