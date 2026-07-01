import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import 'express-async-errors';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import foodRoutes from './routes/foods';
import healthRoutes from './routes/health';

// Import middleware
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

const app: Express = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

import axios from 'axios';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth';

const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL || 'http://localhost:3001';

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);

// Catch-all proxy for other core services (orders, reviews, users, notifications, conversations)
app.use('/api/:resource*', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const targetUrl = `${CORE_SERVICE_URL}${req.originalUrl}`;
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': req.userId || '',
        'X-User-Email': req.userEmail || '',
        'X-User-Role': req.userRole || '',
      }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Gateway Error', message: error.message };
    res.status(status).json(data);
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>EUshop API Gateway</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0a1a; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: rgba(255, 255, 255, 0.05); padding: 40px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); backdrop-filter: blur(4px); }
          h1 { color: #3b82f6; margin-top: 0; }
          p { color: #94a3b8; font-size: 1.1em; line-height: 1.6; }
          a { color: #3b82f6; text-decoration: none; font-weight: bold; border-bottom: 2px solid transparent; transition: all 0.2s; }
          a:hover { border-bottom-color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 EUshop API Gateway</h1>
          <p>This is the backend API gateway running on port <b>3001</b>.</p>
          <p>To view the user interface, open the frontend portal here:<br>
             <a href="http://localhost:3002/">👉 http://localhost:3002</a></p>
        </div>
      </body>
    </html>
  `);
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
