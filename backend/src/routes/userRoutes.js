const express = require('express');
const { getUserActivity, getUserMetrics, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/activity').get(protect, getUserActivity);
router.route('/metrics').get(protect, getUserMetrics);
router.route('/profile').put(protect, updateProfile);
router.route('/change-password').put(protect, changePassword);

module.exports = router;
