import { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import jwt, { Secret } from 'jsonwebtoken';
import AppError from '../lib/AppError';

//#region globalRequest
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
//#endregion

//   Some reson id works but not iat so had to do this way
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

export const signUp = async (req: Request, res: Response) => {
  const { displayname, email, password, confirmPassword, passwordChangedAt } = req.body;

  const newUser = await User.create({
    displayname,
    email,
    password,
    confirmPassword,
    passwordChangedAt,
  });

  const token = signToken(String(newUser.id));

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.scope('withPasswords').findOne({
    where: {
      email: email,
    },
  });

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(String(user.id));

  res.status(200).json({
    status: 'success',
    token,
  });
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  let token;
  // 1) Getting the token and check if it exist
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Your are not logged in! Please login to get access.', 401));
  }

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
