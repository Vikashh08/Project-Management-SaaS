const prisma = require('../utils/db');
const { getIo } = require('../../server');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('./notificationController');

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

    const taskWithRelations = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        reporter: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    try {
      getIo().to(`project_${finalProjectId}`).emit('TASK_CREATED', taskWithRelations);
    } catch (e) {
      console.error('Socket error:', e);
    }
    
    await logActivity(req.user.id, 'CREATED_TASK', 'TASK', task.id, { taskTitle: task.title });

    res.status(201).json(taskWithRelations);
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

    const where = {
      project: {
        organization: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    };
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
      include: {
        assignees: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        reporter: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    try {
      getIo().to(`project_${task.projectId}`).emit('TASK_UPDATED', task);
    } catch (e) {
      console.error('Socket error:', e);
    }

    if (status === 'DONE') {
      await logActivity(req.user.id, 'COMPLETED_TASK', 'TASK', task.id, { taskTitle: task.title });
    } else {
      await logActivity(req.user.id, 'UPDATED_TASK', 'TASK', task.id, { taskTitle: task.title });
    }

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

    try {
      getIo().to(`project_${task.projectId}`).emit('TASK_DELETED', { id: task.id });
    } catch (e) {
      console.error('Socket error:', e);
    }

    await logActivity(req.user.id, 'DELETED_TASK', 'PROJECT', task.projectId, { taskTitle: task.title });

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};
// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400);
      throw new Error('Comment content is required');
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: req.params.id,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        task: { select: { projectId: true, reporterId: true, title: true } }
      }
    });

    try {
      getIo().to(`project_${comment.task.projectId}`).emit('TASK_UPDATED', { id: req.params.id });
    } catch (e) {
      console.error('Socket error:', e);
    }

    await logActivity(req.user.id, 'ADDED_COMMENT', 'TASK', req.params.id, { commentSnippet: content.substring(0, 50) });

    // Notify the reporter if the commenter is not the reporter
    if (comment.task.reporterId !== req.user.id) {
      await createNotification(
        comment.task.reporterId,
        'NEW_COMMENT',
        `${req.user.name} commented on your task: ${comment.task.title}`,
        `/tasks/${req.params.id}` // Frontend route to task
      );
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a subtask
// @route   POST /api/tasks/:id/subtasks
// @access  Private
const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      res.status(400);
      throw new Error('Subtask title is required');
    }

    const subtask = await prisma.subtask.create({
      data: {
        title,
        taskId: req.params.id,
      },
      include: {
        task: { select: { projectId: true } }
      }
    });

    try {
      getIo().to(`project_${subtask.task.projectId}`).emit('TASK_UPDATED', { id: req.params.id });
    } catch (e) {
      console.error('Socket error:', e);
    }

    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle subtask completion
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
// @access  Private
const toggleSubtask = async (req, res, next) => {
  try {
    const { isCompleted } = req.body;
    
    const subtask = await prisma.subtask.update({
      where: { id: req.params.subtaskId },
      data: { isCompleted },
      include: {
        task: { select: { projectId: true } }
      }
    });

    try {
      getIo().to(`project_${subtask.task.projectId}`).emit('TASK_UPDATED', { id: subtask.taskId });
    } catch (e) {
      console.error('Socket error:', e);
    }

    res.json(subtask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an attachment
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.attachmentId },
      include: {
        task: { select: { projectId: true } }
      }
    });

    if (!attachment) {
      res.status(404);
      throw new Error('Attachment not found');
    }

    // In a real app, we would also delete the file from Cloudinary/Disk here
    await prisma.attachment.delete({
      where: { id: req.params.attachmentId }
    });

    try {
      if (attachment.task && attachment.task.projectId) {
        getIo().to(`project_${attachment.task.projectId}`).emit('TASK_UPDATED', { id: attachment.taskId });
      }
    } catch (e) {
      console.error('Socket error:', e);
    }

    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    next(error);
  }
};
// @desc    Assign user to task
// @route   POST /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400);
      throw new Error('User ID is required');
    }

    const taskAssignee = await prisma.taskAssignee.create({
      data: {
        taskId: req.params.id,
        userId: userId
      },
      include: {
        task: true
      }
    });

    try {
      if (taskAssignee.task && taskAssignee.task.projectId) {
        getIo().to(`project_${taskAssignee.task.projectId}`).emit('TASK_UPDATED', { id: req.params.id });
      }
    } catch (e) {
      console.error('Socket error:', e);
    }

    res.status(201).json(taskAssignee);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400);
      return next(new Error('User is already assigned to this task'));
    }
    next(error);
  }
};

// @desc    Unassign user from task
// @route   DELETE /api/tasks/:id/assign/:userId
// @access  Private
const unassignTask = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const taskAssignee = await prisma.taskAssignee.delete({
      where: {
        userId_taskId: {
          userId: userId,
          taskId: id
        }
      },
      include: {
        task: true
      }
    });

    try {
      if (taskAssignee.task && taskAssignee.task.projectId) {
        getIo().to(`project_${taskAssignee.task.projectId}`).emit('TASK_UPDATED', { id: id });
      }
    } catch (e) {
      console.error('Socket error:', e);
    }

    res.json({ message: 'User unassigned successfully' });
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
  addComment,
  addSubtask,
  toggleSubtask,
  deleteAttachment,
  assignTask,
  unassignTask,
};
