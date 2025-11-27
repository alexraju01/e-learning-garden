import { NextFunction, Request, Response } from 'express';
import Workspace from '../models/workspace.model';
import AppError from '../lib/AppError';
import { WorkspaceUser } from '../models/workspaceUser.model';
import { sequelize } from '../config/db';

export const getAllWorkspace = async (_: Request, res: Response) => {
  const workspaces = await Workspace.findAll({
    order: [['id', 'asc']],
  });

  res.status(200).json({ status: 'success', results: workspaces.length, data: { workspaces } });
};

export const createWorkspace = async (req: Request, res: Response) => {
  const { name } = req.body;
  const creatorId = req.user?.dataValues?.id;

  if (!creatorId) {
    throw new AppError('Authentication required. User ID is missing.', 401);
  }
  //  Transaction makes it so that we can group the db opeeration
  const t = await sequelize.transaction();
  // 1. Create Workspace
  const newWorkspace = await Workspace.create({ name }, { transaction: t });

  //   Solution for fix
  // https://www.geeksforgeeks.org/postgresql/how-to-reset-the-primary-key-sequence-id-in-postgresql/

  // 2. Fix sequence for WorkspaceUsers.id
  await sequelize.query(
    `SELECT setval(pg_get_serial_sequence('"WorkspaceUsers"', 'id'), COALESCE(MAX(id), 1)) FROM "WorkspaceUsers";`,
    { transaction: t },
  );

  // 3. Add creator as Admin
  const workspaceUser = await WorkspaceUser.create(
    {
      WorkspaceId: newWorkspace.id,
      UserId: creatorId,
      role: 'Admin',
    },
    { transaction: t },
  );

  if (!workspaceUser) {
    throw new AppError('Failed to add user to workspace.', 500);
  }

  await t.commit();

  res.status(201).json({
    message: 'Workspace created successfully.',
    workspace: newWorkspace,
    role: 'Admin',
  });
};

export const updateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name } = req.body;
  const workspace = await Workspace.findByPk(id);

  if (!workspace) {
    return next(new AppError('Workspace with this ID does not exist', 404));
  }

  const updatedWorkspace = await workspace.update({ name });

  res.status(200).json({
    status: 'success',
    data: updatedWorkspace,
  });
};
