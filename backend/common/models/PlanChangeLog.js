const mongoose = require("mongoose");

const planChangeLogSchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  userName: {
    type: String,
    required: true,
  },
  
  userEmail: {
    type: String,
    required: true,
  },
  
  // Plan change details
  fromTier: {
    type: String,
    enum: ['free', 'pro', 'clinic'],
    required: true,
  },
  
  toTier: {
    type: String,
    enum: ['free', 'pro', 'clinic'],
    required: true,
  },
  
  // Who made the change
  changedBy: {
    type: String,
    required: true, // Name or email of the person who made the change
  },
  
  changedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // ID of the admin who made the change
  },
  
  // Change details
  reason: {
    type: String,
    required: true,
    maxlength: 500,
  },
  
  type: {
    type: String,
    enum: ['manual', 'payment', 'system', 'bulk', 'promotion'],
    required: true,
    default: 'manual',
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  // Additional metadata
  metadata: {
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    sessionId: {
      type: String,
      default: '',
    },
    // For payment-related changes
    paymentId: {
      type: String,
      default: '',
    },
    // For system changes
    systemReason: {
      type: String,
      default: '',
    },
    // For bulk changes
    bulkOperationId: {
      type: String,
      default: '',
    },
  },
  
  // Previous subscription details (for rollback purposes)
  previousSubscriptionData: {
    tier: String,
    status: String,
    startDate: Date,
    endDate: Date,
    stripeSubscriptionId: String,
    stripeCustomerId: String,
  },
  
  // New subscription details
  newSubscriptionData: {
    tier: String,
    status: String,
    startDate: Date,
    endDate: Date,
    stripeSubscriptionId: String,
    stripeCustomerId: String,
    manualOverride: Boolean,
  },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
planChangeLogSchema.index({ userId: 1, timestamp: -1 });
planChangeLogSchema.index({ changedById: 1, timestamp: -1 });
planChangeLogSchema.index({ type: 1, timestamp: -1 });
planChangeLogSchema.index({ timestamp: -1 });
planChangeLogSchema.index({ fromTier: 1, toTier: 1 });

// Virtual for change description
planChangeLogSchema.virtual('changeDescription').get(function() {
  return `${this.fromTier} → ${this.toTier}`;
});

// Virtual for formatted timestamp
planChangeLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to create a log entry
planChangeLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this({
      userId: logData.userId,
      userName: logData.userName,
      userEmail: logData.userEmail,
      fromTier: logData.fromTier,
      toTier: logData.toTier,
      changedBy: logData.changedBy,
      changedById: logData.changedById,
      reason: logData.reason,
      type: logData.type || 'manual',
      metadata: logData.metadata || {},
      previousSubscriptionData: logData.previousSubscriptionData || {},
      newSubscriptionData: logData.newSubscriptionData || {},
    });
    
    await log.save();
    console.log(`Plan change logged: ${logData.userName} (${logData.fromTier} → ${logData.toTier}) by ${logData.changedBy}`);
    return log;
  } catch (error) {
    console.error('Error creating plan change log:', error);
    throw error;
  }
};

// Static method to get logs for a user
planChangeLogSchema.statics.getUserLogs = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('changedById', 'name email role');
};

// Static method to get logs by admin
planChangeLogSchema.statics.getAdminLogs = async function(adminId, limit = 50) {
  return this.find({ changedById: adminId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get recent logs
planChangeLogSchema.statics.getRecentLogs = async function(limit = 20) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('changedById', 'name email role');
};

// Static method to get statistics
planChangeLogSchema.statics.getStats = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        timestamp: {
          $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          fromTier: '$fromTier',
          toTier: '$toTier'
        },
        count: { $sum: 1 },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        type: '$_id.type',
        fromTier: '$_id.fromTier',
        toTier: '$_id.toTier',
        count: 1,
        uniqueUsers: { $size: '$users' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Pre-save middleware to validate the change
planChangeLogSchema.pre('save', function(next) {
  // Ensure we're not logging a non-change
  if (this.fromTier === this.toTier) {
    return next(new Error('Cannot log a plan change where fromTier equals toTier'));
  }
  
  // Ensure reason is provided for manual changes
  if (this.type === 'manual' && (!this.reason || this.reason.trim().length < 5)) {
    return next(new Error('Manual plan changes require a detailed reason (minimum 5 characters)'));
  }
  
  next();
});

// Post-save middleware for notifications (if needed)
planChangeLogSchema.post('save', function(doc) {
  // Here you could trigger notifications, webhooks, etc.
  console.log(`Plan change logged: ${doc.userName} plan changed from ${doc.fromTier} to ${doc.toTier}`);
  
  // Example: Send notification to admin team
  // notificationService.sendAdminNotification({
  //   type: 'plan_change',
  //   message: `${doc.userName} plan changed from ${doc.fromTier} to ${doc.toTier} by ${doc.changedBy}`,
  //   data: doc
  // });
});

module.exports = mongoose.model("PlanChangeLog", planChangeLogSchema);
