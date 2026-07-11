import dotenv from "dotenv";
dotenv.config({
  path: ".env"
});

console.log("ENV:", process.env.MONGO_URI);
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import screenerRoutes from "./routes/screenerRoutes.js";
import livekitRoutes from "./routes/livekitRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const startServer = async () => {
  await connectDB();

  const app = express();

  const allowedOrigins = [
    process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : null,
    "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000"
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true
  }));
  app.use(express.json()); 

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/research", researchRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/portfolio", portfolioRoutes);
  app.use("/api/insights", insightRoutes);
  app.use("/api/screener", screenerRoutes);
  app.use("/api/livekit", livekitRoutes);

  if (process.env.NODE_ENV === "production") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendBuildPath = path.resolve(__dirname, "../../frontend/dist");

    app.use(express.static(frontendBuildPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
