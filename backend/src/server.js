
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import screenerRoutes from "./routes/screenerRoutes.js";
import livekitRoutes from "./routes/livekitRoutes.js";

import {
  notFound,
  errorHandler
} from "./middleware/errorMiddleware.js";

const startServer = async () => {
  try {
    console.log(
      "PostgreSQL URI configured:",
      Boolean(process.env.POSTGRES_URI)
    );

    // Connect to PostgreSQL before starting the server
    await connectDB();

    const app = express();

    // Allowed frontend origins
    const allowedOrigins = [
      process.env.CLIENT_URL
        ? process.env.CLIENT_URL.replace(/\/$/, "")
        : null,
      "http://localhost:5173",
      "http://localhost:5000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5000"
    ].filter(Boolean);

    // CORS configuration
    app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests without an Origin header
          if (!origin) {
            return callback(null, true);
          }

          const normalizedOrigin = origin.replace(/\/$/, "");

          if (
            allowedOrigins.includes(normalizedOrigin) ||
            normalizedOrigin.endsWith(".vercel.app")
          ) {
            return callback(null, true);
          }

          return callback(
            new Error(`Origin ${origin} not allowed by CORS`)
          );
        },
        credentials: true
      })
    );

    app.use(express.json());

    // Health-check endpoint
    app.get("/api/health", (req, res) => {
      res.status(200).json({
        status: "ok"
      });
    });

    // API routes
    app.use("/api/auth", authRoutes);
    app.use("/api/research", researchRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/portfolio", portfolioRoutes);
    app.use("/api/insights", insightRoutes);
    app.use("/api/screener", screenerRoutes);
    app.use("/api/livekit", livekitRoutes);

    // Handle unknown routes and errors
    app.use(notFound);
    app.use(errorHandler);

    // Render provides the port through process.env.PORT
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

