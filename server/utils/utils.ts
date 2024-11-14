import { ErrorRequestHandler, NextFunction } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Detect JWT errors and set status to 401
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Unauthorized: Token has expired';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Unauthorized: Invalid token';
  }

  console.error('ERROR::: ', message);
  console.error('STACK::: ', err.stack);

  res.status(statusCode).json({
    message,
    stack: err.stack,
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
