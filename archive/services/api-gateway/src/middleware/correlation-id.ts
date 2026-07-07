import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get existing correlation ID from request or generate new one
  const correlationId = req.headers[CORRELATION_ID_HEADER.toLowerCase()] as string || uuidv4();
  
  // Security: Validate correlation ID format to prevent header injection or smuggling
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4Regex.test(correlationId)) {
    // If format is invalid, discard and generate a fresh safe UUID
    const freshId = uuidv4();
    req.correlationId = freshId;
    res.setHeader(CORRELATION_ID_HEADER, freshId);
  } else {
    req.correlationId = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
  }

  // Security Headers configuration
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Request-ID', req.correlationId);
  
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
