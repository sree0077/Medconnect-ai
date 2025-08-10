const User = require('../models/User');
const Subscription = require('../models/Subscription');
const UsageTracking = require('../models/UsageTracking');
const { createSubscription, cancelSubscription: cancelStripeSubscription } = require('../services/paymentService');

/**
 * Get current user's subscription details
 */
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with subscription details
    const user = await User.findById(userId).select('subscription billingHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get detailed subscription from Subscription model if it exists
    let detailedSubscription = await Subscription.findOne({ userId });
    
    // If no detailed subscription exists, create one from user data
    if (!detailedSubscription && user.subscription) {
      detailedSubscription = new Subscription({
        userId,
        tier: user.subscription.tier || 'free',
        status: user.subscription.status || 'active',
        startDate: user.subscription.startDate || new Date(),
        stripeCustomerId: user.subscription.stripeCustomerId || '',
        stripeSubscriptionId: user.subscription.stripeSubscriptionId || '',
      });
      await detailedSubscription.save();
    }
    
    // Get current usage
    const monthlyUsage = await UsageTracking.getOrCreateUsageRecord(userId, 'monthly');
    
    res.json({
      subscription: detailedSubscription || user.subscription,
      usage: {
        current: monthlyUsage.usage,
        limits: monthlyUsage.limitsInEffect,
        remaining: monthlyUsage.remainingUsage,
        percentage: monthlyUsage.usagePercentage,
        hasExceededLimits: monthlyUsage.hasExceededLimits,
      },
      billingHistory: user.billingHistory || [],
    });
  } catch (error) {
    console.error('Error getting current subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
};

/**
 * Get available subscription plans
 */
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          'Basic symptom checker',
          'Limited consultations (3/month)',
          'Health records storage',
        ],
        limits: {
          aiMessages: 3,
          appointmentsPerMonth: 1,
        },
        popular: false,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 19,
        currency: 'USD',
        interval: 'month',
        features: [
          'Advanced symptom checker',
          'Unlimited consultations',
          'Health records storage',
          'Digital prescriptions',
          'Priority support',
          'Family accounts (up to 4)',
        ],
        limits: {
          aiMessages: -1, // unlimited
          appointmentsPerMonth: 10,
        },
        popular: true,
      },
      {
        id: 'clinic',
        name: 'Clinic',
        price: 99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Provider dashboard',
          'Patient management',
          'Electronic health records',
          'Prescription management',
          'Analytics & reporting',
          'API access',
          'Unlimited everything',
        ],
        limits: {
          aiMessages: -1, // unlimited
          appointmentsPerMonth: -1, // unlimited
        },
        popular: false,
      },
    ];
    
    res.json({ plans });
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
};

/**
 * Upgrade/downgrade subscription
 */
const updateSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tier, paymentMethodId } = req.body;
    
    if (!['free', 'pro', 'clinic'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }
    
    // Get current user and subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentTier = user.subscription?.tier || 'free';
    
    // If downgrading to free or same tier, handle immediately
    if (tier === 'free' || tier === currentTier) {
      await updateUserSubscription(userId, tier, currentTier);
      return res.json({ 
        success: true, 
        message: `Subscription ${tier === currentTier ? 'unchanged' : 'updated to ' + tier}`,
        subscription: await Subscription.findOne({ userId })
      });
    }
    
    // For upgrades to paid tiers, integrate with payment service
    if (tier === 'pro' || tier === 'clinic') {
      try {
        // Get the appropriate price ID for the tier
        const priceId = tier === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_CLINIC_PRICE_ID;

        if (!priceId) {
          // Fallback to simulation if Stripe not configured
          await updateUserSubscription(userId, tier, currentTier);
          return res.json({
            success: true,
            message: `Successfully upgraded to ${tier} plan (simulated)`,
            subscription: await Subscription.findOne({ userId }),
            simulated: true
          });
        }

        // Create subscription through payment service
        const subscriptionResult = await createSubscription(userId, priceId, paymentMethodId);

        return res.json({
          success: true,
          message: `Successfully upgraded to ${tier} plan`,
          subscription: await Subscription.findOne({ userId }),
          clientSecret: subscriptionResult.clientSecret,
          requiresPayment: subscriptionResult.status === 'incomplete'
        });
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        return res.status(400).json({
          error: 'Payment processing failed',
          message: paymentError.message || 'Unable to process payment'
        });
      }
    }
    
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentTier = user.subscription?.tier || 'free';
    
    if (currentTier === 'free') {
      return res.status(400).json({ error: 'Cannot cancel free subscription' });
    }
    
    // Cancel subscription through payment service
    try {
      await cancelStripeSubscription(userId, reason || 'User requested cancellation');

      res.json({
        success: true,
        message: 'Subscription cancelled successfully. You will retain access until the end of your billing period.',
      });
    } catch (cancellationError) {
      console.error('Subscription cancellation error:', cancellationError);
      res.status(500).json({
        error: 'Failed to cancel subscription',
        message: cancellationError.message || 'Unable to cancel subscription'
      });
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

/**
 * Get subscription usage analytics for admin
 */
const getSubscriptionAnalytics = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { period = 'monthly' } = req.query;
    
    // Get subscription distribution
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.tier',
          count: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $eq: ['$subscription.status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    // Get usage statistics
    const usageStats = await UsageTracking.aggregate([
      { $match: { period } },
      {
        $group: {
          _id: '$subscriptionTier',
          totalUsers: { $sum: 1 },
          avgAIMessages: { $avg: '$usage.totalAIMessages' },
          totalAIMessages: { $sum: '$usage.totalAIMessages' },
          avgAppointments: { $avg: '$usage.appointmentsBooked' },
          totalAppointments: { $sum: '$usage.appointmentsBooked' },
        }
      }
    ]);
    
    // Calculate revenue (simplified)
    const revenueStats = await User.aggregate([
      {
        $match: {
          'subscription.tier': { $in: ['pro', 'clinic'] },
          'subscription.status': 'active'
        }
      },
      {
        $group: {
          _id: '$subscription.tier',
          count: { $sum: 1 },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$subscription.tier', 'pro'] }, 19,
                { $cond: [{ $eq: ['$subscription.tier', 'clinic'] }, 99, 0] }
              ]
            }
          }
        }
      }
    ]);
    
    res.json({
      subscriptionDistribution: subscriptionStats,
      usageStatistics: usageStats,
      revenueStatistics: revenueStats,
      summary: {
        totalUsers: subscriptionStats.reduce((sum, stat) => sum + stat.count, 0),
        totalRevenue: revenueStats.reduce((sum, stat) => sum + stat.monthlyRevenue, 0),
        period,
      }
    });
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    res.status(500).json({ error: 'Failed to get subscription analytics' });
  }
};

/**
 * Helper function to update user subscription
 */
async function updateUserSubscription(userId, newTier, oldTier) {
  const now = new Date();
  
  // Update user subscription
  const subscriptionUpdate = {
    'subscription.tier': newTier,
    'subscription.status': 'active',
  };
  
  if (newTier === 'free') {
    subscriptionUpdate['subscription.endDate'] = null;
    subscriptionUpdate['subscription.nextPaymentDate'] = null;
  } else {
    // Set next payment date to next month
    const nextPayment = new Date(now);
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    subscriptionUpdate['subscription.nextPaymentDate'] = nextPayment;
  }
  
  await User.findByIdAndUpdate(userId, subscriptionUpdate);
  
  // Update or create detailed subscription record
  await Subscription.findOneAndUpdate(
    { userId },
    {
      tier: newTier,
      status: 'active',
      $push: {
        history: {
          action: oldTier === newTier ? 'reactivated' : (newTier === 'free' ? 'downgraded' : 'upgraded'),
          fromTier: oldTier,
          toTier: newTier,
        }
      }
    },
    { upsert: true }
  );
}

/**
 * Simple subscription update for checkout flow
 */
const updateSubscriptionTier = async (req, res) => {
  try {
    const { tier } = req.body;
    const userId = req.user._id;

    if (!tier || !['free', 'pro', 'clinic'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Update user subscription
    const subscriptionUpdate = {
      'subscription.tier': tier,
      'subscription.status': 'active',
      'subscription.lastModifiedAt': new Date(),
    };

    // Set dates based on tier
    if (tier === 'free') {
      subscriptionUpdate['subscription.endDate'] = null;
      subscriptionUpdate['subscription.nextPaymentDate'] = null;
    } else {
      // For paid plans, set next payment date to 30 days from now
      const nextPayment = new Date();
      nextPayment.setDate(nextPayment.getDate() + 30);
      subscriptionUpdate['subscription.nextPaymentDate'] = nextPayment;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      subscriptionUpdate['subscription.endDate'] = endDate;
    }

    await User.findByIdAndUpdate(userId, subscriptionUpdate);

    // Update or create detailed subscription record
    await Subscription.findOneAndUpdate(
      { userId },
      {
        tier,
        status: 'active',
        lastModifiedAt: new Date(),
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: `Successfully updated subscription to ${tier} plan`,
      tier
    });
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

module.exports = {
  getCurrentSubscription,
  getSubscriptionPlans,
  updateSubscription,
  updateSubscriptionTier,
  cancelSubscription,
  getSubscriptionAnalytics,
};
