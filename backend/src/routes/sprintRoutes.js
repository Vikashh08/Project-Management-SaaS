const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getTeamSprints,
  createSprint,
  updateSprint,
  deleteSprint,
  addTaskToSprint,
  removeTaskFromSprint
} = require('../controllers/sprintController');

const router = express.Router({ mergeParams: true }); // Important to access :teamId from parent router if needed

// Note: We mount this on /api/teams/:teamId/sprints in server.js
// so the base path here is /

router.route('/')
  .get(protect, getTeamSprints)
  .post(protect, createSprint);

router.route('/:sprintId')
  .put(protect, updateSprint)
  .delete(protect, deleteSprint);

router.route('/:sprintId/tasks')
  .post(protect, addTaskToSprint);

router.route('/:sprintId/tasks/:taskId')
  .delete(protect, removeTaskFromSprint);

module.exports = router;
