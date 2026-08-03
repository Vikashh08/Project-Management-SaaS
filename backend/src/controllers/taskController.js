const prisma = require('../utils/db');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, projectId, estimatedHours } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Please provide a task title');
    }

    let finalProjectId = projectId;

    if (!finalProjectId || finalProjectId === 'temp_project_id') {
      let userProject = await prisma.project.findFirst({
        where: { ownerId: req.user.id }
      });
      
      if (!userProject) {
         // Create a default org and project if none exists
         let orgMember = await prisma.organizationMember.findFirst({ where: { userId: req.user.id } });
         let orgId = orgMember ? orgMember.organizationId : null;
         
         if (!orgId) {
            const newOrg = await prisma.organization.create({
              data: { name: `${req.user.name}'s Organization`, ownerId: req.user.id, members: { create: { userId: req.user.id, role: 'ORG_ADMIN' } } }
            });
            orgId = newOrg.id;
         }
         
         const newProject = await prisma.project.create({
           data: { name: 'Default Project', ownerId: req.user.id, organizationId: orgId }
         });
         finalProjectId = newProject.id;
      } else {
         finalProjectId = userProject.id;
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours,
        reporterId: req.user.id,
        projectId: finalProjectId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks?projectId=xxx
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    const where = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        reporter: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        reporter: { select: { id: true, name: true, avatarUrl: true } },
        subtasks: true,
        comments: { include: { author: { select: { id: true, name: true, avatarUrl: true } } } },
        attachments: true,
      }
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, estimatedHours, actualHours } = req.body;

    let task = await prisma.task.findUnique({
      where: { id: req.params.id }
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    task = await prisma.task.update({
      where: { id: req.params.id },
      data: { 
        title, 
        description, 
        priority, 
        status, 
        dueDate: dueDate ? new Date(dueDate) : undefined, 
        estimatedHours, 
        actualHours 
      },
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id }
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
