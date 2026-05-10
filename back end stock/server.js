const dotenv = require('dotenv');
const connectDB = require('./config/database');
const cron = require('./config/cron');

dotenv.config();

// Connect to database
connectDB();

// Initialize cron jobs
cron();

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

