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
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin image serving
app.use(compression());

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.send('TaskFlow AI API is running...');
});

// Setup API routes here
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/projects', require('./src/routes/projectRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));
app.use('/api/teams', require('./src/routes/teamRoutes'));
app.use('/api/search', require('./src/routes/searchRoutes'));
app.use('/api/invites', require('./src/routes/inviteRoutes'));

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const http = require('http');
const { initializeSocket } = require('./src/utils/socket');

const PORT = 5001; // Hardcoded to bypass macOS port 5000 conflict
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
