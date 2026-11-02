// routes/auth.route.js
import { Router } from "express";
import { login, logout, checkAuth } from "../controllers/auth.controller.js";
import { loginValidator } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import protect from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rate-limit.middleware.js";

const router = Router();

// POST /api/auth/login — rate-limited to 10 attempts / 15 min per IP
router.post("/login", authLimiter, loginValidator, validate, login);

// POST /api/auth/logout — stateless, no auth required (client drops token)
router.post("/logout", logout);

// GET /api/auth/check-auth — requires a valid JWT
router.get("/check-auth", protect, checkAuth);

export default router;
