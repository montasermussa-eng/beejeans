const rateLimit = require('express-rate-limit');

/**
 * Rate limiter to prevent abuse
 */
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // زودنا الحد كتير
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Fix trust proxy warning for Railway
  validate: {
    trustProxy: false, // Disable trust proxy validation
  },
});

/**
 * Strict rate limiter for auth routes
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts for development
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  // Fix trust proxy warning for Railway
  validate: {
    trustProxy: false,
  },
});

module.exports = {
  rateLimiter,
  authRateLimiter
};
