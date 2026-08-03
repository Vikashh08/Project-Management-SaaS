const prisma = require('../utils/db');

// @desc    Global search for projects and tasks
// @route   GET /api/search?q=query
// @access  Private
const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.trim().length === 0) {
      return res.json({ projects: [], tasks: [] });
    }

    const searchQuery = q.trim();

    // Find projects where the user is a member/owner and name/desc matches the query
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ],
        AND: [
          {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        status: true
      },
      take: 5
    });

    // Find tasks where the user is reporter/assignee (or part of the project) and title/desc matches
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { reporterId: userId },
          { assignees: { some: { userId } } },
          { project: { ownerId: userId } },
          { project: { members: { some: { userId } } } }
        ],
        AND: [
          {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        project: { select: { id: true, name: true } }
      },
      take: 5
    });

    res.json({ projects, tasks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch
};
