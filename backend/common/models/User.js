const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  // Additional fields for all users
  phone: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active",
  },
  // Doctor-specific fields
  specialization: {
    type: String,
    default: '',
  },
  experience: {
    type: Number,
    default: 0,
  },
  qualifications: [{
    type: String,
  }],
  address: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  // Patient-specific fields
  birthdate: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  bloodType: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '',
  },
  weight: {
    type: String,
    default: '',
  },
  allergies: [{
    type: String,
  }],
  emergencyContact: {
    name: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    relationship: {
      type: String,
      default: '',
    }
  },
  medicalHistory: [{
    type: String,
  }],
  // Notification preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    appointmentReminders: {
      type: Boolean,
      default: true,
    },
    medicationReminders: {
      type: Boolean,
      default: true,
    },
    systemUpdates: {
      type: Boolean,
      default: true,
    },
  },

  // AI Symptom Checker History
  symptomCheckerHistory: [{
    sessionId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    symptoms: [{
      type: String,
      required: true,
    }],
    aiAnalysis: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    recommendations: [{
      type: String,
    }],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    followUpActions: [{
      type: String,
    }],
    sessionDuration: {
      type: Number, // in seconds
      default: 0,
    },
    apiResponseTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    userFeedback: {
      helpful: {
        type: Boolean,
        default: null,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comments: {
        type: String,
        default: '',
      },
    },
  }],

  // AI Consultation History
  consultationHistory: [{
    sessionId: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    messages: [{
      messageId: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      isUserMessage: {
        type: Boolean,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      ragSources: [{
        documentId: {
          type: String,
        },
        similarity: {
          type: Number,
          min: 0,
          max: 1,
        },
        documentType: {
          type: String,
        },
        excerpt: {
          type: String,
        },
      }],
      responseTime: {
        type: Number, // in milliseconds
        default: 0,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    }],
    totalMessages: {
      type: Number,
      default: 0,
    },
    sessionDuration: {
      type: Number, // in seconds
      default: 0,
    },
    ragQueriesCount: {
      type: Number,
      default: 0,
    },
    averageConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    userSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      feedback: {
        type: String,
        default: '',
      },
    },
  }],

  // AI Usage Analytics (aggregated)
  aiUsageStats: {
    totalSymptomChecks: {
      type: Number,
      default: 0,
    },
    totalConsultations: {
      type: Number,
      default: 0,
    },
    totalAIInteractions: {
      type: Number,
      default: 0,
    },
    lastSymptomCheck: {
      type: Date,
      default: null,
    },
    lastConsultation: {
      type: Date,
      default: null,
    },
    averageSessionDuration: {
      type: Number, // in seconds
      default: 0,
    },
    preferredAIFeature: {
      type: String,
      enum: ['symptom-checker', 'consultation', 'none'],
      default: 'none',
    },
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  },

  // Subscription and Usage Tracking
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'pro', 'clinic'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null, // null for free tier, set for paid tiers
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    stripeSubscriptionId: {
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
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    // Manual override fields for admin plan management
    manualOverride: {
      type: Boolean,
      default: false,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastModifiedAt: {
      type: Date,
      default: null,
    },
    lastModificationReason: {
      type: String,
      default: '',
    },
  },

  // Usage Limits and Tracking
  usageLimits: {
    // Free tier: 3 messages total for AI consultation + symptom checker combined
    // Pro tier: unlimited
    // Clinic tier: unlimited
    monthlyAIMessages: {
      type: Number,
      default: 3, // Free tier limit
    },
    currentMonthUsage: {
      aiMessages: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },
    // Track daily usage for rate limiting
    dailyUsage: {
      aiMessages: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },
  },

  // Billing History
  billingHistory: [{
    invoiceId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stripeInvoiceId: {
      type: String,
      default: '',
    },
    downloadUrl: {
      type: String,
      default: '',
    },
  }],
}, { timestamps: true });

// Indexes for efficient querying
userSchema.index({ '_id': 1, 'symptomCheckerHistory.timestamp': -1 });
userSchema.index({ '_id': 1, 'consultationHistory.startTime': -1 });
userSchema.index({ 'aiUsageStats.totalAIInteractions': -1 });
userSchema.index({ 'aiUsageStats.lastSymptomCheck': -1 });
userSchema.index({ 'aiUsageStats.lastConsultation': -1 });
userSchema.index({ 'role': 1, 'aiUsageStats.totalAIInteractions': -1 });

module.exports = mongoose.model("User", userSchema);