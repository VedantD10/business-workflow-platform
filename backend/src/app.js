const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const commentRoutes = require('./routes/commentRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const auditRoutes = require('./routes/auditRoutes');

const requestLogger = require('./middleware/logger');

const app = express();

// Trust reverse proxies (essential for Vercel & serverless environments)
app.set('trust proxy', 1);

// Security Headers, Logging & CORS
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(requestLogger);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { message: 'Too many login attempts. Please try again in 15 minutes.', statusCode: 429 } }
});

// Health Check Endpoint
const handleHealth = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    system: 'VESA Business Workflow Platform API',
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Mount Routes (supporting both /api prefix and direct path matching)
const registerRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authLimiter, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/departments`, departmentRoutes);
  app.use(`${prefix}/requests`, requestRoutes);
  app.use(`${prefix}/comments`, commentRoutes);
  app.use(`${prefix}/attachments`, attachmentRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/analytics`, analyticsRoutes);
  app.use(`${prefix}/audit`, auditRoutes);
};

registerRoutes('/api');
registerRoutes('');

// Handle 404
app.use((req, res, next) => {
  next(new NotFoundError(`API Route '${req.originalUrl}' not found.`));
});

// Global Error Middleware
app.use(globalErrorHandler);

module.exports = app;
