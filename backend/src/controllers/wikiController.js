const prisma = require('../utils/db');

// @desc    Get all wiki pages for a project
// @route   GET /api/projects/:projectId/wiki
// @access  Private
const getWikiPages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const pages = await prisma.wikiPage.findMany({
      where: { projectId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pages);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a wiki page
// @route   POST /api/projects/:projectId/wiki
// @access  Private
const createWikiPage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, content } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Wiki title is required');
    }

    const page = await prisma.wikiPage.create({
      data: {
        title,
        content: content || '',
        projectId,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a wiki page
// @route   PUT /api/wiki/:id
// @access  Private
const updateWikiPage = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const page = await prisma.wikiPage.update({
      where: { id: req.params.id },
      data: { title, content },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
    res.json(page);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a wiki page
// @route   DELETE /api/wiki/:id
// @access  Private
const deleteWikiPage = async (req, res, next) => {
  try {
    await prisma.wikiPage.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Wiki page deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWikiPages,
  createWikiPage,
  updateWikiPage,
  deleteWikiPage
};
