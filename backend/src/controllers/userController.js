const prisma = require('../utils/db');
const bcrypt = require('bcrypt');
// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
const getUserActivity = async (req, res, next) => {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user metrics
// @route   GET /api/users/metrics
// @access  Private
const getUserMetrics = async (req, res, next) => {
  try {
    const totalCompleted = await prisma.taskAssignee.count({
      where: {
        userId: req.user.id,
        task: { status: 'DONE' }
      }
    });

    const activeTasks = await prisma.taskAssignee.count({
      where: {
        userId: req.user.id,
        task: { status: { not: 'DONE' } }
      }
    });

    // Score could be tasks completed in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCompleted = await prisma.taskAssignee.count({
      where: {
        userId: req.user.id,
        task: { 
          status: 'DONE',
          updatedAt: { gte: sevenDaysAgo }
        }
      }
    });

    const productivityScore = recentCompleted * 10; // arbitrary logic

    res.json({
      totalCompleted,
      activeTasks,
      productivityScore
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, experience, avatarUrl, github, linkedin, website } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        bio: bio !== undefined ? bio : undefined,
        skills: skills !== undefined ? skills : undefined,
        experience: experience !== undefined ? experience : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        github: github !== undefined ? github : undefined,
        linkedin: linkedin !== undefined ? linkedin : undefined,
        website: website !== undefined ? website : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skills: true,
        experience: true,
        avatarUrl: true,
        github: true,
        linkedin: true,
        website: true,
        role: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401);
      throw new Error('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserActivity,
  getUserMetrics,
  updateProfile,
  changePassword,
};
