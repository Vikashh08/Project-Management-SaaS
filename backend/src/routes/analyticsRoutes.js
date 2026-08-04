const express = require('express');
const { 
  getDashboardAnalytics,
  getBurndown,
  getVelocity,
  getTimeTracking
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getDashboardAnalytics);
router.route('/burndown').get(protect, getBurndown);
router.route('/velocity').get(protect, getVelocity);
router.route('/time-tracking').get(protect, getTimeTracking);

module.exports = router;
