/**
 * Standard Success Response
 */
const sendSuccess = (res, data = null, message = null, statusCode = 200) => {
  const response = {
    success: true,
    requestId: res.req?.requestId || null,
  };

  if (message) {
    response.message = message;
  }

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard Error Response
 */
const sendError = (res, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
    requestId: res.req?.requestId || null,
  };

  if (details && process.env.NODE_ENV !== 'production') {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
