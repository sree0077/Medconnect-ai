const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../common/middleware/auth');
const allowRoles = require('../../common/middleware/role');
const {
  getAllSecurityLogs,
  getSecurityLogsBySeverity,
  getSecurityLogsByTimeRange,
  addSecurityLog,
  getSecurityStats,
  sendSecurityAlert,
  resolveSecurityAlert,
  sendSecurityIssueSolved
} = require('../controllers/securityLogController');

// All security log routes require admin role
router.use(authenticateToken, allowRoles('admin'));

// Get all security logs
router.get('/all', getAllSecurityLogs);

// Get security logs filtered by severity
router.get('/severity/:severity', getSecurityLogsBySeverity);

// Get security logs filtered by time range
router.get('/timerange/:hours', getSecurityLogsByTimeRange);

// Get security dashboard stats
router.get('/stats', getSecurityStats);

// Add new security log entry
router.post('/add', addSecurityLog);

// Send security alert to all users
router.post('/alert', sendSecurityAlert);

// Resolve security alert
router.post('/resolve/:alertId', resolveSecurityAlert);

// Send "Security Issue Solved" notification to all users
router.post('/issue-solved', authenticateToken, allowRoles('admin'), sendSecurityIssueSolved);

// Clear all security logs (for testing)
router.delete('/clear-all', async (req, res) => {
  try {
    const SecurityLog = require('../models/SecurityLog');
    const result = await SecurityLog.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} security logs` });
  } catch (error) {
    console.error('Error clearing security logs:', error);
    res.status(500).json({ error: 'Failed to clear security logs' });
  }
});

module.exports = router;
