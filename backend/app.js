// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";

import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rate-limit.middleware.js";

import authRoutes from "./routes/auth.route.js";
import categoryRoutes from "./routes/category.route.js";
import productRoutes from "./routes/product.route.js";

const app = express();

/* -------------------------------------------------------------------------- */
/*                              Trust proxy                                   */
/* -------------------------------------------------------------------------- */
app.set("trust proxy", 1);

/* -------------------------------------------------------------------------- */
/*                              Security                                      */
/* -------------------------------------------------------------------------- */
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* -------------------------------------------------------------------------- */
/*                  NoSQL injection sanitization (Express 5 safe)             */
/* -------------------------------------------------------------------------- */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  next();
});

// Prevent HTTP parameter pollution
app.use(hpp());

// Compression (gzip)
app.use(compression());

/* -------------------------------------------------------------------------- */
/*                              Rate limiting                                 */
/* -------------------------------------------------------------------------- */
app.use("/api", globalLimiter);

/* -------------------------------------------------------------------------- */
/*                              Routes                                        */
/* -------------------------------------------------------------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

/* -------------------------------------------------------------------------- */
/*                              404 + Errors                                  */
/* -------------------------------------------------------------------------- */
app.use(notFound);
app.use(errorHandler);

export default app;
