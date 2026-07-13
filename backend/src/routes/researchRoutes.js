import express from "express";
import {
  getAgents,
  createResearch,
  streamResearchHandler,
  getMyReports,
  getReportById,
  shareReport,
  getSharedReports,
} from "../controllers/researchController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public (protected by auth) route to list available AI agents
router.get("/agents", protect, getAgents);

router.use(protect);

router.post("/", createResearch);
router.get("/", getMyReports);

router.get("/stream", streamResearchHandler);
router.get("/community/shared", getSharedReports);
router.put("/:id/share", shareReport);
router.get("/:id", getReportById);

export default router;
