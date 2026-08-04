const express = require('express');
const {
  getTeams, getTeamById, createTeam, updateTeam, deleteTeam,
  addTeamMember, removeTeamMember,
  getOrganizationMembers, updateMemberRole, removeMember,
  getTeamMessages, postTeamMessage,
  getTeamFiles, deleteTeamFile
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Org-level member management (used by Team Directory page)
router.route('/organization').get(protect, getOrganizationMembers);
router.route('/members/:memberId/role').put(protect, updateMemberRole);
router.route('/members/:memberId').delete(protect, removeMember);

// Team CRUD
router.route('/').get(protect, getTeams).post(protect, createTeam);
router.route('/:id').get(protect, getTeamById).put(protect, updateTeam).delete(protect, deleteTeam);

// Team member management
router.route('/:id/members').post(protect, addTeamMember);
router.route('/:id/members/:userId').delete(protect, removeTeamMember);

// Team messaging
router.route('/:id/messages').get(protect, getTeamMessages).post(protect, postTeamMessage);

// Team files
router.route('/:id/files').get(protect, getTeamFiles);
router.route('/:id/files/:fileId').delete(protect, deleteTeamFile);

module.exports = router;
