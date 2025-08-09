const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  // General Settings
  platformName: {
    type: String,
    required: true,
    default: 'MedConnect AI',
    trim: true,
    maxlength: 100
  },
  supportEmail: {
    type: String,
    required: true,
    default: 'support@medconnect.ai',
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC-5 (Eastern)',
    trim: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  
  // Security Settings
  twoFactorAuth: {
    type: Boolean,
    default: true
  },
  sessionTimeout: {
    type: Number,
    required: true,
    default: 30,
    min: 5,
    max: 480 // 8 hours max
  },
  passwordPolicy: {
    type: String,
    enum: ['basic', 'strong', 'strict'],
    default: 'strong'
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 5,
    min: 3,
    max: 10
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  systemAlerts: {
    type: Boolean,
    default: true
  },
  doctorApprovalNotifs: {
    type: Boolean,
    default: true
  },
  
  // AI Settings
  aiResponseTime: {
    type: Number,
    required: true,
    default: 2,
    min: 1,
    max: 30 // 30 seconds max
  },
  confidenceThreshold: {
    type: Number,
    required: true,
    default: 85,
    min: 50,
    max: 100
  },
  autoLearnEnabled: {
    type: Boolean,
    default: true
  },
  debugMode: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  version: {
    type: Number,
    default: 1
  }
}, { 
  timestamps: true,
  // Ensure only one settings document exists
  collection: 'systemsettings'
});

// Index for efficient querying
SystemSettingsSchema.index({ createdAt: 1 });

// Static method to get or create default settings
SystemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings if none exist
    settings = new this({});
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
SystemSettingsSchema.statics.updateSettings = async function(updateData, userId) {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create new settings if none exist
    settings = new this(updateData);
  } else {
    // Update existing settings
    Object.assign(settings, updateData);
    settings.version += 1;
  }
  
  if (userId) {
    settings.lastUpdatedBy = userId;
  }
  
  await settings.save();
  return settings;
};

// Static method to reset to defaults
SystemSettingsSchema.statics.resetToDefaults = async function(userId) {
  await this.deleteMany({}); // Remove all existing settings
  
  const defaultSettings = new this({});
  if (userId) {
    defaultSettings.lastUpdatedBy = userId;
  }
  
  await defaultSettings.save();
  return defaultSettings;
};

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
