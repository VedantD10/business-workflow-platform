const db = require('../database/db');
const { successResponse } = require('../utils/response');

async function getNotifications(req, res, next) {
  try {
    const notifications = db.find('notifications', n => n.user_id === req.user.id);
    notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return successResponse(res, {
      notifications,
      unread_count: unreadCount
    });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notificationId = Number(req.params.id);
    db.update('notifications', n => n.id === notificationId && n.user_id === req.user.id, { is_read: 1 });
    return successResponse(res, null, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    db.update('notifications', n => n.user_id === req.user.id, { is_read: 1 });
    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
