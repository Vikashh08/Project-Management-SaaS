const express = require('express');
const { getUserActivity, getUserMetrics, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/activity').get(protect, getUserActivity);
router.route('/metrics').get(protect, getUserMetrics);
router.route('/profile').put(protect, updateProfile);

module.exports = router;
