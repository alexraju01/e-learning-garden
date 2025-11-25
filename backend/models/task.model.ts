import { CreationOptional, DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type Status = 'not started' | 'in progress' | 'completed' | 'in review';
// 1. Define the attributes required for a Task instance (a row in the DB)
export interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  status: Status;
  tags: string[];
  dueBy: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define the attributes required for creation (ID is optional)
export type TaskCreationAttributes = Optional<
  TaskAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

// 3. Define the Model Class extending Sequelize.Model
class Task extends Model<TaskAttributes, TaskCreationAttributes> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare status: Status;
  declare tags: string[];
  declare dueBy: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'not started',
        'in progress',
        'completed',
        'in review',
      ),
      allowNull: false,
      defaultValue: 'not started',
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    dueBy: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
  },
);

export default Task;
