import express from "express";
import { getMarketInsights } from "../controllers/insightController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMarketInsights);

export default router;
