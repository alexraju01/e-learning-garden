import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import crypto from 'crypto';
import User from './user.model';
import { WorkspaceUser } from './workspaceUser.model';

interface WorkspaceAttributes {
  id: number;
  name: string;
  inviteCode: string;
}

export type WorkspaceCreationAttributes = Optional<WorkspaceAttributes, 'id' | 'inviteCode'>;

class Workspace extends Model<WorkspaceAttributes, WorkspaceCreationAttributes> {
  declare id: number;
  declare name: string;
  declare inviteCode: string;
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
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
  },
);

// HOOKS
Workspace.beforeCreate(async (workspace) => {
  workspace.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
});

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
  as: 'Members',
});

export default Workspace;
