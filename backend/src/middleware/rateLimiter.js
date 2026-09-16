const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

const createLimiter = (windowMinutes, maxRequests, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      sendError(
        res,
        'RATE_LIMIT_EXCEEDED',
        message || 'Too many requests, please try again later.',
        429
      );
    },
    skip: (req) => process.env.NODE_ENV === 'test', // Skip in automated tests for speed
  });
};

const generalLimiter = createLimiter(15, 300, 'Too many requests from this IP. Please wait a moment.');
const loginLimiter = createLimiter(15, 10, 'Too many login attempts. Please try again after 15 minutes.');
const registerLimiter = createLimiter(15, 10, 'Too many accounts registered from this IP. Please try again later.');
const contactLimiter = createLimiter(15, 20, 'Too many contact messages sent. Please wait before submitting again.');
const paymentLimiter = createLimiter(15, 30, 'Too many payment requests. Please try again in a few minutes.');

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  contactLimiter,
  paymentLimiter,
};
