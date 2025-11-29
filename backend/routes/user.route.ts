import { Router } from 'express';
import {
  deleteAccount,
  deleteUser,
  getAllUsers,
  getOneUser,
  updateDisplayName,
} from '../controllers/user.controller';
import { login, logout, protect, signUp } from '../controllers/auth.controller';

export const userRouter = Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.get('/logout', logout);

// Protected routes - require authentication (must be before /:id routes)
userRouter.patch('/me/displayname', protect, updateDisplayName);
userRouter.delete('/me', protect, deleteAccount);

userRouter.route('/').get(getAllUsers);
userRouter.route('/:id').get(getOneUser).delete(deleteUser);
