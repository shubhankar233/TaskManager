const { body, query, param } = require('express-validator');
const { Op } = require('sequelize');
const { Task, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Validation Rules ───────────────────────────────────────────────────────

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 100 }),
  body('description').optional().trim(),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be: todo, in_progress, or done.'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium, or high.'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date (YYYY-MM-DD).'),
];

const updateTaskValidation = [
  body('title').optional().trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601(),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getWhereClause = (req) => {
  // Admins see all tasks; regular users see only their own
  return req.user.role === 'admin' ? {} : { userId: req.user.id };
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/tasks
 * List tasks. Supports filtering by status, priority, and pagination.
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const where = getWhereClause(req);

    if (status) where.status = status;
    if (priority) where.priority = priority;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'owner', attributes: ['id', 'username', 'email'] }],
    });

    return sendSuccess(res, {
      tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks/:id
 * Get a single task by ID.
 */
const getTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id, ...getWhereClause(req) };
    const task = await Task.findOne({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'username', 'email'] }],
    });

    if (!task) return sendError(res, 'Task not found.', 404);
    return sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/tasks
 * Create a new task (assigned to the logged-in user).
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user.id,
    });
    return sendSuccess(res, task, 'Task created.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/tasks/:id
 * Update a task. Users can only update their own tasks.
 */
const updateTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id, ...getWhereClause(req) };
    const task = await Task.findOne({ where });

    if (!task) return sendError(res, 'Task not found.', 404);

    const { title, description, status, priority, dueDate } = req.body;
    await task.update({ title, description, status, priority, dueDate });

    return sendSuccess(res, task, 'Task updated.');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/tasks/:id
 * Delete a task. Users can only delete their own tasks; admins delete any.
 */
const deleteTask = async (req, res, next) => {
  try {
    const where = { id: req.params.id, ...getWhereClause(req) };
    const task = await Task.findOne({ where });

    if (!task) return sendError(res, 'Task not found.', 404);

    await task.destroy();
    return sendSuccess(res, null, 'Task deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks, getTask, createTask, updateTask, deleteTask,
  taskValidation, updateTaskValidation,
};
