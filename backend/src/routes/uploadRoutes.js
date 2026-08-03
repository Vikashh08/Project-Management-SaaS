const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');
const prisma = require('../utils/db');

const router = express.Router();

// @desc    Upload a file (generic or task attachment)
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const { taskId, projectId } = req.body;

    // Save attachment record in DB
    const attachment = await prisma.attachment.create({
      data: {
        url: req.file.path,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        uploaderId: req.user.id,
        taskId: taskId || null,
        projectId: projectId || null,
      },
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
