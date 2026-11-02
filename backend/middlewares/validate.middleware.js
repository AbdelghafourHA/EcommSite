// middlewares/validate.middleware.js
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Runs AFTER a chain of express-validator checks.
 * If any failed, throws a 400 ApiError with the list of field errors.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  throw new ApiError(400, "Validation failed", details);
};
