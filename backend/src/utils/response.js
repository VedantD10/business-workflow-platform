/**
 * Standardized REST API response handlers
 */

function successResponse(res, data = null, message = 'Success', statusCode = 200, meta = null) {
  const response = {
    success: true,
    message,
    data
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
}

function errorResponse(res, message = 'Internal Server Error', statusCode = 500, details = null) {
  const response = {
    success: false,
    error: {
      message,
      statusCode
    }
  };
  if (details) {
    response.error.details = details;
  }
  return res.status(statusCode).json(response);
}

module.exports = {
  successResponse,
  errorResponse
};
