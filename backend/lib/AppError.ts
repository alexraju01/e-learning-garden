class AppError extends Error {
  public statusCode: number;
  public status: 'fail' | 'error';
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    // Call the parent (Error) constructor
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
