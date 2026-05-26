import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import csrf from 'csurf';
import { env, isAllowedOrigin } from './config/env.js';
import { audit } from './middlewares/audit.js';
import { errorHandler, notFound } from './middlewares/error.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import agentRoutes from './routes/agent.routes.js';
import propertyRoutes from './routes/property.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import chatRoutes from './routes/chat.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: (origin, callback) => callback(null, isAllowedOrigin(origin)), credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 350, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: env.nodeEnv === 'production' ? 'none' : 'lax', secure: env.nodeEnv === 'production' } });
app.get('/api/csrf-token', csrfProtection, (req, res) => res.json({ success: true, csrfToken: req.csrfToken() }));
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.headers.authorization) return next();
  return csrfProtection(req, res, next);
});

app.get('/', (_req, res) => res.json({ success: true, message: 'REMS API is running' }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'REMS API is healthy' }));
app.use(audit);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
