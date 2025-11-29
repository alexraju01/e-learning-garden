import { NextFunction, Request, Response } from 'express';
import Workspace from '../models/workspace.model';
import AppError from '../lib/AppError';
import { WorkspaceUser } from '../models/workspaceUser.model';
import { sequelize } from '../config/db';
import User from '../models/user.model';
import { Op } from 'sequelize';
import { formatWorkspace, formatWorkspaces } from '../lib/formatWorkspace';

export const getAllWorkspace = async (req: Request, res: Response) => {
  const userId = req?.user?.id;

  // 1. Find the IDs of all Workspaces the user belongs to (Subquery)
  const memberWorkspaceIds = await WorkspaceUser.findAll({
    attributes: ['workspaceId'],
    where: { userId: userId },
    raw: true,
  });

  // Convert the result to a simple array of IDs (e.g., [16, 22, 45])
  const ids = memberWorkspaceIds.map((item) => item.workspaceId);

  // 2. Fetch the Workspaces using Op.in and include ALL members (Main Query)
  const workspaces = await Workspace.findAll({
    where: { id: { [Op.in]: ids } },
    include: [
      {
        model: User,
        as: 'allMembers',
        attributes: ['id', 'displayname', 'email'],
        through: { attributes: ['role'] },
      },
    ],
    order: [['id', 'asc']],
  });

  // Add memberCount to each workspace
  const workspacesWithCounts = formatWorkspaces(workspaces);

  res.status(200).json({
    status: 'success',
    results: workspacesWithCounts.length,
    data: { workspaces: workspacesWithCounts },
  });
};

export const getOneWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const userId = req.user.id;

  // Validate membership
  const membership = await WorkspaceUser.findOne({
    where: { workspaceId: id, userId: userId },
  });

  if (!membership) {
    return next(new AppError('You do not have access to this workspace', 403));
  }

  // Fetch specified workspace
  const workspace = await Workspace.findOne({
    where: { id },
    include: [
      {
        model: User,
        as: 'allMembers',
        attributes: ['id', 'displayname', 'email'],
        through: { attributes: ['role'] }, // Include role from join table
      },
    ],
  });

  if (!workspace) {
    return next(new AppError('Workspace not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { workspace: formatWorkspace(workspace) },
  });
};

export const createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const { name: rawName } = req.body;
  const creatorId = req.user?.id;
  const name = rawName ? rawName.trim() : '';

  if (!creatorId) return next(new AppError('Authentication required. User ID is missing', 401));

  if (!name || name === '') {
    return next(new AppError('Workspace name is required', 400));
  }

  const existingWorkspace = await Workspace.findOne({
    where: { name },
    include: [
      {
        model: User,
        as: 'allMembers',
        where: { id: creatorId },
        required: true,
      },
    ],
  });

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
      workspaceId: newWorkspace.id,
      userId: creatorId,
      role: 'admin',
    },
    { transaction: t },
  );

  if (!workspaceUser) return next(new AppError('Failed to add user to workspace.', 500));

  if (req.user) {
    req.user.currentWorkspaceRole = 'admin';
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

  if (!workspace) return next(new AppError('Workspace with this ID does not exist', 404));

  const existingWorkspace = await Workspace.findOne({ where: { name } });

  if (existingWorkspace && existingWorkspace.id !== workspace.id) {
    return next(new AppError('A workspace with this name already exists', 400));
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

  if (!userId) return next(new AppError('Authentication required. User ID is missing.', 401));

  // 1. Find the workspace by invite code
  const workspace = await Workspace.findOne({ where: { inviteCode } });
  if (!workspace)
    return next(new AppError('Workspace not found with the provided invite code.', 404));

  // 2. Check if the user is already a member
  const existingMember = await WorkspaceUser.findOne({
    where: {
      workspaceId: workspace?.dataValues.id,
      userId: userId,
    },
  });

  if (existingMember) return next(new AppError('You are already a member of this workspace ', 400));

  // 3. Add the user to the WorkspaceUser join table with 'user' role
  await WorkspaceUser.create({
    workspaceId: workspace.dataValues.id,
    userId: userId,
    role: 'user',
  });

  res.json({
    status: 'success',
    message: `Successfully joined workspace: ${workspace.name}`,
    workspaceId: workspace.id,
    role: 'user',
  });
};

export const deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Find the workspace first
  const workspace = await Workspace.findOne({ where: { id }, raw: true });
  if (!workspace) return next(new AppError('This workspace does not exist', 404));

  // Delete the workspace
  await Workspace.destroy({ where: { id } });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
