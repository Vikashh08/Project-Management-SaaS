const crypto = require('crypto');
const prisma = require('../utils/db');

// @desc    Create a new invitation
// @route   POST /api/invites
// @access  Private (Admin/Manager)
const createInvite = async (req, res, next) => {
  try {
    const { email, role, organizationId, teamId } = req.body;

    if (!email || !organizationId) {
      res.status(400);
      throw new Error('Email and organization ID are required');
    }

    // Verify inviter's permissions in this organization
    const inviterMember = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId: req.user.id, organizationId } }
    });

    if (!inviterMember || (inviterMember.role !== 'ORG_ADMIN' && inviterMember.role !== 'SUPER_ADMIN')) {
      res.status(403);
      throw new Error('You do not have permission to invite users to this organization');
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: { userId_organizationId: { userId: existingUser.id, organizationId } }
      });
      if (existingMember) {
        res.status(400);
        throw new Error('User is already a member of this organization');
      }
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role: role || 'VIEWER',
        token,
        organizationId,
        teamId: teamId || null,
        inviterId: req.user.id,
        expiresAt,
      }
    });

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;

    // SIMULATED EMAIL SENDING
    console.log('\n-----------------------------------------');
    console.log('✉️  SIMULATED EMAIL SENT');
    console.log(`To: ${email}`);
    console.log(`Subject: You have been invited to join a workspace on TaskFlow AI`);
    console.log(`Body: Please click the following link to accept your invitation:\n\n${inviteLink}`);
    console.log('-----------------------------------------\n');

    res.status(201).json({ message: 'Invitation sent successfully', inviteLink });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an invitation
// @route   POST /api/invites/accept/:token
// @access  Private (Requires logged-in user, but they might just created an account)
const acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find valid invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      res.status(404);
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'PENDING') {
      res.status(400);
      throw new Error('Invitation has already been used or expired');
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'EXPIRED' } });
      res.status(400);
      throw new Error('Invitation has expired');
    }

    // Must be logged in to accept, so req.user exists
    // (If not logged in, frontend should force login/signup first, then call this)

    // Add to organization
    await prisma.organizationMember.upsert({
      where: { userId_organizationId: { userId: req.user.id, organizationId: invitation.organizationId } },
      update: { role: invitation.role },
      create: {
        userId: req.user.id,
        organizationId: invitation.organizationId,
        role: invitation.role
      }
    });

    // Add to team if specified
    if (invitation.teamId) {
      await prisma.teamMember.upsert({
        where: { userId_teamId: { userId: req.user.id, teamId: invitation.teamId } },
        update: {},
        create: {
          userId: req.user.id,
          teamId: invitation.teamId
        }
      });
    }

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    res.json({ message: 'Invitation accepted successfully', organizationId: invitation.organizationId });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending invites for current user
// @route   GET /api/invites/pending
// @access  Private
const getPendingInvites = async (req, res, next) => {
  try {
    const invites = await prisma.invitation.findMany({
      where: {
        email: req.user.email,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      include: {
        organization: {
          select: { name: true }
        },
        inviter: {
          select: { name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invites);
  } catch (error) {
    next(error);
  }
};

// @desc    Decline an invitation
// @route   POST /api/invites/decline/:token
// @access  Private
const declineInvite = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    if (invitation.email !== req.user.email) {
      res.status(403);
      throw new Error('Not authorized to decline this invitation');
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'DECLINED' }
    });

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvite,
  acceptInvite,
  getPendingInvites,
  declineInvite
};
