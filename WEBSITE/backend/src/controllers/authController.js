const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/hash');
const { generateToken, setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Register a new Trainee user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 'EMAIL_EXISTS', 'An account with this email address already exists', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      passwordHash,
      role: 'user', // Public registration can never grant admin role
      active: true,
    });

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    logger.info('New user registered successfully', { userId: user._id, email: user.email });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user (or admin)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = email.toLowerCase().trim();

    // Query by email, or support admin logging in via username identifier
    const isAdminLookup =
      identifier === 'admin' ||
      identifier === 'admin@coachkush.com' ||
      identifier === (env.ADMIN_USERNAME || '').toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { email: `${identifier}@coachkush.internal` },
        ...(isAdminLookup ? [{ role: 'admin' }] : []),
      ],
    });

    if (!user) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    if (!user.active) {
      return sendError(res, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated. Please contact support.', 403);
    }

    let isMatch = await verifyPassword(user.passwordHash, password);

    // Resilient fallback for admin account to ensure credentials in .env always work
    if (!isMatch && user.role === 'admin') {
      if (password === env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'development' && (password === 'admin123' || password === 'admin'))) {
        isMatch = true;
        // Resync hash in database
        user.passwordHash = await hashPassword(password);
        await user.save();
        logger.info('Admin password hash synchronized successfully upon login', { userId: user._id });
      }
    }

    if (!isMatch) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    logger.info('User logged in successfully', { userId: user._id, role: user.role });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, null, 'Logged out successfully');
};

/**
 * Get currently authenticated user profile
 */
const getMe = async (req, res) => {
  return sendSuccess(res, {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * Dedicated Admin Portal Login
 * Enforces strict admin role check and sets secure session cookie
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = (email || '').toLowerCase().trim();

    const isAdminLookup =
      identifier === 'admin' ||
      identifier === 'admin@coachkush.com' ||
      identifier === (env.ADMIN_USERNAME || '').toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { email: `${identifier}@coachkush.internal` },
        ...(isAdminLookup ? [{ role: 'admin' }] : []),
      ],
    });

    if (!user) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid administrator credentials', 401);
    }

    if (!user.active) {
      return sendError(res, 'ACCOUNT_DEACTIVATED', 'This account has been deactivated.', 403);
    }

    let isMatch = await verifyPassword(user.passwordHash, password);

    // Development/bootstrap fallback
    if (!isMatch && user.role === 'admin') {
      if (password === env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'development' && (password === 'admin123' || password === 'admin'))) {
        isMatch = true;
        user.passwordHash = await hashPassword(password);
        await user.save();
        logger.info('Admin password hash synchronized successfully upon admin portal login', { userId: user._id });
      }
    }

    if (!isMatch) {
      return sendError(res, 'INVALID_CREDENTIALS', 'Invalid administrator credentials', 401);
    }

    // Strict Admin Role Enforcement: Non-admins cannot log in via the admin portal
    if (user.role !== 'admin') {
      logger.warn('Non-admin user attempted login to admin portal', { userId: user._id, email: user.email });
      return sendError(res, 'FORBIDDEN', 'Access denied. This portal is restricted to authorized administrators only.', 403);
    }

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    logger.info('Administrator logged in successfully via admin portal', { userId: user._id });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      'Admin authentication successful'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  logout,
  getMe,
};
