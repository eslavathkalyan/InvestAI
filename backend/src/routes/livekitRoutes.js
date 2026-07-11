import express from "express";
import { getLivekitToken } from "../controllers/livekitController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Enable token retrieval for authenticated users
router.get("/token", protect, getLivekitToken);

export default router;
