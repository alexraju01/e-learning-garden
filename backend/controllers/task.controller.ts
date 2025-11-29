import { NextFunction, Request, Response } from 'express';
import Task from '../models/task.model';
import AppError from '../lib/AppError';
import APIFeatures, { QueryString } from '../lib/APIFearure';

export const getAllTasks = async (req: Request, res: Response) => {
  const features = new APIFeatures(Task, req.query as QueryString).filter().sort().exec(); // execute query here
  const { count, rows } = await features.query;
  res.status(200).json({
    status: 'success',
    results: count,
    data: {
      tasks: rows,
    },
  });
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
