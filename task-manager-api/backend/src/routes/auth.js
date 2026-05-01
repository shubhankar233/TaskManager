const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  register, login, getProfile,
  registerValidation, loginValidation,
} = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string, example: johndoe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Pass1234 }
 *     responses:
 *       201:
 *         description: User registered successfully, returns JWT.
 *       409:
 *         description: Email already registered.
 *       422:
 *         description: Validation errors.
 */
router.post('/register', registerValidation, validate, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT.
 *       401:
 *         description: Invalid credentials.
 */
router.post('/login', loginValidation, validate, login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me', authenticate, getProfile);

module.exports = router;
