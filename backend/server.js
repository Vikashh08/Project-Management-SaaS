require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
const { initializeSocket } = require('./src/utils/socket');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin image serving
app.use(compression());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: NODE_ENV });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('ProjectDock SaaS API is running...');
});

// API routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/projects', require('./src/routes/projectRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));
app.use('/api/teams', require('./src/routes/teamRoutes'));
app.use('/api/teams/:teamId/sprints', require('./src/routes/sprintRoutes'));
app.use('/api/search', require('./src/routes/searchRoutes'));
app.use('/api/invites', require('./src/routes/inviteRoutes'));
app.use('/api/timelogs', require('./src/routes/timeLogRoutes'));
app.use('/api/wiki', require('./src/routes/wikiRoutes'));
app.use('/api/discussions', require('./src/routes/discussionRoutes'));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown handlers for Render / Docker / Nodemon
process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

const shutdown = () => {
  server.close(() => {
    console.log('Server closed gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
