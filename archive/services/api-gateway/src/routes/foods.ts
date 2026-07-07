import { Request, Response, Router } from 'express';
import axios from 'axios';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL || 'http://localhost:3001';

/**
 * GET /api/foods
 * Forward food search/listing to Core Service
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${CORE_SERVICE_URL}/api/foods`, {
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal Server Error', message: error.message };
    res.status(status).json(data);
  }
});

/**
 * GET /api/foods/trending
 * Forward trending foods request
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${CORE_SERVICE_URL}/api/foods/trending`, {
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal Server Error', message: error.message };
    res.status(status).json(data);
  }
});

/**
 * GET /api/foods/:id
 * Forward details fetch to Core Service
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${CORE_SERVICE_URL}/api/foods/${id}`);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Food not found', message: error.message };
    res.status(status).json(data);
  }
});

/**
 * POST /api/foods
 * Create food listing (Authenticated)
 */
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const response = await axios.post(`${CORE_SERVICE_URL}/api/foods`, req.body, {
      headers: {
        'X-User-Id': req.userId || ''
      }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Failed to create listing', message: error.message };
    res.status(status).json(data);
  }
});

/**
 * PUT /api/foods/:id
 * Update listing (Authenticated)
 */
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const response = await axios.put(`${CORE_SERVICE_URL}/api/foods/${id}`, req.body, {
      headers: {
        'X-User-Id': req.userId || ''
      }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Failed to update listing', message: error.message };
    res.status(status).json(data);
  }
});

/**
 * DELETE /api/foods/:id
 * Delete listing (Authenticated)
 */
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const response = await axios.delete(`${CORE_SERVICE_URL}/api/foods/${id}`, {
      headers: {
        'X-User-Id': req.userId || ''
      }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Failed to delete listing', message: error.message };
    res.status(status).json(data);
  }
});

export default router;
