import User from "../models/User.js";
import ResearchReport from "../models/ResearchReport.js";
import PortfolioItem from "../models/PortfolioItem.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
  res.status(200).json(users);
});

// PUT /api/admin/users/:id/approve
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isApproved = true;
  await user.save();

  res.status(200).json({ message: `${user.name} approved` });
});

// PUT /api/admin/users/:id/block
const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // An admin blocking their own account would lock everyone out of
  // the admin panel with no way back in, so this is refused outright
  // rather than just discouraged.
  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't block your own account" });
  }

  user.isBlocked = true;
  await user.save();

  res.status(200).json({ message: `${user.name} blocked` });
});

// PUT /api/admin/users/:id/unblock
const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = false;
  await user.save();

  res.status(200).json({ message: `${user.name} unblocked` });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't delete your own account" });
  }

  await user.deleteOne();
  // Without this, deleting a user would leave their reports in the
  // database pointing at a userId that no longer exists anywhere.
  await ResearchReport.deleteMany({ userId: user._id });

  res.status(200).json({ message: `${user.name} deleted` });
});

// GET /api/admin/analytics
// Simple counts rather than a full analytics engine - matches what
// the spec actually asks for ("platform analytics") without building
// out a reporting system nothing else in this app needs yet.
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

// GET /api/admin/users/:id/portfolio
const getUserPortfolio = asyncHandler(async (req, res) => {
  const items = await PortfolioItem.find({ userId: req.params.id }).sort({ purchaseDate: -1 });
  res.status(200).json(items);
});

// GET /api/admin/users/:id/reports
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
