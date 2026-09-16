const jwt = require('jsonwebtoken');
const env = require('../config/env');

const COOKIE_NAME = 'coachkush_session';

/**
 * Generate signed JWT token
 * @param {object} payload - Identity payload
 * @returns {string} - JWT string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {object} - Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Cookie options matching master specification
 */
const getCookieOptions = () => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // Support cross-site if domains differ in prod or lax in local
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  };
};

/**
 * Attach auth cookie to HTTP response
 * @param {object} res - Express response
 * @param {string} token - JWT
 */
const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

/**
 * Clear auth cookie from HTTP response
 * @param {object} res - Express response
 */
const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
};

module.exports = {
  COOKIE_NAME,
  generateToken,
  verifyToken,
  getCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
