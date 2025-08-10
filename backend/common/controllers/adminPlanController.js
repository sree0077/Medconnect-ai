const User = require('../models/User');
const Subscription = require('../models/Subscription');
const UsageTracking = require('../models/UsageTracking');

/**
 * Get all users with their subscription information
 */
const getUsersWithSubscriptions = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 50, search, tier } = req.query;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tier && tier !== 'all') {
      query['subscription.tier'] = tier;
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('name email role subscription createdAt status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error getting users with subscriptions:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

/**
 * Manually change a user's subscription plan
 */
const changeUserPlan = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId, newTier, reason } = req.body;

    if (!userId || !newTier || !reason) {
      return res.status(400).json({ error: 'User ID, new tier, and reason are required' });
    }

    if (!['free', 'pro', 'clinic'].includes(newTier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldTier = user.subscription?.tier || 'free';
    
    if (oldTier === newTier) {
      return res.status(400).json({ error: 'User is already on this plan' });
    }

    // Update user subscription
    const subscriptionUpdate = {
      'subscription.tier': newTier,
      'subscription.status': 'active',
      'subscription.lastModifiedBy': req.user._id,
      'subscription.lastModifiedAt': new Date(),
      'subscription.lastModificationReason': reason,
    };

    // Set dates based on tier
    if (newTier === 'free') {
      subscriptionUpdate['subscription.endDate'] = null;
      subscriptionUpdate['subscription.nextPaymentDate'] = null;
    } else {
      // For manual upgrades, set a far future date to indicate manual override
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 10);
      subscriptionUpdate['subscription.endDate'] = farFuture;
      subscriptionUpdate['subscription.nextPaymentDate'] = null; // No payment required for manual upgrades
      subscriptionUpdate['subscription.manualOverride'] = true;
    }

    await User.findByIdAndUpdate(userId, subscriptionUpdate);

    // Update or create detailed subscription record
    await Subscription.findOneAndUpdate(
      { userId },
      {
        tier: newTier,
        status: 'active',
        manualOverride: newTier !== 'free',
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date(),
        $push: {
          history: {
            action: 'manual_change',
            fromTier: oldTier,
            toTier: newTier,
            changedBy: req.user.name || req.user.email,
            changedById: req.user._id,
            reason: reason,
            timestamp: new Date(),
            type: 'manual'
          }
        }
      },
      { upsert: true }
    );

    // Create audit log entry
    await createPlanChangeLog({
      userId,
      userName: user.name,
      userEmail: user.email,
      fromTier: oldTier,
      toTier: newTier,
      changedBy: req.user.name || req.user.email,
      changedById: req.user._id,
      reason,
      type: 'manual'
    });

    // Reset usage tracking for the user if upgrading to unlimited plan
    if (newTier === 'pro' || newTier === 'clinic') {
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      await UsageTracking.findOneAndUpdate(
        { userId, period: 'monthly', dateKey: monthKey },
        {
          subscriptionTier: newTier,
          limitsInEffect: {
            aiMessages: -1, // Unlimited
            appointmentsPerMonth: newTier === 'pro' ? 10 : -1
          }
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: `Successfully changed ${user.name}'s plan from ${oldTier} to ${newTier}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        oldTier,
        newTier
      }
    });
  } catch (error) {
    console.error('Error changing user plan:', error);
    res.status(500).json({ error: 'Failed to change user plan' });
  }
};

/**
 * Get plan change audit logs
 */
const getPlanChangeLogs = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 50, userId, type } = req.query;
    
    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'userId',
          foreignField: 'userId',
          as: 'subscription'
        }
      },
      {
        $unwind: '$subscription'
      },
      {
        $unwind: '$subscription.history'
      },
      {
        $match: {
          ...(userId && { userId: userId }),
          ...(type && { 'subscription.history.type': type })
        }
      },
      {
        $project: {
          _id: '$subscription.history._id',
          userId: 1,
          userName: 1,
          userEmail: 1,
          fromTier: '$subscription.history.fromTier',
          toTier: '$subscription.history.toTier',
          changedBy: '$subscription.history.changedBy',
          changedById: '$subscription.history.changedById',
          reason: '$subscription.history.reason',
          timestamp: '$subscription.history.timestamp',
          type: '$subscription.history.type'
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: parseInt(limit)
      }
    ];

    // Create a temporary collection for plan change logs if it doesn't exist
    const PlanChangeLog = require('../models/PlanChangeLog');
    const logs = await PlanChangeLog.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await PlanChangeLog.countDocuments();

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error getting plan change logs:', error);
    res.status(500).json({ error: 'Failed to get plan change logs' });
  }
};

/**
 * Get subscription statistics for admin dashboard
 */
const getSubscriptionStats = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get user counts by tier
    const tierStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.tier',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ['$subscription.status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get recent plan changes
    const PlanChangeLog = require('../models/PlanChangeLog');
    const recentChanges = await PlanChangeLog.find()
      .sort({ timestamp: -1 })
      .limit(10);

    // Get manual overrides count
    const manualOverrides = await User.countDocuments({
      'subscription.manualOverride': true
    });

    res.json({
      tierDistribution: tierStats,
      recentChanges,
      manualOverrides,
      totalUsers: tierStats.reduce((sum, tier) => sum + tier.count, 0)
    });
  } catch (error) {
    console.error('Error getting subscription stats:', error);
    res.status(500).json({ error: 'Failed to get subscription statistics' });
  }
};

/**
 * Helper function to create plan change log entry
 */
async function createPlanChangeLog(logData) {
  try {
    const PlanChangeLog = require('../models/PlanChangeLog');
    
    const logEntry = new PlanChangeLog({
      userId: logData.userId,
      userName: logData.userName,
      userEmail: logData.userEmail,
      fromTier: logData.fromTier,
      toTier: logData.toTier,
      changedBy: logData.changedBy,
      changedById: logData.changedById,
      reason: logData.reason,
      type: logData.type,
      timestamp: new Date()
    });

    await logEntry.save();
    console.log(`Plan change logged: ${logData.userName} (${logData.fromTier} → ${logData.toTier}) by ${logData.changedBy}`);
  } catch (error) {
    console.error('Error creating plan change log:', error);
  }
}

/**
 * Bulk plan changes (for promotional campaigns, etc.)
 */
const bulkChangePlans = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userIds, newTier, reason } = req.body;

    if (!userIds || !Array.isArray(userIds) || !newTier || !reason) {
      return res.status(400).json({ error: 'User IDs array, new tier, and reason are required' });
    }

    if (!['free', 'pro', 'clinic'].includes(newTier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const results = [];
    
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          results.push({ userId, success: false, error: 'User not found' });
          continue;
        }

        const oldTier = user.subscription?.tier || 'free';
        
        if (oldTier === newTier) {
          results.push({ userId, success: false, error: 'Already on this plan' });
          continue;
        }

        // Update user subscription (same logic as single user change)
        const subscriptionUpdate = {
          'subscription.tier': newTier,
          'subscription.status': 'active',
          'subscription.lastModifiedBy': req.user._id,
          'subscription.lastModifiedAt': new Date(),
          'subscription.lastModificationReason': reason,
        };

        if (newTier !== 'free') {
          const farFuture = new Date();
          farFuture.setFullYear(farFuture.getFullYear() + 10);
          subscriptionUpdate['subscription.endDate'] = farFuture;
          subscriptionUpdate['subscription.manualOverride'] = true;
        }

        await User.findByIdAndUpdate(userId, subscriptionUpdate);

        // Create audit log
        await createPlanChangeLog({
          userId,
          userName: user.name,
          userEmail: user.email,
          fromTier: oldTier,
          toTier: newTier,
          changedBy: req.user.name || req.user.email,
          changedById: req.user._id,
          reason: `Bulk change: ${reason}`,
          type: 'manual'
        });

        results.push({ 
          userId, 
          success: true, 
          userName: user.name,
          change: `${oldTier} → ${newTier}` 
        });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk plan change completed: ${successCount} successful, ${failCount} failed`,
      results,
      summary: { successCount, failCount, total: userIds.length }
    });
  } catch (error) {
    console.error('Error in bulk plan change:', error);
    res.status(500).json({ error: 'Failed to perform bulk plan change' });
  }
};

module.exports = {
  getUsersWithSubscriptions,
  changeUserPlan,
  getPlanChangeLogs,
  getSubscriptionStats,
  bulkChangePlans,
};
