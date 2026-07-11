// Wraps an async controller function. If the promise it returns
// rejects (or it throws), the error is forwarded to next(error)
// automatically, so Express's error-handling middleware catches it.
// Without this, every controller would need its own try/catch block
// just to avoid unhandled promise rejections.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
