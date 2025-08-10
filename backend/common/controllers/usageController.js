const UsageTracking = require('../models/UsageTracking');
const User = require('../models/User');

/**
 * Get current user's usage statistics
 */
const getCurrentUsage = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get monthly and daily usage records
    const monthlyUsage = await UsageTracking.getOrCreateUsageRecord(userId, 'monthly');
    const dailyUsage = await UsageTracking.getOrCreateUsageRecord(userId, 'daily');
    
    // Get user subscription info
    const user = await User.findById(userId).select('subscription');
    const subscriptionTier = user?.subscription?.tier || 'free';
    
    res.json({
      subscriptionTier,
      hasUnlimitedUsage: subscriptionTier === 'pro' || subscriptionTier === 'clinic',
      monthly: {
        usage: monthlyUsage.usage,
        limits: monthlyUsage.limitsInEffect,
        remaining: monthlyUsage.remainingUsage,
        percentage: monthlyUsage.usagePercentage,
        hasExceededLimits: monthlyUsage.hasExceededLimits,
        period: monthlyUsage.dateKey,
      },
      daily: {
        usage: dailyUsage.usage,
        limits: dailyUsage.limitsInEffect,
        remaining: dailyUsage.remainingUsage,
        percentage: dailyUsage.usagePercentage,
        hasExceededLimits: dailyUsage.hasExceededLimits,
        period: dailyUsage.dateKey,
      },
    });
  } catch (error) {
    console.error('Error getting current usage:', error);
    res.status(500).json({ error: 'Failed to get usage information' });
  }
};

/**
 * Get usage history for a user
 */
const getUsageHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'monthly', limit = 12 } = req.query;
    
    const usageHistory = await UsageTracking.find({
      userId,
      period,
    })
    .sort({ date: -1 })
    .limit(parseInt(limit));
    
    res.json({
      period,
      history: usageHistory,
      total: usageHistory.length,
    });
  } catch (error) {
    console.error('Error getting usage history:', error);
    res.status(500).json({ error: 'Failed to get usage history' });
  }
};

/**
 * Check if user can perform a specific action
 */
const checkActionLimit = async (req, res) => {
  try {
    const userId = req.user._id;
    const { action } = req.params;
    
    const result = await UsageTracking.canPerformAction(userId, action);
    
    res.json(result);
  } catch (error) {
    console.error('Error checking action limit:', error);
    res.status(500).json({ error: 'Failed to check action limit' });
  }
};

/**
 * Get usage analytics for admin dashboard
 */
const getUsageAnalytics = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { period = 'monthly', days = 30 } = req.query;
    
    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Aggregate usage statistics
    const usageStats = await UsageTracking.aggregate([
      {
        $match: {
          period,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            tier: '$subscriptionTier',
            date: '$dateKey'
          },
          totalUsers: { $sum: 1 },
          totalAIMessages: { $sum: '$usage.totalAIMessages' },
          totalAppointments: { $sum: '$usage.appointmentsBooked' },
          avgAIMessages: { $avg: '$usage.totalAIMessages' },
          avgAppointments: { $avg: '$usage.appointmentsBooked' },
        }
      },
      {
        $sort: { '_id.date': -1 }
      }
    ]);
    
    // Get tier distribution
    const tierDistribution = await UsageTracking.aggregate([
      {
        $match: {
          period,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$subscriptionTier',
          userCount: { $addToSet: '$userId' },
          totalAIMessages: { $sum: '$usage.totalAIMessages' },
          totalAppointments: { $sum: '$usage.appointmentsBooked' },
        }
      },
      {
        $project: {
          tier: '$_id',
          uniqueUsers: { $size: '$userCount' },
          totalAIMessages: 1,
          totalAppointments: 1,
          avgAIMessagesPerUser: { $divide: ['$totalAIMessages', { $size: '$userCount' }] },
          avgAppointmentsPerUser: { $divide: ['$totalAppointments', { $size: '$userCount' }] },
        }
      }
    ]);
    
    // Get top users by usage
    const topUsers = await UsageTracking.aggregate([
      {
        $match: {
          period,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalAIMessages: { $sum: '$usage.totalAIMessages' },
          totalAppointments: { $sum: '$usage.appointmentsBooked' },
          subscriptionTier: { $first: '$subscriptionTier' },
        }
      },
      {
        $sort: { totalAIMessages: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          userId: '$_id',
          userName: { $arrayElemAt: ['$user.name', 0] },
          userEmail: { $arrayElemAt: ['$user.email', 0] },
          totalAIMessages: 1,
          totalAppointments: 1,
          subscriptionTier: 1,
        }
      }
    ]);
    
    res.json({
      period,
      dateRange: { startDate, endDate },
      usageStatistics: usageStats,
      tierDistribution,
      topUsers,
      summary: {
        totalRecords: usageStats.length,
        totalTiers: tierDistribution.length,
      }
    });
  } catch (error) {
    console.error('Error getting usage analytics:', error);
    res.status(500).json({ error: 'Failed to get usage analytics' });
  }
};

