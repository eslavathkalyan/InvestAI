import PortfolioItem from "../models/PortfolioItem.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/portfolio
export const getPortfolio = asyncHandler(async (req, res) => {
  const items = await PortfolioItem.find({ userId: req.user._id }).sort({ purchaseDate: -1 });
  res.status(200).json(items);
});

// POST /api/portfolio
export const addPortfolioItem = asyncHandler(async (req, res) => {
  const { company, ticker, shares, purchasePrice, purchaseDate, deductFromWallet } = req.body;

  if (!company || !ticker || !shares || !purchasePrice) {
    return res.status(400).json({ message: "Please provide company, ticker, shares and purchase price" });
  }

  const cost = Number(shares) * Number(purchasePrice);

  if (deductFromWallet) {
    const user = await User.findById(req.user._id);
    if ((user.walletBalance || 0) < cost) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Total cost is ₹${cost.toLocaleString()}, but your balance is ₹${(user.walletBalance || 0).toLocaleString()}.`
      });
    }
    user.walletBalance = (user.walletBalance || 0) - cost;
    await user.save();
  }

  const item = await PortfolioItem.create({
    userId: req.user._id,
    company: company.trim(),
    ticker: ticker.trim().toUpperCase(),
    shares: Number(shares),
    purchasePrice: Number(purchasePrice),
    purchaseDate: purchaseDate || Date.now(),
  });

  res.status(201).json(item);
});

export const deletePortfolioItem = asyncHandler(async (req, res) => {
  const item = await PortfolioItem.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!item) {
    return res.status(404).json({ message: "Holding not found" });
  }

  const sell = req.body?.sell === true || req.query?.sell === "true";
  const sellPrice = Number(req.body?.sellPrice || req.query?.sellPrice);

  if (sell && sellPrice) {
    const refundAmount = item.shares * sellPrice;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { walletBalance: refundAmount }
    });
  }

  await PortfolioItem.findByIdAndDelete(item._id);
  res.status(200).json({ message: sell ? "Stock sold successfully" : "Holding deleted successfully" });
});
