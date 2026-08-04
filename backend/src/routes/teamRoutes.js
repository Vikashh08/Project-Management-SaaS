const express = require('express');
const { getOrganizationMembers, updateMemberRole, removeMember } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/organization').get(protect, getOrganizationMembers);
router.route('/members/:memberId/role').put(protect, updateMemberRole);
router.route('/members/:memberId').delete(protect, removeMember);

module.exports = router;
