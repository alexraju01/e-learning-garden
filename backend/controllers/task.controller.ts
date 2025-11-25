import { Request, Response } from 'express';
import Task from '../models/task.model';

export const getAllTasks = async (_: Request, res: Response) => {
  const tasks = await Task.findAll();
  res
    .status(200)
    .json({ status: 'success', results: tasks.length, data: tasks });
};

export const getOneTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const task = await Task.findByPk(id);
  console.log(task);
  res.status(200).json({ status: 'success', data: task });
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedTask = await Task.update(updateData, {
    where: { id },
    returning: true,
  });
  console.log(updateTask);
  res.status(200).json({
    message: 'success',
    blog: updatedTask,
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

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleteTask = await Task.destroy({
    where: {
      id,
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
