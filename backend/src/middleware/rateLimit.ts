import rateLimit from 'express-rate-limit';

/**
 * Rate limiting for message sending
 */
export const messageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many messages sent, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting for session creation
 */
export const sessionRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 session creations per windowMs
  message: {
    error: 'Too many session creation attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting for OAuth endpoints
 */
export const oauthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 OAuth attempts per windowMs
  message: {
    error: 'Too many OAuth attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiting
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
