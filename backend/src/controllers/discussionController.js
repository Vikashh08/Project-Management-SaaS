const prisma = require('../utils/db');

// @desc    Get discussions for a project
// @route   GET /api/projects/:projectId/discussions
// @access  Private
const getDiscussions = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const discussions = await prisma.discussion.findMany({
      where: { projectId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: {
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(discussions);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a discussion
// @route   POST /api/projects/:projectId/discussions
// @access  Private
const createDiscussion = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400);
      throw new Error('Title and content are required');
    }

    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        projectId,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        replies: true
      }
    });

    res.status(201).json(discussion);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private
const deleteDiscussion = async (req, res, next) => {
  try {
    await prisma.discussion.delete({ where: { id: req.params.id } });
    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply to a discussion
// @route   POST /api/discussions/:id/replies
// @access  Private
const addReply = async (req, res, next) => {
  try {
    const { id: discussionId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Reply content is required');
    }

    const reply = await prisma.discussionReply.create({
      data: {
        content,
        discussionId,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Update parent discussion's updatedAt timestamp
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(reply);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiscussions,
  createDiscussion,
  deleteDiscussion,
  addReply
};
