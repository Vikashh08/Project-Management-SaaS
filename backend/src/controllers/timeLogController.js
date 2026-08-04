const prisma = require('../utils/db');

// @desc    Start a time log (timer)
// @route   POST /api/tasks/:taskId/timelogs/start
// @access  Private
const startTimer = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Check if there's already a running timer for this user on any task
    const running = await prisma.timeLog.findFirst({
      where: { userId, endTime: null }
    });

    if (running) {
      res.status(400);
      throw new Error('You already have a running timer. Stop it first.');
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        userId,
        taskId,
        startTime: new Date(),
      },
      include: {
        task: { select: { id: true, title: true } }
      }
    });

    res.status(201).json(timeLog);
  } catch (error) {
    next(error);
  }
};

// @desc    Stop the running timer
// @route   PUT /api/tasks/:taskId/timelogs/stop
// @access  Private
const stopTimer = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;

    // Find any running timer for this user (optionally filtered by taskId)
    const whereClause = { userId, endTime: null };
    if (taskId) whereClause.taskId = taskId;

    const running = await prisma.timeLog.findFirst({
      where: whereClause
    });

    if (!running) {
      res.status(404);
      throw new Error('No running timer found.');
    }

    const endTime = new Date();
    const durationMinutes = Math.max(1, Math.round((endTime - new Date(running.startTime)) / 60000));

    const timeLog = await prisma.timeLog.update({
      where: { id: running.id },
      data: {
        endTime,
        durationMinutes,
        description: req.body?.description || null,
      },
      include: {
        task: { select: { id: true, title: true } }
      }
    });

    res.json(timeLog);
  } catch (error) {
    next(error);
  }
};

// @desc    Get time logs for a task
// @route   GET /api/tasks/:taskId/timelogs
// @access  Private
const getTaskTimeLogs = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const logs = await prisma.timeLog.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get running timer for the current user
// @route   GET /api/timelogs/active
// @access  Private
const getActiveTimer = async (req, res, next) => {
  try {
    const timer = await prisma.timeLog.findFirst({
      where: { userId: req.user.id, endTime: null },
      include: {
        task: { select: { id: true, title: true, projectId: true } }
      }
    });

    res.json(timer); // null if no active timer
  } catch (error) {
    next(error);
  }
};

// @desc    Log time manually
// @route   POST /api/tasks/:taskId/timelogs
// @access  Private
const logTimeManually = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { durationMinutes, description, date } = req.body;

    if (!durationMinutes || durationMinutes <= 0) {
      res.status(400);
      throw new Error('Duration must be a positive number.');
    }

    const startTime = date ? new Date(date) : new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: req.user.id,
        taskId,
        startTime,
        endTime,
        durationMinutes: Math.round(durationMinutes),
        description: description || null,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        task: { select: { id: true, title: true } }
      }
    });

    res.status(201).json(timeLog);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a time log
// @route   DELETE /api/timelogs/:id
// @access  Private
const deleteTimeLog = async (req, res, next) => {
  try {
    const log = await prisma.timeLog.findUnique({ where: { id: req.params.id } });
    if (!log) {
      res.status(404);
      throw new Error('Time log not found');
    }
    if (log.userId !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to delete this time log');
    }

    await prisma.timeLog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Time log deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all time logs for the current user (timesheet)
// @route   GET /api/timelogs/my
// @access  Private
const getMyTimeLogs = async (req, res, next) => {
  try {
    const logs = await prisma.timeLog.findMany({
      where: { userId: req.user.id },
      include: {
        task: { select: { id: true, title: true, projectId: true, project: { select: { name: true } } } }
      },
      orderBy: { startTime: 'desc' },
      take: 100
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startTimer,
  stopTimer,
  getTaskTimeLogs,
  getActiveTimer,
  logTimeManually,
  deleteTimeLog,
  getMyTimeLogs,
};
