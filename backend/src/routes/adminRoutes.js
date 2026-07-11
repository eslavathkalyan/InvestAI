import express from "express";
import {
  getAllUsers,
  approveUser,
  blockUser,
  unblockUser,
  deleteUser,
  getAnalytics,
  getUserPortfolio,
  getUserReports,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.get("/users/:id/portfolio", getUserPortfolio);
router.get("/users/:id/reports", getUserReports);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);
router.get("/analytics", getAnalytics);

export default router;
