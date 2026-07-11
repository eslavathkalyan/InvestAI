// Catches requests to routes that don't exist and forwards them into
// errorHandler below, so a 404 gets the same JSON shape as any other
// error instead of Express's default HTML error page.
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Final error handler. Anything thrown in a controller, or passed to
// next(error), ends up here instead of each controller writing its
// own try/catch and its own response format.
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
