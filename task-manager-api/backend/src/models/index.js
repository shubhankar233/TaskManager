const User = require('./User');
const Task = require('./Task');

// Associations
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

module.exports = { User, Task };
