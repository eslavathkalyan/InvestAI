import jwt from "jsonwebtoken";

// The token payload only carries the user's id on purpose. Anything
// else about the user (role, verified status, etc.) is looked up
// fresh from the database in authMiddleware on every request, so a
// token issued yesterday can't carry stale permissions if an admin
// changes that user's role today.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export default generateToken;
