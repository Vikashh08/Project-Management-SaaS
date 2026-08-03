const prisma = require('../utils/db');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // We can fetch data based on organizations, but for simplicity we fetch stats related to the user's projects/tasks
    const projectsCount = await prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    const activeProjects = await prisma.project.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    });

    const tasksCount = await prisma.task.count({
      where: {
        assignees: { some: { userId } }
      }
    });

    const completedTasks = await prisma.task.count({
      where: {
        status: 'DONE',
        assignees: { some: { userId } }
      }
    });

    const pendingTasks = await prisma.task.count({
      where: {
        status: { not: 'DONE' },
        assignees: { some: { userId } }
      }
    });

    res.json({
      totalProjects: projectsCount,
      activeProjects,
      totalTasks: tasksCount,
      completedTasks,
      pendingTasks,
      completionRate: tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
