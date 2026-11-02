// middlewares/error.middleware.js
import ApiError from "../utils/ApiError.js";

/**
 * 404 handler — must be mounted AFTER all routes.
 */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central error handler — must be the LAST middleware.
 * Handles ApiError, Mongoose validation/cast errors, duplicate keys, JWT errors, and unknown errors.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  // Mongoose: validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // MongoDB: duplicate key (unique index)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for "${field}"`;
    details = err.keyValue || null;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large (max 5MB)";
  }

  // Log non-operational (unexpected) errors in full
  if (!err.isOperational) {
    console.error("💥 Unexpected error:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === "development" && !err.isOperational
      ? { stack: err.stack }
      : {}),
  });
};
