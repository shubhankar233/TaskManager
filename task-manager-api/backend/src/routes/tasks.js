const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  getTasks, getTask, createTask, updateTask, deleteTask,
  taskValidation, updateTaskValidation,
} = require('../controllers/taskController');

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management (CRUD)
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: List tasks (own tasks for users, all for admin)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in_progress, done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated task list.
 */
router.get('/', getTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task object.
 *       404:
 *         description: Task not found.
 */
router.get('/:id', getTask);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in_progress, done] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               dueDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Task created.
 */
router.post('/', taskValidation, validate, createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               priority: { type: string }
 *               dueDate: { type: string }
 *     responses:
 *       200:
 *         description: Task updated.
 *       404:
 *         description: Task not found.
 */
router.put('/:id', updateTaskValidation, validate, updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted.
 *       404:
 *         description: Task not found.
 */
router.delete('/:id', deleteTask);

module.exports = router;
