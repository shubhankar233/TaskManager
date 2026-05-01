const { body } = require('express-validator');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Validation Rules ───────────────────────────────────────────────────────

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3–50 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Register a new user (role defaults to 'user').
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendError(res, 'Email already registered.', 409);
    }

    const user = await User.create({ username, email, password });

    const token = generateToken({ id: user.id, role: user.role });

    return sendSuccess(
      res,
      { token, user },
      'Registration successful.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Login and receive a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Contact admin.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    return sendSuccess(res, { token, user }, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Get currently authenticated user's profile.
 */
const getProfile = async (req, res) => {
  return sendSuccess(res, req.user, 'Profile fetched.');
};

module.exports = { register, login, getProfile, registerValidation, loginValidation };
