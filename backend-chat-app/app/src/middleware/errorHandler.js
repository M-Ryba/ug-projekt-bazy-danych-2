// Centralized error handling middleware
export default function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error occurred',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
