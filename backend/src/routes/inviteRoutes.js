const express = require('express');
const { createInvite, acceptInvite, getPendingInvites, declineInvite } = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Invites creation (Role authorization is handled in the controller based on organization)
router.route('/')
  .post(protect, createInvite);

// Get pending invites for the logged-in user
router.route('/pending')
  .get(protect, getPendingInvites);

// Any authenticated user can accept an invite
router.route('/accept/:token')
  .post(protect, acceptInvite);

// Decline an invite
router.route('/decline/:token')
  .post(protect, declineInvite);

module.exports = router;
