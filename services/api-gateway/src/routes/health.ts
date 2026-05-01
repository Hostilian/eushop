import { Request, Response, Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check including dependencies
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const health = {
    service: 'API Gateway',
    status: 'OK',
    timestamp: new Date().toISOString(),
    dependencies: {
      postgres: { status: 'pending' },
      redis: { status: 'pending' },
      elasticsearch: { status: 'pending' },
    },
  };

  // TODO: Check actual service health
  
  res.json(health);
});

export default router;
