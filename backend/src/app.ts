import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Database } from '@config/database';
import { errorHandler } from '@middlewares/errorHandler';
import { requestLogger } from '@middlewares/requestLogger';
import v1Routes from '@routes/v1/index';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// ==================== Middleware ====================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use(requestLogger);

// ==================== Routes ====================
app.use('/api/v1', v1Routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'College ERP Server is running',
    service: 'College Management Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ==================== Database & Server ====================
const startServer = async () => {
  try {
    const db = Database.getInstance();
    await db.authenticate();
    console.log('✓ Database connected successfully');

    app.listen(port, () => {
      console.log(`\n🎓 College ERP System`);
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ API Base URL: http://localhost:${port}/api/v1`);
      console.log(`✓ Health Check: http://localhost:${port}/health`);
      console.log(`✓ Ready for college management operations\n`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
