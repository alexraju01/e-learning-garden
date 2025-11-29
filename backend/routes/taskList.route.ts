import { Router } from 'express';
import { protect } from '../controllers/auth.controller';
import { getAllTaskLists } from '../controllers/taskList.controller';

export const taskListRouter = Router({ mergeParams: true });

taskListRouter.use(protect);

taskListRouter.route('/').get(getAllTaskLists);
