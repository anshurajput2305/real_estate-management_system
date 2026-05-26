import mongoose from 'mongoose';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let details = err.details || null;

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((item) => item.message);
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value';
    details = err.keyValue;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  if (err.code === 'EBADCSRFTOKEN') {
    statusCode = 403;
    message = 'Invalid CSRF token';
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: env.nodeEnv === 'production' ? undefined : err.stack
  });
};
