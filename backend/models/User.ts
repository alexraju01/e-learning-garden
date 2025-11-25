import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import bcrypt from 'bcryptjs';

// User attributes interface
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'PM' | 'LM' | 'Staff';
  lineManagerId?: number;
  startDate: Date;
  endDate?: Date;
  department: string;
}

// Optional attributes for creation (id is auto-generated)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'lineManagerId' | 'endDate'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: 'PM' | 'LM' | 'Staff';
  public lineManagerId?: number;
  public startDate!: Date;
  public endDate?: Date;
  public department!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to check if user is admin (PM or LM)
  public isAdmin(): boolean {
    return this.role === 'PM' || this.role === 'LM';
  }

  // Instance method to compare password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('PM', 'LM', 'Staff'),
      allowNull: false,
      defaultValue: 'Staff',
    },
    lineManagerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Hash password before creating user
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hash password before updating user if password is modified
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Self-referencing association for line manager
User.belongsTo(User, { as: 'lineManager', foreignKey: 'lineManagerId' });
User.hasMany(User, { as: 'directReports', foreignKey: 'lineManagerId' });

export default User;
