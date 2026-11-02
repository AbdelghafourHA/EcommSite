// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

const signToken = (adminId) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) throw new ApiError(401, "Invalid email or password");

  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  const token = signToken(admin._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { token, admin: admin.toJSON() }, "Login successful")
    );
});

export const logout = (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
};

export const checkAuth = (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { admin: req.admin }, "Authenticated"));
};
