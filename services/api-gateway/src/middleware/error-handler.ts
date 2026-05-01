import { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided',
    });
  }

  // TODO: Validate token with Auth0 or JWT
  (req as any).userId = 'user_placeholder'; // Placeholder
  next();
};
