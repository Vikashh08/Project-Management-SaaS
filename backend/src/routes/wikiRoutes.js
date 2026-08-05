const express = require('express');
const {
  getWikiPages,
  createWikiPage,
  updateWikiPage,
  deleteWikiPage
} = require('../controllers/wikiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/project/:projectId')
  .get(protect, getWikiPages)
  .post(protect, createWikiPage);

router.route('/:id')
  .put(protect, updateWikiPage)
  .delete(protect, deleteWikiPage);

module.exports = router;
