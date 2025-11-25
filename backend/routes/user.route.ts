import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller';


export const userRouter = Router();

userRouter.route('/').get(getAllUsers);

// userRouter.route('/:id').get(getOneUser).delete(deleteUser);
