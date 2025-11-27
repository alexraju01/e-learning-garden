import { NextFunction, Request, Response } from 'express';
import Task from '../models/task.model';
import AppError from '../lib/AppError';

export const getAllTasks = async (_: Request, res: Response) => {
  const tasks = await Task.findAll();
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

  // Basic response for now
  const tasks: any[] = [];

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: { tasks },
  });
};
