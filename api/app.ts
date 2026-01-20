/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import ordersRoutes from './routes/orders.js';
import trialRoutes from './routes/trial.js';
import cronRoutes from './routes/cron.js';
import auditRoutes from './routes/audit.js';
import logger from './lib/logger.js';
import { captureException } from './lib/sentry.js';
import { swaggerSpec } from './lib/swagger.js';
import { createRequestMetadata, metadataToJSON } from './lib/metadata.js';


// load env
dotenv.config();


const app: express.Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL?.split(',').map(url => url.trim()) || []
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const metadata = createRequestMetadata(
    req.ip || req.socket.remoteAddress,
    req.headers['user-agent'],
    req.method,
    req.path,
    req.headers.referer
  );
  (req as any).requestMetadata = metadata;
  next();
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/trial', trialRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/audit-logs', auditRoutes);

  /**
   * health
   */
  app.get('/api/health', (req: Request, res: Response): void => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const healthCheck = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      }
    };
    res.status(200).json(healthCheck);
  });

if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response) => {
  captureException(error, {
    method: req.method,
    path: req.path,
    body: req.body
  });
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path
  });
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

export default app;