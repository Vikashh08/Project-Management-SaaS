const prisma = require('../utils/db');

// @desc    Get all members of the user's current organization
// @route   GET /api/teams/organization
// @access  Private
const getOrganizationMembers = async (req, res) => {
  try {
    let orgId = req.query.organizationId;
    
    if (!orgId) {
      const userMember = await prisma.organizationMember.findFirst({
        where: { userId: req.user.id }
      });
      if (!userMember) {
        return res.json([]);
      }
      orgId = userMember.organizationId;
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, role: true, status: true }
        }
      }
    });

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a member's role
// @route   PUT /api/teams/members/:memberId/role
// @access  Private (Admin)
const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { memberId } = req.params;

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a member from the organization
// @route   DELETE /api/teams/members/:memberId
// @access  Private (Admin)
const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    res.json({ message: 'Member removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
};
