import { NextFunction, Request, Response } from 'express';
import AppError from '../lib/AppError';

interface ErrorMiddleware extends Error {
  statusCode: number;
  status: string;
  message: string;
  stack?: string;
  name: string;
  isOperational?: boolean;
}

const handleJWTError = () => new AppError('Invalid Token! Please log in again', 401);

// Development error handling
const sendErrorDev = (err: ErrorMiddleware, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// Production error handling
const sendErrorProd = (err: ErrorMiddleware, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR:', err);
    res.status(500).json({
      status: 'Error',
      message: 'Something went very wrong!',
    });
  }
};

export const globalErrorHandler = (
  err: ErrorMiddleware,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    sendErrorProd(error, res);
  }
};
