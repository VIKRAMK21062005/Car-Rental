// server.js
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

// Database & Services
import connectDB from './config/db.js';
import emailService from './services/emailService.js';
import smsService from './services/smsService.js';
import { validateAIConfig } from './services/aiService.js';

// Routers
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import carRoutes from './routes/carRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';

// Models
import Car from './models/Car.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate critical environment variables
const validateEnvVariables = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
  }

  // Check optional services
  console.log('\n🔍 Service Configuration Status:');
  console.log(`- MongoDB: ${process.env.MONGODB_URI ? '✅' : '❌'}`);
  console.log(`- JWT: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
  console.log(`- Email: ${process.env.EMAIL_USER ? '✅' : '⚠️  Not configured'}`);
  console.log(`- SMS: ${process.env.TWILIO_ACCOUNT_SID ? '✅' : '⚠️  Not configured'}`);
  console.log(`- Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅' : '⚠️  Not configured'}`);
  
  // Validate AI configuration
  validateAIConfig();
  console.log('');
};

// Validate environment on startup
validateEnvVariables();

// Connect DB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Dev logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Optional: remove old car index (for backward compatibility)
Car.collection.dropIndex('registrationNumber_1')
  .then(() => console.log('✅ Old car index removed'))
  .catch(() => {}); // Ignore error if index doesn't exist

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected',
      email: process.env.EMAIL_USER ? 'configured' : 'not configured',
      sms: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not configured',
      ai: (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) ? 'configured' : 'not configured',
      payment: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured'
    }
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Car Rental System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      cars: '/api/cars',
      bookings: '/api/bookings',
      chatbot: '/api/chatbot',
      coupons: '/api/coupons',
      notifications: '/api/notifications',
      health: '/health'
    },
    documentation: 'https://your-docs-url.com'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚗 Car Rental System API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middlewares (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');

  // Verify services
  console.log('🔍 Verifying services...');
  await emailService.verifyConnection();
  await smsService.verifyConnection();
  console.log('');
  
  console.log('✅ Server is ready to accept requests');
  console.log('═══════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Rejection:', err?.message || err);
  console.error('Stack:', err?.stack);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err?.message || err);
  console.error('Stack:', err?.stack);
  process.exit(1);
});

export default app;