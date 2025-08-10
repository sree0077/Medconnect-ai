const mongoose = require("mongoose");

const usageTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Time period for this usage record
  period: {
    type: String,
    enum: ['daily', 'monthly'],
    required: true,
  },
  
  // Date identifier (YYYY-MM-DD for daily, YYYY-MM for monthly)
  dateKey: {
    type: String,
    required: true,
  },
  
  // Actual date for easier querying
  date: {
    type: Date,
    required: true,
  },
  
  // Usage counters
  usage: {
    // AI-related usage
    aiConsultationMessages: {
      type: Number,
      default: 0,
    },
    symptomCheckerMessages: {
      type: Number,
      default: 0,
    },
    totalAIMessages: {
      type: Number,
      default: 0,
    },
    
    // Session counts
    aiConsultationSessions: {
      type: Number,
      default: 0,
    },
    symptomCheckerSessions: {
      type: Number,
      default: 0,
    },
    
    // Time spent (in seconds)
    aiConsultationTime: {
      type: Number,
      default: 0,
    },
    symptomCheckerTime: {
      type: Number,
      default: 0,
    },
    
    // Other features (for future expansion)
    appointmentsBooked: {
      type: Number,
      default: 0,
    },
    prescriptionsViewed: {
      type: Number,
      default: 0,
    },
  },
  
  // Subscription tier at the time of usage
  subscriptionTier: {
    type: String,
    enum: ['free', 'pro', 'clinic'],
    required: true,
  },
  
  // Limits that were in effect during this period
  limitsInEffect: {
    aiMessages: {
      type: Number,
      default: 3,
    },
    appointmentsPerMonth: {
      type: Number,
      default: 1,
    },
  },
  
  // Overage tracking (for potential billing)
  overages: {
    aiMessages: {
      type: Number,
      default: 0,
    },
    appointments: {
      type: Number,
      default: 0,
    },
  },
  
  // Reset information
  lastReset: {
    type: Date,
    default: Date.now,
  },
  
  // Metadata for tracking
  metadata: {
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    platform: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web',
    },
  },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if user has exceeded limits
usageTrackingSchema.virtual('hasExceededLimits').get(function() {
  if (this.subscriptionTier !== 'free') return false; // Pro and Clinic have unlimited usage
  
  return this.usage.totalAIMessages >= this.limitsInEffect.aiMessages;
});

// Virtual for remaining usage
usageTrackingSchema.virtual('remainingUsage').get(function() {
  if (this.subscriptionTier !== 'free') {
    return {
      aiMessages: -1, // unlimited
      appointments: this.subscriptionTier === 'clinic' ? -1 : (this.limitsInEffect.appointmentsPerMonth - this.usage.appointmentsBooked),
    };
  }
  
  return {
    aiMessages: Math.max(0, this.limitsInEffect.aiMessages - this.usage.totalAIMessages),
    appointments: Math.max(0, this.limitsInEffect.appointmentsPerMonth - this.usage.appointmentsBooked),
  };
});

// Virtual for usage percentage
usageTrackingSchema.virtual('usagePercentage').get(function() {
  if (this.subscriptionTier !== 'free') return 0; // No limits for paid tiers
  
  const aiPercentage = (this.usage.totalAIMessages / this.limitsInEffect.aiMessages) * 100;
  return Math.min(100, aiPercentage);
});

// Compound indexes for efficient querying
usageTrackingSchema.index({ userId: 1, period: 1, dateKey: 1 }, { unique: true });
usageTrackingSchema.index({ userId: 1, date: -1 });
usageTrackingSchema.index({ period: 1, date: -1 });
usageTrackingSchema.index({ subscriptionTier: 1, date: -1 });
usageTrackingSchema.index({ dateKey: 1 });

