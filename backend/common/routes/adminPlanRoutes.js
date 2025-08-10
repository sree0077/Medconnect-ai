const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const allowRoles = require('../middleware/role');
const {
  getUsersWithSubscriptions,
  changeUserPlan,
  getPlanChangeLogs,
  getSubscriptionStats,
  bulkChangePlans,
} = require('../controllers/adminPlanController');

// All routes require admin authentication
router.use(authenticateToken);
router.use(allowRoles('admin'));

// Get all users with subscription information
router.get('/users-with-subscriptions', getUsersWithSubscriptions);

// Manually change a user's subscription plan
router.post('/change-user-plan', changeUserPlan);

// Get plan change audit logs
router.get('/plan-change-logs', getPlanChangeLogs);

// Get subscription statistics for admin dashboard
router.get('/subscription-stats', getSubscriptionStats);

// Bulk plan changes (for promotional campaigns, etc.)
router.post('/bulk-change-plans', bulkChangePlans);

module.exports = router;
