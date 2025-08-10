const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  // Subscription Details
  tier: {
    type: String,
    enum: ['free', 'pro', 'clinic'],
    required: true,
    default: 'free',
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing', 'incomplete'],
    required: true,
    default: 'active',
  },
  
  // Pricing Information
  pricing: {
    amount: {
      type: Number,
      default: 0, // $0 for free, $19 for pro, $99 for clinic
    },
    currency: {
      type: String,
      default: 'USD',
    },
    interval: {
      type: String,
      enum: ['month', 'year'],
      default: 'month',
    },
  },
  
  // Subscription Lifecycle
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  
  endDate: {
    type: Date,
    default: null, // null for free tier or active subscriptions
  },
  
  trialEndDate: {
    type: Date,
    default: null,
  },
  
  cancelledAt: {
    type: Date,
    default: null,
  },
  
  cancelReason: {
    type: String,
    default: '',
  },
  
  // Payment Integration
  stripeCustomerId: {
    type: String,
    default: '',
  },
  
  stripeSubscriptionId: {
    type: String,
    default: '',
  },
  
  stripePriceId: {
    type: String,
    default: '',
  },
  
  lastPaymentDate: {
    type: Date,
    default: null,
  },
  
  nextPaymentDate: {
    type: Date,
    default: null,
  },
  
  // Usage Limits Based on Tier
  limits: {
    aiMessages: {
      type: Number,
      default: function() {
        switch(this.tier) {
          case 'free': return 3;
          case 'pro': return -1; // unlimited
          case 'clinic': return -1; // unlimited
          default: return 3;
        }
      },
    },
    // Future limits can be added here
    appointmentsPerMonth: {
      type: Number,
      default: function() {
        switch(this.tier) {
          case 'free': return 1;
          case 'pro': return 10;
          case 'clinic': return -1; // unlimited
          default: return 1;
        }
      },
    },
  },
  
  // Features Available by Tier
  features: {
    aiConsultation: {
      type: Boolean,
      default: true,
    },
    symptomChecker: {
      type: Boolean,
      default: true,
    },
    prioritySupport: {
      type: Boolean,
      default: function() {
        return this.tier !== 'free';
      },
    },
    familyAccounts: {
      type: Boolean,
      default: function() {
        return this.tier === 'pro' || this.tier === 'clinic';
      },
    },
    digitalPrescriptions: {
      type: Boolean,
      default: function() {
        return this.tier !== 'free';
      },
    },
    apiAccess: {
      type: Boolean,
      default: function() {
        return this.tier === 'clinic';
      },
    },
    analytics: {
      type: Boolean,
      default: function() {
        return this.tier === 'clinic';
      },
    },
  },
  
  // Subscription History
  history: [{
    action: {
      type: String,
      enum: ['created', 'upgraded', 'downgraded', 'cancelled', 'reactivated', 'payment_failed', 'payment_succeeded'],
      required: true,
    },
    fromTier: {
      type: String,
      enum: ['free', 'pro', 'clinic'],
    },
    toTier: {
      type: String,
      enum: ['free', 'pro', 'clinic'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  }],
  
  // Auto-renewal settings
  autoRenew: {
    type: Boolean,
    default: true,
  },
  
  // Proration and credits
  credits: {
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' || this.status === 'trialing';
});

// Virtual for checking if subscription has unlimited usage
subscriptionSchema.virtual('hasUnlimitedUsage').get(function() {
  return this.tier === 'pro' || this.tier === 'clinic';
});

// Virtual for days remaining in trial
subscriptionSchema.virtual('trialDaysRemaining').get(function() {
  if (!this.trialEndDate) return 0;
  const now = new Date();
  const diffTime = this.trialEndDate - now;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// Indexes for efficient querying
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ tier: 1, status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ nextPaymentDate: 1 });
subscriptionSchema.index({ endDate: 1 });

// Pre-save middleware to update limits based on tier
subscriptionSchema.pre('save', function(next) {
  if (this.isModified('tier')) {
    switch(this.tier) {
      case 'free':
        this.limits.aiMessages = 3;
        this.limits.appointmentsPerMonth = 1;
        this.pricing.amount = 0;
        break;
      case 'pro':
        this.limits.aiMessages = -1; // unlimited
        this.limits.appointmentsPerMonth = 10;
        this.pricing.amount = 19;
        break;
      case 'clinic':
        this.limits.aiMessages = -1; // unlimited
        this.limits.appointmentsPerMonth = -1; // unlimited
        this.pricing.amount = 99;
        break;
    }
  }
  next();
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
