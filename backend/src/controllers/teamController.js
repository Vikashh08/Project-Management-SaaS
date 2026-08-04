const prisma = require('../utils/db');
const { getIo } = require('../../server');

// ─── Get all teams in the org ─────────────────────────────────────────────────
const getTeams = async (req, res, next) => {
  try {
    const userMember = await prisma.organizationMember.findFirst({
      where: { userId: req.user.id }
    });
    if (!userMember) return res.json([]);

    const teams = await prisma.team.findMany({
      where: { organizationId: userMember.organizationId },
      include: {
        lead: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } }
        },
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(teams);
  } catch (error) { next(error); }
};

// ─── Get single team with full stats ────────────────────────────────────────
const getTeamById = async (req, res, next) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        lead: { select: { id: true, name: true, avatarUrl: true, email: true } },
        members: {
          include: {
            user: {
              select: {
                id: true, name: true, email: true, avatarUrl: true,
                skills: true, role: true, createdAt: true
              }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        organization: { select: { id: true, name: true } }
      }
    });

    if (!team) { res.status(404); throw new Error('Team not found'); }

    // Gather stats: tasks assigned to team members in this org's projects
    const memberIds = team.members.map(m => m.userId);

    const [completedTasks, pendingTasks, recentActivity] = await Promise.all([
      prisma.taskAssignee.count({
        where: {
          userId: { in: memberIds },
          task: { status: 'DONE', project: { organizationId: team.organizationId } }
        }
      }),
      prisma.taskAssignee.count({
        where: {
          userId: { in: memberIds },
          task: { status: { not: 'DONE' }, project: { organizationId: team.organizationId } }
        }
      }),
      prisma.activityLog.findMany({
        where: { userId: { in: memberIds } },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    const total = completedTasks + pendingTasks;
    const efficiency = total > 0 ? Math.round((completedTasks / total) * 100) : 0;

    res.json({
      ...team,
      stats: { completedTasks, pendingTasks, totalTasks: total, efficiency }
    });
  } catch (error) { next(error); }
};

// ─── Create team ─────────────────────────────────────────────────────────────
const createTeam = async (req, res, next) => {
  try {
    const { name, description, color, email, leadId } = req.body;

    const userMember = await prisma.organizationMember.findFirst({
      where: { userId: req.user.id }
    });
    if (!userMember) { res.status(400); throw new Error('You must belong to an organization'); }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        email,
        leadId: leadId || null,
        organizationId: userMember.organizationId,
      }
    });

    // Auto-add creator as a member
    await prisma.teamMember.create({
      data: { userId: req.user.id, teamId: team.id, role: 'TEAM_LEAD' }
    });

    const fullTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        lead: { select: { id: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } }
      }
    });

    res.status(201).json(fullTeam);
  } catch (error) { next(error); }
};

// ─── Update team ─────────────────────────────────────────────────────────────
const updateTeam = async (req, res, next) => {
  try {
    const { name, description, color, email, leadId, status } = req.body;

    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: { name, description, color, email, leadId, status },
      include: {
        lead: { select: { id: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } }
      }
    });

    res.json(team);
  } catch (error) { next(error); }
};

// ─── Delete team ─────────────────────────────────────────────────────────────
const deleteTeam = async (req, res, next) => {
  try {
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ message: 'Team deleted' });
  } catch (error) { next(error); }
};

// ─── Add member to team ───────────────────────────────────────────────────────
const addTeamMember = async (req, res, next) => {
  try {
    const { userId, role, designation } = req.body;
    const { id: teamId } = req.params;

    const member = await prisma.teamMember.upsert({
      where: { userId_teamId: { userId, teamId } },
      create: { userId, teamId, role: role || 'DEVELOPER', designation },
      update: { role, designation },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
    });

    res.status(201).json(member);
  } catch (error) { next(error); }
};

// ─── Remove member from team ──────────────────────────────────────────────────
const removeTeamMember = async (req, res, next) => {
  try {
    const { id: teamId, userId } = req.params;

    await prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId } }
    });

    res.json({ message: 'Member removed from team' });
  } catch (error) { next(error); }
};

// ─── Get org members (for invite picker in Teams) ─────────────────────────────
const getOrganizationMembers = async (req, res) => {
  try {
    let orgId = req.query.organizationId;

    if (!orgId) {
      const userMember = await prisma.organizationMember.findFirst({
        where: { userId: req.user.id }
      });
      if (!userMember) return res.json([]);
      orgId = userMember.organizationId;
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true, status: true } }
      }
    });

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Update org member role (used by Teams.jsx) ───────────────────────────────
const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const updated = await prisma.organizationMember.update({
      where: { id: req.params.memberId },
      data: { role },
    });
    res.json(updated);
  } catch (error) { next(error); }
};

// ─── Remove org member ────────────────────────────────────────────────────────
const removeMember = async (req, res, next) => {
  try {
    await prisma.organizationMember.delete({ where: { id: req.params.memberId } });
    res.json({ message: 'Member removed' });
  } catch (error) { next(error); }
};

// ─── Get Team Messages ────────────────────────────────────────────────────────
const getTeamMessages = async (req, res, next) => {
  try {
    const { id: teamId } = req.params;
    const messages = await prisma.teamMessage.findMany({
      where: { teamId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) { next(error); }
};

// ─── Post Team Message ────────────────────────────────────────────────────────
const postTeamMessage = async (req, res, next) => {
  try {
    const { id: teamId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400);
      throw new Error('Message content is required');
    }

    const message = await prisma.teamMessage.create({
      data: {
        content,
        teamId,
        senderId: req.user.id
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    try {
      getIo().to(`team_${teamId}`).emit('NEW_TEAM_MESSAGE', message);
    } catch (e) {
      console.error('Socket error in postTeamMessage:', e);
    }

    res.status(201).json(message);
  } catch (error) { next(error); }
};

// ─── Get Team Files ───────────────────────────────────────────────────────────
const getTeamFiles = async (req, res, next) => {
  try {
    const { id: teamId } = req.params;
    const files = await prisma.attachment.findMany({
      where: { teamId },
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(files);
  } catch (error) { next(error); }
};

// ─── Delete Team File ─────────────────────────────────────────────────────────
const deleteTeamFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    await prisma.attachment.delete({ where: { id: fileId } });
    res.json({ message: 'File deleted' });
  } catch (error) { next(error); }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
  getTeamMessages,
  postTeamMessage,
  getTeamFiles,
  deleteTeamFile,
};
