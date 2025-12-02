import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { CONSTANTS } from './config/constants';
import { errorMiddleware } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/rate-limit.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import roleRoutes from './modules/roles/roles.routes';
import permissionRoutes from './modules/permissions/permissions.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: CONSTANTS.CORS_ORIGIN,
  credentials: CONSTANTS.CORS_CREDENTIALS,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser(CONSTANTS.COOKIE_SECRET));

// HTTP request logging
if (CONSTANTS.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: CONSTANTS.NODE_ENV
  });
});

// API routes
const API_VERSION = CONSTANTS.API_VERSION;
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, apiRateLimiter, userRoutes);
app.use(`/api/${API_VERSION}/roles`, apiRateLimiter, roleRoutes, permissionRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});


app.use(errorMiddleware);

export default app;
