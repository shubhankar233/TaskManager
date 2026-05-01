const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const { User } = require('../models');

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user from DB to ensure they still exist & are active
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 'User not found or deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401);
    }
    return sendError(res, 'Authentication failed.', 500);
  }
};

/**
 * Middleware factory: Role-based access control.
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}.`,
        403
      );
    }
    next();
  };
};

module.exports = { authenticate, authorize };
