const express = require('express');
const {
  startTimer,
  stopTimer,
  getTaskTimeLogs,
  getActiveTimer,
  logTimeManually,
  deleteTimeLog,
  getMyTimeLogs,
} = require('../controllers/timeLogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Global routes (not scoped to a task)
router.get('/active', protect, getActiveTimer);
router.get('/my', protect, getMyTimeLogs);
router.delete('/:id', protect, deleteTimeLog);

// Task-scoped routes
router.post('/task/:taskId/start', protect, startTimer);
router.put('/task/:taskId/stop', protect, stopTimer);
router.get('/task/:taskId', protect, getTaskTimeLogs);
router.post('/task/:taskId', protect, logTimeManually);

module.exports = router;