// Static method to get or create usage record for a specific period
usageTrackingSchema.statics.getOrCreateUsageRecord = async function(userId, period = 'monthly') {
  const now = new Date();
  let dateKey, date;
  
  if (period === 'daily') {
    dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    date = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  // Get user's current subscription
  const User = mongoose.model('User');
  const user = await User.findById(userId).select('subscription');
  const subscriptionTier = user?.subscription?.tier || 'free';
  
  // Set limits based on subscription tier
  let limits = {
    aiMessages: 3,
    appointmentsPerMonth: 1,
  };
  
  if (subscriptionTier === 'pro') {
    limits = {
      aiMessages: -1, // unlimited
      appointmentsPerMonth: 10,
    };
  } else if (subscriptionTier === 'clinic') {
    limits = {
      aiMessages: -1, // unlimited
      appointmentsPerMonth: -1, // unlimited
    };
  }
  
  // Find existing record or create new one
  let usageRecord = await this.findOne({ userId, period, dateKey });
  
  if (!usageRecord) {
    usageRecord = new this({
      userId,
      period,
      dateKey,
      date,
      subscriptionTier,
      limitsInEffect: limits,
    });
    await usageRecord.save();
  }
  
  return usageRecord;
};

// Static method to increment usage
usageTrackingSchema.statics.incrementUsage = async function(userId, usageType, amount = 1, sessionTime = 0) {
  const monthlyRecord = await this.getOrCreateUsageRecord(userId, 'monthly');
  const dailyRecord = await this.getOrCreateUsageRecord(userId, 'daily');
  
  const updateData = {};
  
  switch (usageType) {
    case 'aiConsultationMessage':
      updateData['usage.aiConsultationMessages'] = amount;
      updateData['usage.totalAIMessages'] = amount;
      if (sessionTime > 0) {
        updateData['usage.aiConsultationTime'] = sessionTime;
      }
      break;
    case 'symptomCheckerMessage':
      updateData['usage.symptomCheckerMessages'] = amount;
      updateData['usage.totalAIMessages'] = amount;
      if (sessionTime > 0) {
        updateData['usage.symptomCheckerTime'] = sessionTime;
      }
      break;
    case 'aiConsultationSession':
      updateData['usage.aiConsultationSessions'] = amount;
      break;
    case 'symptomCheckerSession':
      updateData['usage.symptomCheckerSessions'] = amount;
      break;
    case 'appointmentBooked':
      updateData['usage.appointmentsBooked'] = amount;
      break;
    case 'prescriptionViewed':
      updateData['usage.prescriptionsViewed'] = amount;
      break;
  }
  
  // Update both monthly and daily records
  await Promise.all([
    this.findByIdAndUpdate(monthlyRecord._id, { $inc: updateData }),
    this.findByIdAndUpdate(dailyRecord._id, { $inc: updateData }),
  ]);
  
  return { monthlyRecord, dailyRecord };
};

// Static method to check if user can perform action
usageTrackingSchema.statics.canPerformAction = async function(userId, actionType) {
  const User = mongoose.model('User');
  const user = await User.findById(userId).select('subscription');
  const subscriptionTier = user?.subscription?.tier || 'free';
  
  // Pro and Clinic tiers have unlimited usage
  if (subscriptionTier === 'pro' || subscriptionTier === 'clinic') {
    return { allowed: true, reason: 'unlimited' };
  }
  
  // Check monthly usage for free tier
  const monthlyRecord = await this.getOrCreateUsageRecord(userId, 'monthly');
  
  switch (actionType) {
    case 'aiMessage':
      if (monthlyRecord.usage.totalAIMessages >= monthlyRecord.limitsInEffect.aiMessages) {
        return { 
          allowed: false, 
          reason: 'monthly_limit_exceeded',
          current: monthlyRecord.usage.totalAIMessages,
          limit: monthlyRecord.limitsInEffect.aiMessages,
          remaining: 0
        };
      }
      return { 
        allowed: true, 
        reason: 'within_limits',
        current: monthlyRecord.usage.totalAIMessages,
        limit: monthlyRecord.limitsInEffect.aiMessages,
        remaining: monthlyRecord.limitsInEffect.aiMessages - monthlyRecord.usage.totalAIMessages
      };
    
    case 'appointment':
      if (monthlyRecord.usage.appointmentsBooked >= monthlyRecord.limitsInEffect.appointmentsPerMonth) {
        return { 
          allowed: false, 
          reason: 'monthly_limit_exceeded',
          current: monthlyRecord.usage.appointmentsBooked,
          limit: monthlyRecord.limitsInEffect.appointmentsPerMonth,
          remaining: 0
        };
      }
      return { 
        allowed: true, 
        reason: 'within_limits',
        current: monthlyRecord.usage.appointmentsBooked,
        limit: monthlyRecord.limitsInEffect.appointmentsPerMonth,
        remaining: monthlyRecord.limitsInEffect.appointmentsPerMonth - monthlyRecord.usage.appointmentsBooked
      };
    
    default:
      return { allowed: true, reason: 'unknown_action' };
  }
};

module.exports = mongoose.model("UsageTracking", usageTrackingSchema);
