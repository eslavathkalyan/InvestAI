import User from "../models/User.js";
import ResearchReport from "../models/ResearchReport.js";
import PortfolioItem from "../models/PortfolioItem.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
  res.status(200).json(users);
});

const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isApproved = true;
  await user.save();

  res.status(200).json({ message: `${user.name} approved` });
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't block your own account" });
  }

  user.isBlocked = true;
  await user.save();

  res.status(200).json({ message: `${user.name} blocked` });
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = false;
  await user.save();

  res.status(200).json({ message: `${user.name} unblocked` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't delete your own account" });
  }

  await user.deleteOne();

  await ResearchReport.deleteMany({ userId: user._id });

  res.status(200).json({ message: `${user.name} deleted` });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, approvedUsers, blockedUsers, totalReports, investCount, passCount] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: true }),
      User.countDocuments({ isBlocked: true }),
      ResearchReport.countDocuments(),
      ResearchReport.countDocuments({ decision: "INVEST" }),
      ResearchReport.countDocuments({ decision: "PASS" }),
    ]);

  res.status(200).json({
    totalUsers,
    approvedUsers,
    blockedUsers,
    totalReports,
    investCount,
    passCount,
  });
});

const getUserPortfolio = asyncHandler(async (req, res) => {
  const items = await PortfolioItem.find({ userId: req.params.id }).sort({ purchaseDate: -1 });
  res.status(200).json(items);
});

const getUserReports = asyncHandler(async (req, res) => {
  const reports = await ResearchReport.find({ userId: req.params.id }).sort({ createdAt: -1 });
  res.status(200).json(reports);
});

export { 
  getAllUsers, 
  approveUser, 
  blockUser, 
  unblockUser, 
  deleteUser, 
  getAnalytics,
  getUserPortfolio,
  getUserReports
};
