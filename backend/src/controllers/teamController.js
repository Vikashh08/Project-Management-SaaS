const prisma = require('../utils/db');

// @desc    Get all members of the user's current organization
// @route   GET /api/teams/organization
// @access  Private
const getOrganizationMembers = async (req, res) => {
  try {
    const { organizationId } = req.query; // Fallback to query
    const orgId = organizationId || 'org-123'; // Hardcoded for demo if missing

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
