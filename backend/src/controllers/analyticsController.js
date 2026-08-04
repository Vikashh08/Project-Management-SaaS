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

// @desc    Get burndown chart data for a project
// @route   GET /api/analytics/burndown
// @access  Private
const getBurndown = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400);
      throw new Error('projectId is required');
    }

    // Verify access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
          { team: { members: { some: { userId: req.user.id } } } }
        ]
      },
      include: {
        tasks: { select: { id: true, createdAt: true, updatedAt: true, status: true } }
      }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found or unauthorized');
    }

    // Simple Burndown calculation
    // Dates from project createdAt to now
    const startDate = new Date(project.createdAt);
    const endDate = new Date();
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const chartData = [];
    const totalTasks = project.tasks.length;

    for (let i = 0; i <= days; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      const createdUpToDay = project.tasks.filter(t => new Date(t.createdAt) <= currentDay).length;
      const completedUpToDay = project.tasks.filter(t => t.status === 'DONE' && new Date(t.updatedAt) <= currentDay).length;
      
      chartData.push({
        date: currentDay.toISOString().split('T')[0],
        remaining: createdUpToDay - completedUpToDay,
        ideal: Math.max(0, totalTasks - (totalTasks / Math.max(1, days)) * i)
      });
    }

    res.json(chartData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sprint velocity for a team
// @route   GET /api/analytics/velocity
// @access  Private
const getVelocity = async (req, res, next) => {
  try {
    const { teamId } = req.query;
    if (!teamId) {
      res.status(400);
      throw new Error('teamId is required');
    }

    const sprints = await prisma.sprint.findMany({
      where: { teamId },
      include: {
        tasks: { select: { status: true, estimatedHours: true } }
      },
      orderBy: { startDate: 'asc' },
      take: 10 // Last 10 sprints
    });

    const velocityData = sprints.map(sprint => {
      const completedTasks = sprint.tasks.filter(t => t.status === 'DONE').length;
      const totalTasks = sprint.tasks.length;
      return {
        sprintName: sprint.name,
        completedTasks,
        totalTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };
    });

    res.json(velocityData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get time tracking stats for a project
// @route   GET /api/analytics/time-tracking
// @access  Private
const getTimeTracking = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400);
      throw new Error('projectId is required');
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        timeLogs: true
      }
    });

    let totalEstimated = 0;
    let totalActual = 0;

    tasks.forEach(task => {
      totalEstimated += (task.estimatedHours || 0);
      totalActual += (task.actualHours || 0);
      
      // Add up detailed time logs if any
      task.timeLogs.forEach(log => {
        if (log.durationMinutes) {
          totalActual += (log.durationMinutes / 60);
        }
      });
    });

    res.json({
      totalEstimated: Math.round(totalEstimated * 10) / 10,
      totalActual: Math.round(totalActual * 10) / 10,
      efficiency: totalActual > 0 ? Math.round((totalEstimated / totalActual) * 100) : 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getBurndown,
  getVelocity,
  getTimeTracking
};
