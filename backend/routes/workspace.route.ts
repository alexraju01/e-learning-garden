import { Router } from 'express';
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspace,
  joinWorkspace,
  updateWorkspace,
} from '../controllers/workspace.controller';
import { protect, restrictTo } from '../controllers/auth.controller';

export const workspaceRouter = Router();

workspaceRouter.route('/').get(protect, getAllWorkspace);

workspaceRouter.route('/create').post(protect, createWorkspace);
workspaceRouter.route('/join').post(protect, joinWorkspace);

workspaceRouter
  .route('/:id')
  .patch(protect, restrictTo('admin'), updateWorkspace)
  .delete(protect, restrictTo('admin'), deleteWorkspace);
