const prisma = require('../utils/db');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, color, tags, visibility, organizationId } = req.body;

    // Validate required fields
    if (!name || !organizationId) {
      res.status(400);
      throw new Error('Please provide project name and organization ID');
    }

    // Optional: check if user belongs to this org (omitted for brevity, assume valid for now)
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        tags: tags || [],
        visibility: visibility || 'PRIVATE',
        ownerId: req.user.id,
        organizationId,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for an organization (or user)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { organizationId } = req.query;

    const where = {};
    if (organizationId) {
      where.organizationId = organizationId;
    } else {
      // If no org specified, fetch projects where user is owner or member
      where.OR = [
        { ownerId: req.user.id },
        { members: { some: { userId: req.user.id } } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        tasks: { select: { id: true, status: true } }
      }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, color, tags } = req.body;

    let project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, status, priority, color, tags },
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
