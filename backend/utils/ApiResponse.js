// utils/ApiResponse.js
/**
 * Uniform success response wrapper.
 * Keeps every successful response shaped the same so the frontend never guesses.
 *
 * Usage:
 *   return res.status(200).json(new ApiResponse(200, data, "Products fetched"));
 */
export default class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
  }
}
