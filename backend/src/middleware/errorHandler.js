/**
 * Centralized error handler
 * Prevents leak of internal paths, credentials, and stack traces to clients.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const response = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred. Please try again.',
  };

  // Only attach details if explicitly safe
  if (err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
}
