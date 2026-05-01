const { sendError } = require('../utils/response');

/**
 * Global error handling middleware.
 * Must be registered last in Express app.
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, 'Database validation failed.', 422, errors);
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return sendError(res, `${field} already exists.`, 409);
  }

  // Sequelize foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(res, 'Referenced record does not exist.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';
  return sendError(res, message, statusCode);
};

/**
 * 404 handler — place before errorHandler.
 */
const notFound = (req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
};

module.exports = { errorHandler, notFound };
