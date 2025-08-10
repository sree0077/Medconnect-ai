const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCurrentSubscription,
  getSubscriptionPlans,
  updateSubscription,
  updateSubscriptionTier,
  cancelSubscription,
  getSubscriptionAnalytics,
} = require('../controllers/subscriptionController');

// Get available subscription plans (public endpoint)
router.get('/plans', getSubscriptionPlans);

// Get current user's subscription details
router.get('/current', authenticateToken, getCurrentSubscription);

// Update subscription (upgrade/downgrade)
router.post('/update', authenticateToken, updateSubscriptionTier);

// Cancel subscription
router.post('/cancel', authenticateToken, cancelSubscription);

// Get subscription analytics (admin only)
router.get('/analytics', authenticateToken, getSubscriptionAnalytics);

module.exports = router;
