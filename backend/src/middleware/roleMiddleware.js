// Usage: router.get("/admin/users", protect, authorize("admin"), ...)
// Must run after `protect`, since it depends on req.user existing.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to access this resource`,
      });
    }
    next();
  };
};

export default authorize;
