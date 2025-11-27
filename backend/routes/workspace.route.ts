import { Router } from 'express';
import {
  createWorkspace,
  getAllWorkspace,
  updateWorkspace,
} from '../controllers/workspace.controller';
import { protect } from '../controllers/auth.controller';

export const workspaceRouter = Router();

workspaceRouter.route('/').get(protect, getAllWorkspace);

workspaceRouter.route('/create').post(protect, createWorkspace);

workspaceRouter.route('/:id').patch(updateWorkspace);
