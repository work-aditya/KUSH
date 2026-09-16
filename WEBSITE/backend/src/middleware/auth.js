const { verifyToken, COOKIE_NAME } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const User = require('../models/User');

/**
 * Authenticate user from secure HTTP-only cookie or Bearer header
 */
const authenticateUser = async (req, res, next) => {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    // Fallback support for Authorization: Bearer <token> (useful for automated testing)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication session not found', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return sendError(res, 'INVALID_TOKEN', 'Session has expired or is invalid', 401);
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return sendError(res, 'USER_NOT_FOUND', 'User session is no longer valid', 401);
    }

    if (!user.active) {
      return sendError(res, 'USER_DEACTIVATED', 'Your account has been deactivated', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'AUTH_ERROR', 'Authentication failed', 401);
  }
};

/**
 * Require role='admin' from verified server-side identity
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    return sendError(res, 'FORBIDDEN', 'Access denied: Admin privileges required', 403);
  }

  next();
};

module.exports = {
  authenticateUser,
  requireAdmin,
};
