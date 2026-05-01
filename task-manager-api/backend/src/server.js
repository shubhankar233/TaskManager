require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
🚀 Server running on http://localhost:${PORT}
📚 API Docs: http://localhost:${PORT}/api-docs
🌿 Environment: ${process.env.NODE_ENV || 'development'}
    `);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
