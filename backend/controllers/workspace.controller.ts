import { NextFunction, Request, Response } from 'express';
import Workspace from '../models/workspace.model';
import AppError from '../lib/AppError';
import { WorkspaceUser } from '../models/workspaceUser.model';
import { sequelize } from '../config/db';
import User from '../models/user.model';

export const getAllWorkspace = async (req: Request, res: Response) => {
  const workspaces = await Workspace.findAll({
    include: [
      {
        model: User,
        as: 'Members',
        // 1. Keep the desired User attributes
        attributes: ['id', 'displayname', 'email'],

        // 2. Control the junction table (WorkspaceUser) attributes
        through: {
          // Only include the 'role' field from the WorkspaceUser junction table.
          // This keeps the user's role specific to that workspace, and removes the other junction fields.
          attributes: ['role'],
        },
      },
    ],
    order: [['id', 'asc']],
  });

  res.status(200).json({ status: 'success', results: workspaces.length, data: { workspaces } });
};

export const createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const creatorId = req.user?.dataValues?.id;

  if (!creatorId) {
    throw new AppError('Authentication required. User ID is missing', 401);
  }

  // Check if workspace name is provided
  if (!name || name.trim() === '') {
    return next(new AppError('Workspace name is required', 400));
  }

  const existingWorkspace = await Workspace.findOne({ where: { name } });
  if (existingWorkspace) return next(new AppError('A workspace with this name already exist', 400));

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
      role: 'admin',
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
    role: 'admin',
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

export const joinWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const { inviteCode } = req.body;
  const userId = req.user?.dataValues.id;

  if (!userId) {
    return next(new AppError('Authentication required. User ID is missing.', 401));
  }

  // 1. Find the workspace by invite code
  const workspace = await Workspace.findOne({ where: { inviteCode } });
  if (!workspace) {
    return next(new AppError('Workspace not found with the provided invite code.', 404));
  }
  // 2. Check if the user is already a member
  const existingMember = await WorkspaceUser.findOne({
    where: {
      WorkspaceId: workspace?.dataValues.id,
      UserId: userId,
    },
  });

  if (existingMember) {
    return next(
      new AppError(
        `You are already a member of this workspace with the role: ${existingMember.role}.`,
        400,
      ),
    );
  }

  // 3. Add the user to the WorkspaceUser join table with 'Regular' role
  await WorkspaceUser.create({
    WorkspaceId: workspace.dataValues.id,
    UserId: userId,
    role: 'user', // Joining users become Regular
  });

  res.json({
    status: 'success',
    message: `Successfully joined workspace: ${workspace.name}`,
    workspaceId: workspace.id,
    role: 'user',
  });
};
