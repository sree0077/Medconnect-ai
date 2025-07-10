const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    get: (time) => time.toISOString()
  },
  event: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  severity: {
    type: String,
    enum: ['high', 'medium', 'warning', 'info'],
    default: 'info'
  },
  details: {
    type: String,
    default: ''
  },
  // For security alerts
  isActive: {
    type: Boolean,
    default: false
  },
  // To link resolution logs to their original alerts
  relatedAlertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecurityLog',
    default: null
  }
});

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);
