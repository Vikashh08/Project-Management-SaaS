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
        return res.json([]); // User has no organization yet
      }
      orgId = userMember.organizationId;
    }

    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId: orgId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            status: true,
          }
        }
      }
    });

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOrganizationMembers
};
