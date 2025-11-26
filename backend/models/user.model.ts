import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

type Roles = 'project manager' | 'line manager' | 'user';
// User attributes interface
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Roles;
}

// 2. Define the attributes required for creation (ID is optional)
export type UserCreationAttributes = Optional<UserAttributes, 'id'>;

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: Roles;
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
      type: DataTypes.ENUM('project manager', 'line manager', 'user'),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    sequelize,
    // hooks: {
    //   // Hash password before creating user
    //   beforeCreate: async (user: User) => {
    //     if (user.password) {
    //       const salt = await bcrypt.genSalt(10);
    //       user.password = await bcrypt.hash(user.password, salt);
    //     }
    //   },
    //   // Hash password before updating user if password is modified
    //   beforeUpdate: async (user: User) => {
    //     if (user.changed('password')) {
    //       const salt = await bcrypt.genSalt(10);
    //       user.password = await bcrypt.hash(user.password, salt);
    //     }
    //   },
    // },
  },
);

export default User;
