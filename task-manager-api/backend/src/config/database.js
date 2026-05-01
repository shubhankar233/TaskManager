const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced (tables created/updated).');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
