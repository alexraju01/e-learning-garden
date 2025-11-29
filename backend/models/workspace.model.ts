import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import crypto from 'crypto';
import User from './user.model';
import { WorkspaceUser } from './workspaceUser.model';
import TaskList from './taskList.model';

interface WorkspaceAttributes {
  id: number;
  name: string;
  inviteCode: string;
  allMembers?: (User & { WorkspaceUser: WorkspaceUser })[];
}

export type WorkspaceCreationAttributes = Optional<WorkspaceAttributes, 'id' | 'inviteCode'>;

class Workspace extends Model<WorkspaceAttributes, WorkspaceCreationAttributes> {
  declare id: number;
  declare name: string;
  declare inviteCode: string;

  declare allMembers?: (User & { WorkspaceUser: WorkspaceUser })[];
  declare members?: (User & { WorkspaceUser: WorkspaceUser })[];
}

Workspace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      //   unique: false,
      validate: {
        notEmpty: {
          msg: 'Workspace name is required',
        },

        len: {
          args: [1, 70],
          msg: 'Workspace name  must be between 1 and 70 character',
        },

        is: {
          args: /^[a-zA-Z0-9\s'!]+$/i,
          msg: 'Workspace name can only contain letters, numbers, spaces, apostrophes, and exclamation marks',
        },
      },
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => crypto.randomBytes(4).toString('hex').toUpperCase(),
    },
  },
  {
    sequelize,
  },
);

// ######### Define Associations ##########

// User <-> Workspace (M:M)
User.belongsToMany(Workspace, {
  through: WorkspaceUser,
  foreignKey: 'userId',
  as: 'workspaces',
});

Workspace.belongsToMany(User, {
  through: WorkspaceUser,
  foreignKey: 'workspaceId',
  as: 'allMembers',
});

WorkspaceUser.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(WorkspaceUser, { foreignKey: 'userId' });

// Workspace <-> TaskList (1:M) - New associations
Workspace.hasMany(TaskList, {
  foreignKey: 'workspaceId',
  as: 'tasklist',
  onDelete: 'CASCADE',
});

TaskList.belongsTo(Workspace, {
  foreignKey: 'workspaceId',
  as: 'workspace',
});

export default Workspace;
