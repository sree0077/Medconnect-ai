const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  getUserNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// Get user notifications
router.get('/', authenticateToken, getUserNotifications);

// Create notification (for local notifications like profile updates)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, message, type = 'info' } = req.body;
    const userId = req.user._id;

    const notification = await createNotification(userId, title, message, type);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, markAllAsRead);

// Delete notification
router.delete('/:id', authenticateToken, deleteNotification);

// Clear all notifications for current user (for testing)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await require('../models/Notification').deleteMany({ userId });
    res.json({ message: `Deleted ${result.deletedCount} notifications` });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

module.exports = router;
