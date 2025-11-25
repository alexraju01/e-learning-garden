import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Extend Express Request type to include user property
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: 'PM' | 'LM' | 'Staff';
  };
}

// JWT Authentication Middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided. Please authenticate.',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      id: number;
      role: 'PM' | 'LM' | 'Staff';
    };

    // Check if user still exists
    const user = await User.findByPk(decoded.id);

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'User no longer exists.',
      });
      return;
    }

    // Check if user account is still active (endDate)
    if (user.endDate && new Date(user.endDate) < new Date()) {
      res.status(401).json({
        status: 'error',
        message: 'User account has been deactivated.',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again.',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired. Please log in again.',
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'Authentication failed.',
    });
  }
};
