// utils/ApiError.js
/**
 * Custom error class carrying an HTTP status code.
 * Thrown anywhere in controllers/middleware, caught by the global error handler.
 *
 * Usage:
 *   throw new ApiError(404, "Product not found");
 *   throw new ApiError(409, "Slug already in use");
 */
export default class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // marks "expected" errors vs bugs
    Error.captureStackTrace(this, this.constructor);
  }
}
