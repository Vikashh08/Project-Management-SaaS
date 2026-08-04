const prisma = require('../utils/db');
const { getIo } = require('../utils/socket');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear
// @access  Private
const clearNotifications = async (req, res, next) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id, isRead: true },
    });
    res.json({ message: 'Cleared read notifications' });
  } catch (error) {
    next(error);
  }
};

// @desc    Helper: Create and dispatch a notification
const createNotification = async (userId, type, content, link, shouldEmail = false) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        content,
        link,
      },
    });

    // Real-time socket event
    const io = getIo();
    io.to(userId).emit('new_notification', notification);

    // Optional email fallback
    if (shouldEmail) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await sendEmail({
          email: user.email,
          subject: `TaskFlow AI: New ${type.replace('_', ' ')}`,
          message: `${content}\nView details: ${link || 'Login to see more'}`,
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  createNotification,
};
