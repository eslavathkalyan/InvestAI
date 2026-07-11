import express from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateProfile,
  getWalletBalance,
  addWalletBalance,
  withdrawWalletBalance,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/watchlist")
  .get(getWatchlist)
  .post(addToWatchlist);

router.delete("/watchlist/:company", removeFromWatchlist);

router.put("/profile", updateProfile);

router.route("/wallet")
  .get(getWalletBalance)
  .post(addWalletBalance);

router.post("/wallet/withdraw", withdrawWalletBalance);

export default router;
