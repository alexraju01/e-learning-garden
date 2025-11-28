import { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import AppError from '../lib/AppError';

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

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const deleteUser = await User.destroy({
    where: {
      id,
    },
  });

  if (!deleteUser) return next(new AppError('This user does not exist', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

export const updateDisplayName = async (req: Request, res: Response, next: NextFunction) => {
  const { displayname } = req.body;

  // Validate displayname is provided
  if (!displayname) {
    return next(new AppError('Display name is required', 400));
  }

  // Trim whitespace before and after
  const trimmedDisplayname = displayname.trim();

  // Check if it's an empty string after trimming
  if (!trimmedDisplayname) {
    return next(new AppError('Display name cannot be empty or contain only whitespace', 400));
  }

  // Get the authenticated user from req.user (set by protect middleware)
  const user = req.user;

  if (!user) {
    return next(new AppError('User not authenticated', 401));
  }

  // Update the displayname with trimmed value
  await user.update({ displayname: trimmedDisplayname });

  // Return the updated user
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Password confirmation is required to delete your account', 400));
  }

  // Get the logged in user
  const user = await User.scope('withPasswords').findByPk(req.user?.id);

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  if (!user.password) {
    return next(new AppError('User password not found in database. Cannot verify.', 500));
  }

  // Check password
  const isCorrect = await user.correctPassword(password);
  if (!isCorrect) {
    return next(new AppError('Incorrect password. Account deletion failed.', 401));
  }

  await user.destroy();

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
