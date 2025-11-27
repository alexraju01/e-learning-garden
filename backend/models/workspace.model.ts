import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import crypto from 'crypto';

// User attributes interface
interface WorkspaceAttributes {
  id: number;
  name: string;
  inviteCode: string;
}

// 2. Define the attributes required for creation (ID is optional)
export type WorkspaceCreationAttributes = Optional<WorkspaceAttributes, 'id' | 'inviteCode'>;

// User model class
class Workspace extends Model<WorkspaceAttributes, WorkspaceCreationAttributes> {
  declare id: number;
  declare name: string;
  declare inviteCode: string;
}

// Initialize the User model
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

export default Workspace;
