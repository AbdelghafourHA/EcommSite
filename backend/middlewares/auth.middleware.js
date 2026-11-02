// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Protect middleware — verifies the Bearer JWT and attaches the admin
 * to req.admin so downstream controllers can use it.
 *
 * Any failure throws ApiError → global errorHandler formats the response.
 * No try/catch boilerplate, no inconsistent shapes.
 */
const protect = async (req, res, next) => {
  let token;

  // Extract Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim(); // remove "Bearer " prefix
  }

  if (!token) {
    return next(new ApiError(401, "Not authorized, no token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch admin — password excluded by default (select: false in schema)
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(new ApiError(401, "Not authorized, admin not found"));
    }

    // Attach for use in controllers (e.g. audit logging later)
    req.admin = admin;
    next();
  } catch (err) {
    // jwt.verify throws JsonWebTokenError / TokenExpiredError
    // → global errorHandler already maps these to clean 401s
    return next(err);
  }
};

export default protect;
