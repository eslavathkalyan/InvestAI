import express from "express";
import { getLivekitToken, handleLivekitChat } from "../controllers/livekitController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Enable token retrieval for authenticated users
router.get("/token", protect, getLivekitToken);
router.post("/chat", protect, handleLivekitChat);

export default router;
