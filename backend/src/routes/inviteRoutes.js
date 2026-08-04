const express = require('express');
const { createInvite, acceptInvite } = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Only Admins can invite
router.route('/')
  .post(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN'), createInvite);

// Any authenticated user can accept an invite
router.route('/accept/:token')
  .post(protect, acceptInvite);

module.exports = router;
