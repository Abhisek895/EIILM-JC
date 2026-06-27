import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { Database } from '@config/database';
import { errorHandler } from '@middlewares/errorHandler';
import { correlationId } from '@middlewares/correlationId';
import { requestLogger } from '@middlewares/requestLogger';
import '@models/index';
import v1Routes from '@routes/v1/index';

dotenv.config();

const app: Express = express();
const configuredPort = Number.parseInt(process.env.PORT || '5000', 10);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Required so that frontend can load static uploaded assets from backend domain
}));

// Parse comma-separated FRONTEND_URL into an array of allowed origins
const allowedOrigins = [
  ...(
    process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
      : []
  ),
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

app.use(
  cors({
    origin: (origin, callback) => {
      return callback(null, true); // ALLOW ALL ORIGINS FOR TUNNEL TESTING
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 1000, // Increased to 1000 for production to handle multiple parallel API requests per page load
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Correlation IDs
app.use(correlationId);

// Request logging
app.use(requestLogger);

// API routes
app.use('/api/v1', v1Routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'College ERP Server is running',
    service: 'College Management Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const listenWithFallback = async (
  server: http.Server,
  startPort: number
): Promise<number> => {
  let currentPort = startPort;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => {
          server.removeListener('listening', onListening);
          reject(error);
        };

        const onListening = () => {
          server.removeListener('error', onError);
          resolve();
        };

        server.once('error', onError);
        server.once('listening', onListening);
        server.listen(currentPort);
      });

      return currentPort;
    } catch (error: any) {
      if (error.code !== 'EADDRINUSE') {
        throw error;
      }
      currentPort += 1;
    }
  }

  throw new Error(`Unable to bind server from port ${startPort}`);
};

const startServer = async () => {
  try {
    await Database.authenticate();
    console.log('Database connected successfully');

    const server = http.createServer(app);
    const runningPort = await listenWithFallback(server, configuredPort);

    console.log('\nCollege ERP System');
    console.log(`Server running on port ${runningPort}`);
    console.log(`API Base URL: http://localhost:${runningPort}/api/v1`);
    console.log(`Health Check: http://localhost:${runningPort}/health`);
    console.log('Ready for college management operations\n');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

