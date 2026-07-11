import express from "express";
import { getScreenerCompanies } from "../controllers/screenerController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getScreenerCompanies);

export default router;
