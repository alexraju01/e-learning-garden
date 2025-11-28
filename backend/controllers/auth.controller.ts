import { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import jwt, { Secret } from 'jsonwebtoken';
import AppError from '../lib/AppError';
import { WorkspaceUser } from '../models/workspaceUser.model';

//#region globalRequest
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
//#endregion

//   Some reason id works but not "iat" so had to do this way
//   so typescript know!
interface CustomJwtPayload extends jwt.JwtPayload {
  id: number;
  iat: number;
}

const signToken = (id: string): string => {
  const secret: Secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN;
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as any });
};

const createSendToken = (user: User, statusCode: number, res: Response) => {
  const token = signToken(String(user.id));

  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 60 * 1000,
    ),
    secure: false,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  const userObject = user.toJSON();

  // 2. Safely delete the properties from the plain object (The fix for your TS error is included here)
  delete (userObject as any).password;
  delete (userObject as any).confirmPassword;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

export const signUp = async (req: Request, res: Response) => {
  const { displayname, email, password, confirmPassword, passwordChangedAt } = req.body;

  const newUser = await User.create({
    displayname,
    email,
    password,
    confirmPassword,
    passwordChangedAt,
  });
  createSendToken(newUser, 201, res);
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.scope('withPasswords').findOne({
    where: {
      email: email,
    },
  });

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  let token;
  // 1) Getting the token and check if it exist
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Your are not logged in! Please login to get access.', 401));

  // 2) Verifying the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as CustomJwtPayload;

  // 3) Check if user still exist
  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does not exist!', 401));
  }

  // 4) Check if user changed password after JWT token is created
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently chnaged the password! Please login again.', 401));
  }

  //   Grant Access to the protected routes
  req.user = currentUser;
  next();
};

export const restrictTo = (...roles: string[]) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const workspaceId = req.params.id;

    if (!userId) return next(new AppError('User authentication failed.', 401));

    // 1. Find the user's role for the specific workspace
    const workspaceUser = await WorkspaceUser.findOne({
      where: {
        WorkspaceId: workspaceId,
        UserId: userId,
      },
    });

    // 2. Check if the user is a member at all
    if (!workspaceUser) return next(new AppError('You are not a member of this workspace.', 403));

    // 3. Check if the user's role is included in the allowed roles
    const userRole = workspaceUser.role;

    if (!roles.includes(userRole)) {
      // If the required roles are 'admin' but the user is 'user'
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    // If the check passes, attach the role to the request for later use (optional but helpful)
    if (req.user) {
      req.user.currentWorkspaceRole = userRole;
    }

    next();
  };
};

// export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
//   console.log('check email');
//   console.log(req.body);
//   const { email } = req.body;
//   console.log('chec email2:', email);
//   // Get user based on the email
//   const user = await User.findOne({ where: { email } });
//   if (!user) {
//     return next(new AppError('There is no user with this email address', 404));
//   }

//   //   2) Generate the random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validate: false });

//   res.status(200).json({ status: 'success', resetToken });
// };

// export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {};
