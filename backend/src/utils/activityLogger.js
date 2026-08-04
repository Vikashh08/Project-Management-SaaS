const prisma = require('./db');

/**
 * Logs a user activity
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action string (e.g., CREATED_TASK, COMPLETED_TASK, ADDED_COMMENT)
 * @param {string} entityType - Entity type (e.g., TASK, PROJECT, USER, ORGANIZATION)
 * @param {string} entityId - ID of the entity
 * @param {object} details - Optional object with additional details
 */
const logActivity = async (userId, action, entityType, entityId, details = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = {
  logActivity
};
