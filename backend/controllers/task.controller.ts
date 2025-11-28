import { NextFunction, Request, Response } from 'express';
import Task from '../models/task.model';
import AppError from '../lib/AppError';
import { Op } from 'sequelize';

export const getAllTasks = async (_: Request, res: Response) => {
  const tasks = await Task.findAll({
    order: [['id', 'asc']],
  });
  res.status(200).json({ status: 'success', results: tasks.length, data: { tasks: tasks } });
};

export const getOneTask = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const task = await Task.findByPk(id);
  if (!task) return next(new AppError('No Task with this id', 404));

  res.status(200).json({ status: 'success', data: { task } });
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updateData = req.body;

  const [updatedCount, updatedTask] = await Task.update(updateData, {
    where: { id },
    returning: true,
  });

  if (!updatedCount) return next(new AppError('ID with this task does not exist', 404));

  res.status(200).json({
    message: 'success',
    task: updatedTask,
  });
};

export const createTask = async (req: Request, res: Response) => {
  const taskData = req.body;

  const newTask = await Task.create(taskData);

  res.status(201).json({
    status: 'success',
    data: newTask,
  });
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const deleteTask = await Task.destroy({
    where: {
      id,
    },
  });

  if (!deleteTask) return next(new AppError('This task does not exist', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//  ====================== Simple Task =====================

export const getAllSimpleTask = async (_: Request, res: Response) => {
  const simpleTasks = await Task.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'description'],
    },
  });
  res.status(200).json({ status: 'success', results: simpleTasks.length, data: { simpleTasks } });
};

//  ====================== Search Task =====================

export const searchTasks = async (req: Request, res: Response, next: NextFunction) => {
  const { q } = req.query;

  // Validate query parameter exists
  if (!q || typeof q !== 'string') {
    return next(new AppError('Search query is required', 400));
  }

  // Trim whitespace
  const trimmedQuery = q.trim();

  // Check if empty after trimming
  if (!trimmedQuery) {
    return next(new AppError('Search query cannot be empty or contain only whitespace', 400));
  }

  // Validate length (2-50 characters)
  if (trimmedQuery.length < 2) {
    return next(new AppError('Search query must be at least 2 characters', 400));
  }

  if (trimmedQuery.length > 50) {
    return next(new AppError('Search query must not exceed 50 characters', 400));
  }

  // Validate alphabetic characters and spaces only
  const alphabeticRegex = /^[a-zA-Z\s]+$/;
  if (!alphabeticRegex.test(trimmedQuery)) {
    return next(new AppError('Search query can only contain alphabetic characters and spaces', 400));
  }

  // Get authenticated user (set by protect middleware)
  const user = req.user;

  if (!user) {
    return next(new AppError('User not authenticated', 401));
  }

  try {
    // Search tasks by title and description (case-insensitive, partial matching)
    // TODO: Add user authorization filter when Task-User relationship is implemented
    // Filter by userId to ensure users only see their own tasks
    const tasks = await Task.findAll({
      where: {
        // userId: user.id, // Uncomment when Task model has userId field
        [Op.or]: [
          { title: { [Op.iLike]: `%${trimmedQuery}%` } },
          {
            [Op.and]: [
              { description: { [Op.ne]: null } },
              { description: { [Op.iLike]: `%${trimmedQuery}%` } },
            ],
          },
        ],
      },
    });

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    return next(new AppError('An error occurred while searching tasks', 500));
  }
};
