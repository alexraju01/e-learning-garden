import { NextFunction, Request, Response } from 'express';
import TaskList from '../models/taskList.model';
import { WorkspaceUser } from '../models/workspaceUser.model';
import AppError from '../lib/AppError';

export const getAllTaskLists = async (req: Request, res: Response, next: NextFunction) => {
  const { id: workspaceId } = req.params;
  const userId = req.user?.id;
  console.log(userId);
  const isMember = await WorkspaceUser.findOne({
    where: {
      userId: userId,
      workspaceId: workspaceId,
    },
  });
  console.log(isMember);

  if (!isMember)
    return next(
      new AppError('You do not have permission to view task lists in this workspace', 403),
    );

  const taskLists = await TaskList.findAll({
    where: { workspaceId: workspaceId },
  });

  res.status(200).json({
    status: 'success',
    results: taskLists.length,
    data: {
      taskLists,
    },
  });
};
