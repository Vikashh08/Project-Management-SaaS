const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  assignTeamToProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'), updateProject)
  .delete(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER'), deleteProject);

router.route('/:id/members')
  .post(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER'), addProjectMember);

router.route('/:id/members/:userId')
  .delete(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER'), removeProjectMember);

router.route('/:id/team')
  .put(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER'), assignTeamToProject);

module.exports = router;
