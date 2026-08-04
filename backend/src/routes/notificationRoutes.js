const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, clearNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/clear')
  .delete(protect, clearNotifications);

router.route('/:id/read')
  .put(protect, markAsRead);

module.exports = router;
