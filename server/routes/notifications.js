const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationCount
} = require('../controllers/notificationController');

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', getNotifications);
router.get('/count', getNotificationCount);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

module.exports = router; 