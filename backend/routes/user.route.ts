import { Router } from 'express';
import {
  deleteUser,
  getAllUsers,
  getOneUser,
} from '../controllers/user.controller';

export const userRouter = Router();

userRouter.route('/').get(getAllUsers);

userRouter.route('/:id').get(getOneUser).delete(deleteUser);
