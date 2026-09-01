const { errorResponse } = require('../utils/response');

function globalErrorHandler(err, req, res, next) {
  console.error(`[API ERROR] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.details || err.stack : err.details || null
  );
}

module.exports = globalErrorHandler;
