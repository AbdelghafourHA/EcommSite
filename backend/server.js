// server.js
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });

    /* ---------------------------------------------------------------------- */
    /*                  Graceful shutdown (Render-friendly)                  */
    /* ---------------------------------------------------------------------- */
    const shutdown = (signal) => {
      console.log(`\n${signal} received — closing server...`);
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });

      // Force-exit if hung after 10s
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      console.error("💥 Unhandled rejection:", reason);
    });
    process.on("uncaughtException", (err) => {
      console.error("💥 Uncaught exception:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
