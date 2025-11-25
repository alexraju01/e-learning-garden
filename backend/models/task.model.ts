import { CreationOptional, DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../config/db';

// 1. Define the attributes required for a Task instance (a row in the DB)
export interface TaskAttributes {
  id: number;
  title: string;
  description: string;
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
  },
  {
    sequelize,
  },
);

export default Task;
