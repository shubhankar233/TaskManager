const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user payload.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'taskmanager-api',
  });
};

/**
 * Verify a JWT and return the decoded payload.
 * Throws if invalid or expired.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'taskmanager-api',
  });
};

module.exports = { generateToken, verifyToken };
