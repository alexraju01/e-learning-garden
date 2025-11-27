import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type Role = 'admin' | 'user';

interface WorkspaceUserAttributes {
  id: number;
  role: Role;
  UserId: number;
  WorkspaceId: number;
}

interface WorkspaceUserCreationAttributes
  extends Optional<WorkspaceUserAttributes, 'id' | 'role'> {}

export class WorkspaceUser
  extends Model<WorkspaceUserAttributes, WorkspaceUserCreationAttributes>
  implements WorkspaceUserAttributes
{
  declare id: number;
  declare role: Role;
  declare UserId: number;
  declare WorkspaceId: number;

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
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    WorkspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'WorkspaceUser',
    indexes: [
      {
        unique: true,
        fields: ['UserId', 'WorkspaceId'],
      },
    ],
  },
);
