import { CreationOptional, DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type Status = 'not started' | 'in progress' | 'completed' | 'in review';
type Priority = 'low' | 'medium' | 'high';

// 1. Define the attributes required for a Task instance (a row in the DB)
export interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  status: Status;
  tags: string[];
  priority: Priority;
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
  declare priority: Priority;
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
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Title is required and cannot be empty.',
        },

        len: {
          args: [5, 100],
          msg: 'Title must be between 5 and 100n characters long.',
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 200], // Minimum 0, maximum 200 characters
          msg: 'Description cannot be longer than 200 characters.',
        },
      },
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
      validate: {
        isIn: {
          args: [['not started', 'in progress', 'completed', 'in review']],
          msg: 'Invalid status value.',
        },
      },
    },

    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['low', 'medium', 'high']],
          msg: 'Priority must be one of: low, medium, or high.',
        },
      },
    },

    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },

    dueBy: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        // Ensure dueBy is not a date in the past
        isFuture(value: Date | null) {
          if (value && value < new Date()) {
            throw new Error('Due date cannot be in the past');
          }
        },
      },
    },
  },
  {
    sequelize,
  },
);

export default Task;
