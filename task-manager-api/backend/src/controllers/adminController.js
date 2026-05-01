const { User, Task } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/v1/admin/users
 * Admin: List all users.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    return sendSuccess(res, {
      users,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/role
 * Admin: Change a user's role.
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 'Role must be "user" or "admin".', 400);
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);

    await user.update({ role });
    return sendSuccess(res, user, `User role updated to ${role}.`);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/deactivate
 * Admin: Deactivate a user account.
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);

    await user.update({ isActive: false });
    return sendSuccess(res, user, 'User deactivated.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/stats
 * Admin: Dashboard stats.
 */
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, activeTasks] = await Promise.all([
      User.count(),
      Task.count(),
      Task.count({ where: { status: 'in_progress' } }),
    ]);

    return sendSuccess(res, { totalUsers, totalTasks, activeTasks });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUserRole, deactivateUser, getStats };
