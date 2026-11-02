// middlewares/rate-limit.middleware.js
import rateLimit from "express-rate-limit";

// Global API limiter (mounted in app.js on /api)
export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again later.",
  },
});

// Strict login limiter — brute-force protection
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});
