const express = require('express');
const { getOrganizationMembers } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/organization')
  .get(protect, getOrganizationMembers);

module.exports = router;
