require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.send('ProjectDock API is running...');
});

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

const http = require('http');
const { initializeSocket } = require('./src/utils/socket');

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown — releases the port so nodemon can restart cleanly
const shutdown = () => {
  server.close(() => {
    console.log('Server closed gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
