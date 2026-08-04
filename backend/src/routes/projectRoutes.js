const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
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

module.exports = router;
