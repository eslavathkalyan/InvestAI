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
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";



// Wrapped in an async function so app.listen() only runs once the
// database connection is actually established. Without this, the
// server would start accepting requests immediately while the DB
// connection was still pending in the background - a request could
// arrive and try to query MongoDB before it was ready.
const startServer = async () => {
  await connectDB();

  const app = express();

  // Scoped to the frontend's actual URL instead of allowing any
  // origin. This matters once deployed: frontend (Vercel) and
  // backend (Render/Railway) live on different domains, so an
  // unrestricted cors() would work by accident, not by design. Reuses
  // CLIENT_URL - the same variable that builds the email verification
  // and password reset links - so there's one source of truth for
  // "where the frontend lives" instead of two.
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
  app.use(express.json()); // parses JSON request bodies into req.body

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

  // Serve static files in production
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
