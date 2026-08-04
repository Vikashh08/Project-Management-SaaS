const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  addSubtask,
  toggleSubtask,
  deleteAttachment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Only Developers and above can create tasks, others can only view
const canManageTasks = authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER');

router.route('/')
  .post(protect, canManageTasks, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, canManageTasks, updateTask)
  .delete(protect, authorizeRoles('SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD'), deleteTask);

router.route('/:id/comments')
  .post(protect, canManageTasks, addComment);

router.route('/:id/subtasks')
  .post(protect, canManageTasks, addSubtask);

router.route('/:id/subtasks/:subtaskId')
  .put(protect, canManageTasks, toggleSubtask);

router.route('/:id/attachments/:attachmentId')
  .delete(protect, canManageTasks, deleteAttachment);

module.exports = router;
