import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import usersRouter from './routes/users.js';
import requestsRouter from './routes/requests.js';
import proposalsRouter from './routes/proposals.js';
import commitmentsRouter from './routes/commitments.js';
import assistanceRouter from './routes/assistance.js';
import railwayRouter from './routes/railway.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // CORS configuration
  const allowedOrigins = [
    'https://railmatte-frontend.onrender.com',
    'http://localhost:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:')
        ) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
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
  app.use('/api/railway', railwayRouter);

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
