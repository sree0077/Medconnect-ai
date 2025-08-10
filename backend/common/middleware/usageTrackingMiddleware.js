const UsageTracking = require('../models/UsageTracking');
const User = require('../models/User');

/**
 * Middleware to check if user can perform AI-related actions based on their subscription tier and usage limits
 */
const checkAIUsageLimit = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Check if user can perform AI message action
    const usageCheck = await UsageTracking.canPerformAction(userId, 'aiMessage');
    
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: 'You have reached your monthly limit for AI consultations and symptom checker. Please upgrade to Pro for unlimited access.',
        details: {
          reason: usageCheck.reason,
          current: usageCheck.current,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
        upgradeRequired: true,
        upgradeUrl: '/pricing',
      });
    }
    
    // Add usage info to request for potential use in controllers
    req.usageInfo = usageCheck;
    next();
  } catch (error) {
    console.error('Error checking AI usage limit:', error);
    res.status(500).json({ error: 'Failed to check usage limits' });
  }
};

/**
 * Middleware to check appointment booking limits
 */
const checkAppointmentLimit = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Check if user can book appointment
    const usageCheck = await UsageTracking.canPerformAction(userId, 'appointment');
    
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: 'Appointment limit exceeded',
        message: 'You have reached your monthly limit for appointments. Please upgrade to Pro for more appointments.',
        details: {
          reason: usageCheck.reason,
          current: usageCheck.current,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        },
        upgradeRequired: true,
        upgradeUrl: '/pricing',
      });
    }
    
    req.usageInfo = usageCheck;
    next();
  } catch (error) {
    console.error('Error checking appointment limit:', error);
    res.status(500).json({ error: 'Failed to check appointment limits' });
  }
};

/**
 * Middleware to track AI message usage after successful API call
 */
const trackAIUsage = (usageType = 'aiConsultationMessage') => {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only track usage if the response was successful (status < 400)
      if (res.statusCode < 400) {
        // Track usage asynchronously to not delay response
        setImmediate(async () => {
          try {
            const userId = req.user._id;
            const sessionTime = req.sessionTime || 0; // Can be set by controllers
            
            await UsageTracking.incrementUsage(userId, usageType, 1, sessionTime);
            
            // Also update the user's aiUsageStats for backward compatibility
            const updateData = {};
            if (usageType === 'aiConsultationMessage') {
              updateData['$inc'] = {
                'aiUsageStats.totalConsultations': 1,
                'aiUsageStats.totalAIInteractions': 1,
              };
              updateData['$set'] = {
                'aiUsageStats.lastConsultation': new Date(),
              };
            } else if (usageType === 'symptomCheckerMessage') {
              updateData['$inc'] = {
                'aiUsageStats.totalSymptomChecks': 1,
                'aiUsageStats.totalAIInteractions': 1,
              };
              updateData['$set'] = {
                'aiUsageStats.lastSymptomCheck': new Date(),
              };
            }
            
            if (Object.keys(updateData).length > 0) {
              await User.findByIdAndUpdate(userId, updateData);
            }
            
            console.log(`Tracked ${usageType} usage for user ${userId}`);
          } catch (error) {
            console.error('Error tracking AI usage:', error);
          }
        });
      }
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to track appointment booking
 */
const trackAppointmentUsage = async (req, res, next) => {
  // Store original res.json to intercept successful responses
  const originalJson = res.json;
  
  res.json = function(data) {
    // Only track usage if the response was successful (status < 400)
    if (res.statusCode < 400) {
      // Track usage asynchronously
      setImmediate(async () => {
        try {
          const userId = req.user._id;
          await UsageTracking.incrementUsage(userId, 'appointmentBooked', 1);
          console.log(`Tracked appointment booking for user ${userId}`);
        } catch (error) {
          console.error('Error tracking appointment usage:', error);
        }
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to get current usage stats for a user
 */
const getCurrentUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get monthly usage record
    const monthlyUsage = await UsageTracking.getOrCreateUsageRecord(userId, 'monthly');
    const dailyUsage = await UsageTracking.getOrCreateUsageRecord(userId, 'daily');
    
    // Get user subscription info
    const user = await User.findById(userId).select('subscription');
    const subscriptionTier = user?.subscription?.tier || 'free';
    
    req.currentUsage = {
      monthly: monthlyUsage,
      daily: dailyUsage,
      subscriptionTier,
      hasUnlimitedUsage: subscriptionTier === 'pro' || subscriptionTier === 'clinic',
    };
    
    next();
  } catch (error) {
    console.error('Error getting current usage:', error);
    res.status(500).json({ error: 'Failed to get usage information' });
  }
};

/**
 * Utility function to reset monthly usage (for cron jobs)
 */
const resetMonthlyUsage = async () => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // This would typically be called by a cron job at the start of each month
    // For now, we rely on the getOrCreateUsageRecord method to create new records
    console.log(`Monthly usage reset check for ${currentMonth}`);
    
    return true;
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    return false;
  }
};

/**
 * Utility function to get usage summary for admin dashboard
 */
const getUsageSummary = async (period = 'monthly', limit = 100) => {
  try {
    const pipeline = [
      { $match: { period } },
      { $sort: { date: -1 } },
      { $limit: limit },
      {
        $group: {
          _id: '$subscriptionTier',
          totalUsers: { $sum: 1 },
          totalAIMessages: { $sum: '$usage.totalAIMessages' },
          totalAppointments: { $sum: '$usage.appointmentsBooked' },
          avgAIMessages: { $avg: '$usage.totalAIMessages' },
          avgAppointments: { $avg: '$usage.appointmentsBooked' },
        }
      }
    ];
    
    const summary = await UsageTracking.aggregate(pipeline);
    return summary;
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return [];
  }
};

module.exports = {
  checkAIUsageLimit,
  checkAppointmentLimit,
  trackAIUsage,
  trackAppointmentUsage,
  getCurrentUsage,
  resetMonthlyUsage,
  getUsageSummary,
};
