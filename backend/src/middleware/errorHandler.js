const logger = require('../config/logger');
const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  logger.error('Unhandled Server Error', {
    requestId: req?.requestId,
    error: err.message,
    stack: err.stack,
    code: errorCode,
    url: req?.originalUrl,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const userMessage = isProduction && statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  return sendError(res, errorCode, userMessage, statusCode, !isProduction ? err.stack : null);
};

module.exports = errorHandler;
