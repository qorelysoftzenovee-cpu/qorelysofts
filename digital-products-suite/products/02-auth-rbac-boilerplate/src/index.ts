import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { authRouter } from './routes/auth.routes';
import { protectedRouter } from './routes/protected.routes';
import { apiLimiter } from './middleware/rate-limiter';
import { ApiResponse } from './types';

export const app = express();
const PORT = process.env.PORT || 4000;

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    message: 'Auth & RBAC Service is running healthy.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
    timestamp: new Date().toISOString(),
  });
});

// Register routers
app.use('/api/auth', authRouter);
app.use('/api/protected', protectedRouter);

// 404 handler
app.use((_req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response<ApiResponse>, _next: NextFunction) => {
  console.error('[Error] Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
  });
});

// Start server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\x1b[32m✔ Auth & RBAC Server listening on port ${PORT}\x1b[0m`);
    console.log(`\x1b[36mℹ Health check available at http://localhost:${PORT}/health\x1b[0m`);
    console.log(`\x1b[33mℹ Demo admin: admin@qorelysofts.com | Admin123!\x1b[0m`);
    console.log(`\x1b[33mℹ Demo editor: editor@qorelysofts.com | Editor123!\x1b[0m`);
    console.log(`\x1b[33mℹ Demo user:   user@qorelysofts.com   | User123!\x1b[0m`);
  });
}

// Re-export core modules for library usage
export * from './types';
export * from './services/auth-service';
export * from './services/token-service';
export * from './middleware/authenticate';
export * from './middleware/authorize';
export * from './middleware/rate-limiter';
