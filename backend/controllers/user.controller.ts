import { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';

export const getAllUsers = async (_: Request, res: Response) => {
  const users = await User.findAll();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
};

export const getOneUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByPk(id);

  res.status(200).json({ status: 'success', data: { user } });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleteUser = await User.destroy({
    where: {
      id,
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
