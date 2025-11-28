import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export type Roles = 'admin' | 'user';

// User attributes interface
export interface UserAttributes {
  id: number;
  displayname: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: Roles;
  passwordChangedAt: Date | null;

  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  currentWorkspaceRole?: Roles;
}

// 2. Define the attributes required for creation (ID is optional)
export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'currentWorkspaceRole'>;

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare displayname: string;
  declare email: string;
  declare password: string;
  declare confirmPassword: string;
  declare role?: Roles;
  declare passwordChangedAt: Date | null;

  declare passwordResetToken: string | null;
  declare passwordResetExpires: Date | null;
  currentWorkspaceRole?: Roles;

  toJSON() {
    const values: Partial<UserAttributes> = this.get();
    delete values.password;
    delete values.confirmPassword;
    return values;
  }

  correctPassword!: (candidatePassword: string) => Promise<boolean>;
  changedPasswordAfter!: (JWTTimestamp: number) => boolean;
  createPasswordResetToken!: () => string;
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    displayname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: false,
      validate: {
        notEmpty: {
          msg: 'Display name is required',
        },
        len: {
          args: [3, 50],
          msg: 'Display name must be between 3 and 50 characters',
        },
        is: {
          args: /^[a-zA-Z0-9._\s]+$/i,
          msg: 'Display name can only contain letters, numbers, dots, underscores, and spaces',
        },
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Invalid email format' },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: {
          args: [8, 255],
          msg: 'Password must be at least 8 characters long',
        },
      },
    },

    confirmPassword: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Confirm password is required' },

        passwordMatches(value: string) {
          if (value !== this.password) {
            // Sequelize will catch this error and prevent saving/updating
            throw new Error('Password and Confirm Password must match.');
          }
        },
      },
    },

    passwordChangedAt: {
      type: DataTypes.DATE,
    },

    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['admin', 'user']],
          msg: 'Invalid role',
        },
      },
    },

    // passwordResetToken: {
    //   type: DataTypes.STRING,
    // },

    // passwordResetExpires: {
    //   type: DataTypes.DATE,
    // },
  },
  {
    sequelize,
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },

    scopes: {
      withPasswords: {
        attributes: {
          include: ['password'],
        },
      },
    },
  },
);

User.beforeCreate(async (user, options) => {
  user.password = await bcrypt.hash(user.password, 12);
});
// Hook to hash the password only if it has been changed before an existing user is updated.
User.beforeUpdate(async (user) => {
  if (!user.changed('password')) return;
  user.password = await bcrypt.hash(user.password, 12);
  //   user.passwordChangedAt = Date.now();
});

User.prototype.correctPassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt instanceof Date && this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

User.prototype.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  console.log(resetToken);
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  console.log('resetToken', resetToken);
  console.log('passwordResetToken', this.passwordResetToken);

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

export default User;
