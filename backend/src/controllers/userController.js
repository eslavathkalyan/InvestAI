import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(user.watchlist || []);
});

export const addToWatchlist = asyncHandler(async (req, res) => {
  const { company } = req.body;
  if (!company || !company.trim()) {
    return res.status(400).json({ message: "Please provide a company name" });
  }

  const user = await User.findById(req.user._id);
  const formattedCompany = company.trim();

  if (!user.watchlist.includes(formattedCompany)) {
    user.watchlist.push(formattedCompany);
    await user.save();
  }

  res.status(200).json(user.watchlist);
});

export const removeFromWatchlist = asyncHandler(async (req, res) => {
  const { company } = req.params;
  const user = await User.findById(req.user._id);

  user.watchlist = user.watchlist.filter(
    (item) => item.toLowerCase() !== company.trim().toLowerCase()
  );
  await user.save();

  res.status(200).json(user.watchlist);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findById(req.user._id);

  if (name) {
    user.name = name.trim();
  }

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    user.password = password;
  }

  await user.save();

  res.status(200).json({
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const getWalletBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ balance: user.walletBalance || 0 });
});

export const addWalletBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: "Please provide a valid amount to add" });
  }

  const user = await User.findById(req.user._id);
  user.walletBalance = (user.walletBalance || 0) + Number(amount);
  await user.save();

  res.status(200).json({
    message: "Funds added successfully to your wallet",
    balance: user.walletBalance,
  });
});

export const withdrawWalletBalance = asyncHandler(async (req, res) => {
  const { amount, bankAccount, ifsc } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: "Please provide a valid withdrawal amount" });
  }

  if (!bankAccount || !ifsc) {
    return res.status(400).json({ message: "Please provide both bank account number and IFSC code" });
  }

  const user = await User.findById(req.user._id);
  if ((user.walletBalance || 0) < Number(amount)) {
    return res.status(400).json({ message: "Insufficient wallet balance for withdrawal" });
  }

  user.walletBalance = (user.walletBalance || 0) - Number(amount);
  await user.save();

  res.status(200).json({
    message: "Funds successfully withdrawn from your wallet",
    balance: user.walletBalance,
  });
});
