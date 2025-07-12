const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');

// Get user notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    // Build filter
    const filter = { user: req.user.id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / take);
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, message: 'Notification marked as read.', data: { notification } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  // Placeholder: mark all notifications as read
  markAllAsRead: async (req, res, next) => {
    try {
      await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  },
  // Placeholder: delete a single notification
  deleteNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await Notification.deleteOne({ _id: id, user: req.user.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      res.json({ success: true, message: 'Notification deleted.' });
    } catch (error) {
      next(error);
    }
  },
  // Placeholder: delete all notifications for the user
  deleteAllNotifications: async (req, res, next) => {
    try {
      await Notification.deleteMany({ user: req.user.id });
      res.json({ success: true, message: 'All notifications deleted.' });
    } catch (error) {
      next(error);
    }
  },
  // Placeholder: get notification count for the user
  getNotificationCount: async (req, res, next) => {
    try {
      const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
}; 