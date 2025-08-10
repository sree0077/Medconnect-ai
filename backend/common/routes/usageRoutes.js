const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCurrentUsage,
  getUsageHistory,
  checkActionLimit,
  getUsageAnalytics,
  resetUserUsage,
  getUsageSummary,
} = require('../controllers/usageController');

// Get current user's usage statistics
router.get('/current', authenticateToken, getCurrentUsage);

// Get usage history for current user
router.get('/history', authenticateToken, getUsageHistory);

// Check if user can perform a specific action
router.get('/check/:action', authenticateToken, checkActionLimit);

// Get usage summary for dashboard widget
router.get('/summary', authenticateToken, getUsageSummary);

// Admin routes
// Get usage analytics (admin only)
router.get('/analytics', authenticateToken, getUsageAnalytics);

// Reset user usage (admin only)
router.post('/reset/:userId', authenticateToken, resetUserUsage);

module.exports = router;
