const prisma = require('../utils/db');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all analytics data in parallel for maximum performance
    const [
      projectsCount,
      activeProjects,
      tasksCount,
      completedTasks,
      pendingTasks,
      allTasks
    ] = await Promise.all([
      prisma.project.count({
        where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] }
      }),
      prisma.project.count({
        where: {
          status: 'ACTIVE',
          OR: [{ ownerId: userId }, { members: { some: { userId } } }]
        }
      }),
      prisma.task.count({
        where: { assignees: { some: { userId } } }
      }),
      prisma.task.count({
        where: { status: 'DONE', assignees: { some: { userId } } }
      }),
      prisma.task.count({
        where: { status: { not: 'DONE' }, assignees: { some: { userId } } }
      }),
      prisma.task.findMany({
        where: {
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }]
          }
        },
        select: { status: true }
      })
    ]);

    const statusDistribution = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0
    };

    allTasks.forEach(task => {
      if (statusDistribution[task.status] !== undefined) {
        statusDistribution[task.status]++;
      }
    });

    // --- NEW: Team Workload ---
    // Get all users in the projects and count their assigned tasks
    const allTaskAssignees = await prisma.taskAssignee.findMany({
      where: {
        task: {
          status: { not: 'DONE' },
          project: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } }
            ]
          }
        }
      },
      include: { user: { select: { name: true } } }
    });

    const workloadMap = {};
    allTaskAssignees.forEach(assignee => {
      const name = assignee.user.name;
      workloadMap[name] = (workloadMap[name] || 0) + 1;
    });

    const teamWorkload = Object.keys(workloadMap).map(name => ({
      name,
      count: workloadMap[name]
    })).sort((a, b) => b.count - a.count); // sort descending

    res.json({
      totalProjects: projectsCount,
      activeProjects,
      totalTasks: tasksCount,
      completedTasks,
      pendingTasks,
      completionRate: tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0,
      statusDistribution,
      teamWorkload
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
