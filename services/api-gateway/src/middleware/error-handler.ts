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

/**
 * Authentication middleware
 * Supports both mock tokens (Phase 1) and Auth0 JWT verification (Phase 2)
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No authorization header provided',
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token format',
    });
  }

  try {
    let decoded: any;

    // Try Auth0 verification first (if configured)
    if (process.env.AUTH0_DOMAIN && process.env.AUTH0_DOMAIN !== 'your-domain.auth0.com') {
      try {
        const { verifyAuth0Token } = await import('../lib/auth0');
        decoded = await verifyAuth0Token(token);
      } catch (auth0Error: any) {
        console.warn('Auth0 verification failed, falling back to mock:', auth0Error.message);
        // Fall through to mock verification
        decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      }
    } else {
      // Mock token verification (Phase 1)
      decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    }

    (req as any).userId = decoded.sub;
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
