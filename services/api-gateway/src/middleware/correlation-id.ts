import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get existing correlation ID from request or generate new one
  const correlationId = req.headers[CORRELATION_ID_HEADER.toLowerCase()] as string || uuidv4();
  
  // Attach to request for use in other middleware/controllers
  req.correlationId = correlationId;
  
  // Set correlation ID in response header
  res.setHeader(CORRELATION_ID_HEADER, correlationId);
  
  next();
};

// Extend Express Request interface to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}
