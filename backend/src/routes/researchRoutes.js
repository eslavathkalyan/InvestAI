import express from "express";
import {
  createResearch,
  streamResearchHandler,
  getMyReports,
  getReportById,
  shareReport,
  getSharedReports,
} from "../controllers/researchController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Every research route requires a logged-in user, so we apply
// `protect` once here instead of repeating it on each route below.
router.use(protect);

router.post("/", createResearch);
router.get("/", getMyReports);
// IMPORTANT: Register specific paths BEFORE dynamic parameter paths (like /:id)
// so that Express does not resolve them as ids.
router.get("/stream", streamResearchHandler);
router.get("/community/shared", getSharedReports);
router.put("/:id/share", shareReport);
router.get("/:id", getReportById);

export default router;
