const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUsers, updateUserRole, deactivateUser, getStats } = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats object.
 *       403:
 *         description: Forbidden.
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list with pagination.
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Change user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Role updated.
 */
router.patch('/users/:id/role', updateUserRole);

/**
 * @swagger
 * /api/v1/admin/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deactivated.
 */
router.patch('/users/:id/deactivate', deactivateUser);

module.exports = router;
