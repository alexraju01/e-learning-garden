import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type Role = 'admin' | 'user';

interface WorkspaceUserAttributes {
  id: number;
  role: Role;
  userId: number;
  workspaceId: number;
}

interface WorkspaceUserCreationAttributes
  extends Optional<WorkspaceUserAttributes, 'id' | 'role'> {}

export class WorkspaceUser
  extends Model<WorkspaceUserAttributes, WorkspaceUserCreationAttributes>
  implements WorkspaceUserAttributes
{
  declare id: number;
  declare role: Role;
  declare userId: number;
  declare workspaceId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

WorkspaceUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'workspaceId'],
      },
    ],
  },
);
