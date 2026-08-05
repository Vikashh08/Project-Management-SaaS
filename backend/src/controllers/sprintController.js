const prisma = require('../utils/db');

// ─── Get Team Sprints ────────────────────────────────────────────────────────
const getTeamSprints = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const sprints = await prisma.sprint.findMany({
      where: { teamId },
      include: {
        tasks: {
          select: {
            id: true, title: true, status: true, priority: true,
            assignees: { include: { user: { select: { name: true, avatarUrl: true } } } }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });
    res.json(sprints);
  } catch (error) { next(error); }
};

// ─── Create Sprint ────────────────────────────────────────────────────────────
const createSprint = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { name, startDate, endDate, status, goal, capacity } = req.body;

    const sprint = await prisma.sprint.create({
      data: {
        teamId,
        name,
        goal: goal || null,
        capacity: capacity ? parseFloat(capacity) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'PLANNED'
      },
      include: { tasks: true }
    });

    res.status(201).json(sprint);
  } catch (error) { next(error); }
};

// ─── Update Sprint ────────────────────────────────────────────────────────────
const updateSprint = async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    const { name, startDate, endDate, status, goal, capacity } = req.body;

    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        name,
        goal,
        capacity: capacity ? parseFloat(capacity) : null,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status
      },
      include: { tasks: true }
    });

    res.json(sprint);
  } catch (error) { next(error); }
};

// ─── Delete Sprint ────────────────────────────────────────────────────────────
const deleteSprint = async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    await prisma.sprint.delete({ where: { id: sprintId } });
    res.json({ message: 'Sprint deleted' });
  } catch (error) { next(error); }
};

// ─── Add Task to Sprint ───────────────────────────────────────────────────────
const addTaskToSprint = async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    const { taskId } = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { sprintId }
    });

    res.json(task);
  } catch (error) { next(error); }
};

// ─── Remove Task from Sprint ──────────────────────────────────────────────────
const removeTaskFromSprint = async (req, res, next) => {
  try {
    const { sprintId, taskId } = req.params;
    
    // Ensure task actually belongs to this sprint
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.sprintId !== sprintId) {
      res.status(404);
      throw new Error('Task not found in this sprint');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { sprintId: null }
    });

    res.json(updatedTask);
  } catch (error) { next(error); }
};

module.exports = {
  getTeamSprints,
  createSprint,
  updateSprint,
  deleteSprint,
  addTaskToSprint,
  removeTaskFromSprint
};
