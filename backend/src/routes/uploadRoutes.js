const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');
const prisma = require('../utils/db');
const { getIo } = require('../utils/socket');

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

    const { taskId, projectId, teamId } = req.body;

    // Format URL for local storage if Cloudinary is not used
    let fileUrl = req.file.path;
    if (!fileUrl.startsWith('http')) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // Save attachment record in DB
    const attachment = await prisma.attachment.create({
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        uploaderId: req.user.id,
        taskId: taskId || null,
        projectId: projectId || null,
        teamId: teamId || null,
      },
      include: {
        task: { select: { projectId: true } }
      }
    });

    if (attachment.task && attachment.task.projectId) {
      try {
        getIo().to(`project_${attachment.task.projectId}`).emit('TASK_UPDATED', { id: attachment.taskId });
      } catch (e) {
        console.error('Socket error:', e);
      }
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
