import { Router } from 'express';
import { deleteUser, getAllUsers, getOneUser, updateDisplayName } from '../controllers/user.controller';
import { login, protect, signUp } from '../controllers/auth.controller';

export const userRouter = Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);

userRouter.route('/').get(getAllUsers);
userRouter.route('/:id').get(getOneUser).delete(deleteUser);

// Protected routes - require authentication
userRouter.patch('/me/displayname', protect, updateDisplayName);