/**
 * Reset user usage (admin only)
 */
const resetUserUsage = async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userId } = req.params;
    const { period = 'monthly' } = req.body;
    
    // Find and reset the usage record
    const now = new Date();
    let dateKey;
    
    if (period === 'daily') {
      dateKey = now.toISOString().split('T')[0];
    } else {
      dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    const resetData = {
      'usage.aiConsultationMessages': 0,
      'usage.symptomCheckerMessages': 0,
      'usage.totalAIMessages': 0,
      'usage.aiConsultationSessions': 0,
      'usage.symptomCheckerSessions': 0,
      'usage.appointmentsBooked': 0,
      'usage.prescriptionsViewed': 0,
      lastReset: new Date(),
    };
    
    const result = await UsageTracking.findOneAndUpdate(
      { userId, period, dateKey },
      { $set: resetData },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Usage record not found' });
    }
    
    res.json({
      success: true,
      message: `${period} usage reset for user`,
      usage: result,
    });
  } catch (error) {
    console.error('Error resetting user usage:', error);
    res.status(500).json({ error: 'Failed to reset user usage' });
  }
};

/**
 * Get usage summary for dashboard widget
 */
const getUsageSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get current month usage
    const monthlyUsage = await UsageTracking.getOrCreateUsageRecord(userId, 'monthly');
    
    // Get user subscription
    const user = await User.findById(userId).select('subscription');
    const subscriptionTier = user?.subscription?.tier || 'free';
    
    // Calculate summary
    const summary = {
      subscriptionTier,
      currentUsage: {
        aiMessages: monthlyUsage.usage.totalAIMessages,
        appointments: monthlyUsage.usage.appointmentsBooked,
      },
      limits: monthlyUsage.limitsInEffect,
      remaining: monthlyUsage.remainingUsage,
      usagePercentage: {
        aiMessages: subscriptionTier === 'free' ? 
          Math.round((monthlyUsage.usage.totalAIMessages / monthlyUsage.limitsInEffect.aiMessages) * 100) : 0,
        appointments: subscriptionTier === 'free' ? 
          Math.round((monthlyUsage.usage.appointmentsBooked / monthlyUsage.limitsInEffect.appointmentsPerMonth) * 100) : 0,
      },
      hasUnlimitedUsage: subscriptionTier === 'pro' || subscriptionTier === 'clinic',
      needsUpgrade: subscriptionTier === 'free' && (
        monthlyUsage.usage.totalAIMessages >= monthlyUsage.limitsInEffect.aiMessages ||
        monthlyUsage.usage.appointmentsBooked >= monthlyUsage.limitsInEffect.appointmentsPerMonth
      ),
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting usage summary:', error);
    res.status(500).json({ error: 'Failed to get usage summary' });
  }
};

module.exports = {
  getCurrentUsage,
  getUsageHistory,
  checkActionLimit,
  getUsageAnalytics,
  resetUserUsage,
  getUsageSummary,
};
