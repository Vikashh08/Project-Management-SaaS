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
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.route('/:id/comments')
  .post(protect, addComment);

router.route('/:id/subtasks')
  .post(protect, addSubtask);

router.route('/:id/subtasks/:subtaskId')
  .put(protect, toggleSubtask);

module.exports = router;
