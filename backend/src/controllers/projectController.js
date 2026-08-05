const prisma = require('../utils/db');
const { logActivity } = require('../utils/activityLogger');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, projectKey, description, logo, banner, color, tags, visibility, organizationId, teamId, estimatedBudget } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Please provide project name');
    }

    let finalOrgId = organizationId;

    // Robust MVP fallback: if they use a temp ID or missing ID, find or create their personal org
    if (!finalOrgId || finalOrgId === 'temp_org_id') {
      let userMember = await prisma.organizationMember.findFirst({
        where: { userId: req.user.id },
      });
      
      if (!userMember) {
        // Auto-create a personal organization for the user
        const newOrg = await prisma.organization.create({
          data: {
            name: `${req.user.name}'s Organization`,
            ownerId: req.user.id,
            members: {
              create: {
                userId: req.user.id,
                role: 'ORG_ADMIN'
              }
            }
          }
        });
        finalOrgId = newOrg.id;
      } else {
        finalOrgId = userMember.organizationId;
      }
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        projectKey: projectKey || null,
        description,
        logo: logo || null,
        banner: banner || null,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        color,
        tags: tags || [],
        visibility: visibility || 'PRIVATE',
        ownerId: req.user.id,
        organizationId: finalOrgId,
        teamId: teamId || null
      },
    });

    // Add owner as a project member
    await prisma.projectMember.create({
      data: {
        userId: req.user.id,
        projectId: project.id,
        role: 'ORG_ADMIN'
      }
    });

    await logActivity(req.user.id, 'CREATED_PROJECT', 'PROJECT', project.id, { projectName: project.name });

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
    const { organizationId, teamId } = req.query;

    const where = {};
    if (teamId) {
      where.teamId = teamId;
    } else if (organizationId) {
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
        },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } }
        },
        tasks: {
          select: { id: true, status: true }
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
        tasks: { select: { id: true, status: true } },
        boardColumns: { orderBy: { position: 'asc' } },
        swimlanes: { orderBy: { position: 'asc' } }
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
// @desc    Update project
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const { name, projectKey, description, logo, banner, status, priority, color, tags, estimatedBudget, boardColumns, swimlanes } = req.body;

    let project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project = await prisma.project.update({
      where: { id: req.params.id },
      data: { 
        name, 
        projectKey,
        description, 
        logo,
        banner,
        status, 
        priority, 
        color, 
        tags,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null
      },
    });

    if (boardColumns && Array.isArray(boardColumns)) {
      const incomingIds = boardColumns.filter(c => c.id && !c.id.startsWith('temp-')).map(c => c.id);
      await prisma.boardColumn.deleteMany({
        where: { projectId: req.params.id, id: { notIn: incomingIds } }
      });
      for (const [index, col] of boardColumns.entries()) {
        if (!col.id || col.id.startsWith('temp-')) {
          await prisma.boardColumn.create({
            data: { name: col.name, position: index, projectId: req.params.id }
          });
        } else {
          await prisma.boardColumn.update({
            where: { id: col.id },
            data: { name: col.name, position: index }
          });
        }
      }
    }

    if (swimlanes && Array.isArray(swimlanes)) {
      const incomingSwimlaneIds = swimlanes.filter(c => c.id && !c.id.startsWith('temp-')).map(c => c.id);
      await prisma.swimlane.deleteMany({
        where: { projectId: req.params.id, id: { notIn: incomingSwimlaneIds } }
      });
      for (const [index, col] of swimlanes.entries()) {
        if (!col.id || col.id.startsWith('temp-')) {
          await prisma.swimlane.create({
            data: { name: col.name, position: index, projectId: req.params.id }
          });
        } else {
          await prisma.swimlane.update({
            where: { id: col.id },
            data: { name: col.name, position: index }
          });
        }
      }
    }

    // Refetch the updated project to return complete state
    project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        boardColumns: { orderBy: { position: 'asc' } },
        swimlanes: { orderBy: { position: 'asc' } }
      }
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

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
const addProjectMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const { id: projectId } = req.params;

    if (!userId) {
      res.status(400);
      throw new Error('User ID is required');
    }

    const member = await prisma.projectMember.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: { role: role || 'VIEWER' },
      create: { userId, projectId, role: role || 'VIEWER' },
      include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } }
    });

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
const removeProjectMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } }
    });

    res.json({ message: 'Member removed from project' });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign team to project
// @route   PUT /api/projects/:id/team
// @access  Private
const assignTeamToProject = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    const { id: projectId } = req.params;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { teamId: teamId || null },
      include: { team: true }
    });

    res.json(project);
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
  addProjectMember,
  removeProjectMember,
  assignTeamToProject,
};
