import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface TaskListAttributes {
  id: number;
  title: string;
  workspaceId: number; //Foreign key
}

export type TaskListCreationAttributes = Optional<TaskListAttributes, 'id'>;

export class TaskList
  extends Model<TaskListAttributes, TaskListCreationAttributes>
  implements TaskListAttributes
{
  declare id: number;
  declare title: string;
  declare workspaceId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TaskList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Task List title is required',
        },
        len: {
          args: [1, 255],
          msg: 'Task List title must be between 1 and 255 characters',
        },
      },
    },
    workspaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'TaskList',
  },
);

export default TaskList;
