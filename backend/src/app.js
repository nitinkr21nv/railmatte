import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import usersRouter from './routes/users.js';
import requestsRouter from './routes/requests.js';
import proposalsRouter from './routes/proposals.js';
import commitmentsRouter from './routes/commitments.js';
import assistanceRouter from './routes/assistance.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Security: CORS configuration
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching origin
        if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev, can restrict in production
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
    })
  );

  // Payload size limitation to mitigate memory DOS attacks
  app.use(express.json({ limit: '100kb' }));

  // Request logging in development
  if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/proposals', proposalsRouter);
  app.use('/api/commitments', commitmentsRouter);
  app.use('/api/assistance', assistanceRouter);

  // Catch-all for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'NotFound',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
