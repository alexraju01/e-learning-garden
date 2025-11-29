import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import crypto from 'crypto';
import User from './user.model';
import { WorkspaceUser } from './workspaceUser.model';

interface WorkspaceAttributes {
  id: number;
  name: string;
  inviteCode: string;
  AllMembers?: (User & { WorkspaceUser: WorkspaceUser })[];
}

export type WorkspaceCreationAttributes = Optional<WorkspaceAttributes, 'id' | 'inviteCode'>;

class Workspace extends Model<WorkspaceAttributes, WorkspaceCreationAttributes> {
  declare id: number;
  declare name: string;
  declare inviteCode: string;

  declare AllMembers?: (User & { WorkspaceUser: WorkspaceUser })[];
  declare Members?: (User & { WorkspaceUser: WorkspaceUser })[];
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
  foreignKey: 'UserId',
  as: 'Workspaces',
});

Workspace.belongsToMany(User, {
  through: WorkspaceUser,
  foreignKey: 'WorkspaceId',
  as: 'AllMembers',
});

WorkspaceUser.belongsTo(User, { foreignKey: 'UserId' });
User.hasMany(WorkspaceUser, { foreignKey: 'UserId' });

export default Workspace;
