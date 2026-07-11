import express from "express";
import {
  getPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
} from "../controllers/portfolioController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getPortfolio)
  .post(addPortfolioItem);

router.delete("/:id", deletePortfolioItem);

export default router;
