const express = require('express');
const {
  getDiscussions,
  createDiscussion,
  deleteDiscussion,
  addReply
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/project/:projectId')
  .get(protect, getDiscussions)
  .post(protect, createDiscussion);

router.route('/:id')
  .delete(protect, deleteDiscussion);

router.route('/:id/replies')
  .post(protect, addReply);

module.exports = router;
