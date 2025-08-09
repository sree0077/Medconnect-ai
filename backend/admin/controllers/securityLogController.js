const SecurityLog = require('../../common/models/SecurityLog');
const User = require('../../common/models/User');
const Notification = require('../../common/models/Notification');
const { getLocationFromIP, getRealIP } = require('../../common/utils/geolocation');

// Get all security logs for admin dashboard
const getAllSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({ message: 'Error fetching security logs', error: error.message });
  }
};

// Get security logs filtered by severity
const getSecurityLogsBySeverity = async (req, res) => {
  try {
    const { severity } = req.params;
    
    if (!['high', 'medium', 'warning', 'info', 'all'].includes(severity)) {
      return res.status(400).json({ message: 'Invalid severity level' });
    }
    
    const query = severity === 'all' ? {} : { severity };
    const logs = await SecurityLog.find(query).sort({ timestamp: -1 });
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching security logs by severity:', error);
    res.status(500).json({ message: 'Error fetching security logs', error: error.message });
  }
};

// Get security logs filtered by time range
const getSecurityLogsByTimeRange = async (req, res) => {
  try {
    const { hours } = req.params;
    
    if (hours === 'all') {
      const logs = await SecurityLog.find().sort({ timestamp: -1 });
      return res.json(logs);
    }
    
    const hoursNum = parseInt(hours);
    if (isNaN(hoursNum)) {
      return res.status(400).json({ message: 'Invalid time range' });
    }
    
    const cutoffTime = new Date(Date.now() - (hoursNum * 60 * 60 * 1000));
    const logs = await SecurityLog.find({ timestamp: { $gte: cutoffTime } }).sort({ timestamp: -1 });
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching security logs by time range:', error);
    res.status(500).json({ message: 'Error fetching security logs', error: error.message });
  }
};

// Add new security log entry
const addSecurityLog = async (req, res) => {
  try {
    const { event, user, severity, details } = req.body;

    if (!event || !user) {
      return res.status(400).json({ message: 'Event and user are required fields' });
    }

    // Get real IP and location from request
    const realIP = req.body.ip || getRealIP(req);
    const resolvedLocation = req.body.location || getLocationFromIP(realIP);

    const newLog = new SecurityLog({
      event,
      user,
      ip: realIP,
      location: resolvedLocation,
      severity: severity || 'info',
      details: details || `${event} by ${user}`
    });

    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    console.error('Error adding security log:', error);
    res.status(500).json({ message: 'Error adding security log', error: error.message });
  }
};

// Get security dashboard stats
const getSecurityStats = async (req, res) => {
  try {
    // Get total count
    const totalCount = await SecurityLog.countDocuments();
    
    // Get count by severity
    const highSeverityCount = await SecurityLog.countDocuments({ severity: 'high' });
    const mediumSeverityCount = await SecurityLog.countDocuments({ severity: 'medium' });
    const warningCount = await SecurityLog.countDocuments({ severity: 'warning' });
    const infoCount = await SecurityLog.countDocuments({ severity: 'info' });
    
    // Get failed login attempts count
    const failedLoginCount = await SecurityLog.countDocuments({ 
      event: { $regex: /failed login/i } 
    });
    
    // Get successful login count
    const successfulLoginCount = await SecurityLog.countDocuments({ 
      event: { $regex: /successful login/i } 
    });
    
    // Get recent high severity alerts
    const recentAlerts = await SecurityLog.find({ 
      severity: { $in: ['high', 'medium'] } 
    })
    .sort({ timestamp: -1 })
    .limit(3);
    
    res.json({
      totalCount,
      highSeverityCount,
      mediumSeverityCount,
      warningCount,
      infoCount,
      failedLoginCount,
      successfulLoginCount,
      recentAlerts
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({ message: 'Error fetching security stats', error: error.message });
  }
};

// Send security alert to all users
const sendSecurityAlert = async (req, res) => {
  try {
    const { message } = req.body;
    const alertDetails = message || 'There is a security concern. Please log out of the system for your safety.';
    
    // Create a security log entry
    const realIP = getRealIP(req);
    // Admin actions always show "Local Machine"
    const location = getLocationFromIP(realIP, 'admin');

    // Safely get admin info from req.user (might be null if token expired)
    const admin = (req.user && (req.user.email || req.user.name)) ?
      (req.user.email || req.user.name) : 'Administrator';

    const securityLog = new SecurityLog({
      event: 'Security Alert Broadcast',
      user: admin,
      ip: realIP,
      location: location,
      severity: 'high',
      details: `System-wide security alert sent by ${admin}: ${alertDetails}`,
      isActive: true
    });
    
    await securityLog.save();
    
    // Find all doctors and patients to send notifications
    const users = await User.find({ 
      role: { $in: ['doctor', 'patient'] },
      status: 'active' 
    });
    
    // Send notifications to all users
    const notificationPromises = users.map(user => {
      return new Notification({
        userId: user._id,
        title: '⚠️ SECURITY ALERT',
        message: alertDetails,
        type: 'error',
        data: {
          alertId: securityLog._id,
          timestamp: new Date(),
          requiresAction: true
        }
      }).save();
    });
    
    await Promise.all(notificationPromises);
    
    res.status(200).json({ 
      success: true, 
      message: 'Security alert sent to all users',
      affectedUsers: users.length,
      alertId: securityLog._id
    });
  } catch (error) {
    console.error('Error sending security alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending security alert', 
      error: error.message 
    });
  }
};

// Mark a security alert as resolved
const resolveSecurityAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // Find and update the security log
    const securityLog = await SecurityLog.findById(alertId);
    
    if (!securityLog) {
      return res.status(404).json({ success: false, message: 'Security alert not found' });
    }
    
    // Only update if this is an active alert
    if (securityLog.isActive) {
      securityLog.isActive = false;
      securityLog.details += ' [RESOLVED]';
      await securityLog.save();
      
      // Create a resolution log
      // Safely get admin info from req.user (might be null if token expired)
      const admin = (req.user && (req.user.email || req.user.name)) ?
        (req.user.email || req.user.name) : 'Administrator';
      const realIP = getRealIP(req);
      // Admin actions always show "Local Machine"
      const location = getLocationFromIP(realIP, 'admin');

      const resolutionLog = new SecurityLog({
        event: 'Security Alert Resolved',
        user: admin,
        ip: realIP,
        location: location,
        severity: 'info',
        details: `Security alert ${alertId} resolved by ${admin}`,
        relatedAlertId: alertId
      });
      
      await resolutionLog.save();
      
      // Find all notifications related to this alert and mark them as read
      await Notification.updateMany(
        { 'data.alertId': alertId },
        { 
          $set: { 
            read: true,
            'data.requiresAction': false,
            'data.resolved': true,
            'data.resolvedAt': new Date(),
            'data.resolvedBy': admin,
            message: securityLog.details + ' [RESOLVED: System is now safe]'
          }
        }
      );
      
      // Send a resolution notification to all users
      const users = await User.find({ 
        role: { $in: ['doctor', 'patient'] },
        status: 'active' 
      });
      
      const notificationPromises = users.map(user => {
        return new Notification({
          userId: user._id,
          title: '✅ Security Alert Resolved',
          message: 'The security concern has been resolved. It is now safe to use the system.',
          type: 'success',
          data: {
            resolvedAlertId: alertId,
            timestamp: new Date()
          }
        }).save();
      });
      
      await Promise.all(notificationPromises);
      
      res.status(200).json({ 
        success: true, 
        message: 'Security alert marked as resolved',
        affectedUsers: users.length
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'This alert has already been resolved' 
      });
    }
  } catch (error) {
    console.error('Error resolving security alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resolving security alert', 
      error: error.message 
    });
  }
};

// Send "Security Issue Solved" notification to all users
const sendSecurityIssueSolved = async (req, res) => {
  try {
    const { message } = req.body;
    const customMessage = message || 'All security issues have been resolved. The system is now safe and secure to use.';

    // Get all users to send notifications
    const allUsers = await User.find({});

    if (allUsers.length === 0) {
      return res.status(404).json({ message: 'No users found to notify' });
    }

    // Send notification to all users
    const notificationPromises = allUsers.map(user => {
      return new Notification({
        userId: user._id,
        title: 'Security Issues Resolved ✅',
        message: customMessage,
        type: 'success',
        data: {
          type: 'security_resolved',
          timestamp: new Date().toISOString()
        }
      }).save();
    });

    await Promise.all(notificationPromises);
    console.log(`Sent security resolution notifications to ${allUsers.length} users`);

    // Create a security log entry
    try {
      const realIP = getRealIP(req);
      // Admin actions always show "Local Machine"
      const location = getLocationFromIP(realIP, 'admin');

      // Safely get admin info from req.user
      const admin = (req.user && (req.user.email || req.user.name)) ?
        (req.user.email || req.user.name) : 'Administrator';

      const securityLog = new SecurityLog({
        event: 'Security Issues Resolved Notification',
        user: admin,
        ip: realIP,
        location: location,
        severity: 'info',
        details: `Admin ${admin} sent security resolution notification to all users: ${customMessage}`,
        isActive: false
      });

      await securityLog.save();
    } catch (logError) {
      console.error('Error creating security log:', logError);
      // Don't fail the notification if logging fails
    }

    res.json({
      message: 'Security resolution notification sent successfully',
      usersNotified: allUsers.length,
      notificationMessage: customMessage
    });
  } catch (error) {
    console.error('Error sending security resolution notification:', error);
    res.status(500).json({ message: 'Error sending security resolution notification', error: error.message });
  }
};

// Export security logs to CSV
const exportSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ timestamp: -1 });

    // Create CSV header
    const csvHeader = 'Timestamp,Event,User,IP Address,Location,Severity,Details,Status\n';

    // Convert logs to CSV format
    const csvData = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const event = `"${log.event.replace(/"/g, '""')}"`;
      const user = `"${log.user.replace(/"/g, '""')}"`;
      const ip = log.ip;
      const location = `"${log.location.replace(/"/g, '""')}"`;
      const severity = log.severity;
      const details = `"${log.details.replace(/"/g, '""')}"`;
      const status = log.isActive ? 'Active Alert' : 'Resolved';

      return `${timestamp},${event},${user},${ip},${location},${severity},${details},${status}`;
    }).join('\n');

    const csvContent = csvHeader + csvData;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="security-logs.csv"');
    res.setHeader('Content-Length', Buffer.byteLength(csvContent));

    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting security logs:', error);
    res.status(500).json({ message: 'Error exporting security logs', error: error.message });
  }
};

module.exports = {
  getAllSecurityLogs,
  getSecurityLogsBySeverity,
  getSecurityLogsByTimeRange,
  addSecurityLog,
  getSecurityStats,
  sendSecurityAlert,
  resolveSecurityAlert,
  sendSecurityIssueSolved,
  exportSecurityLogs
};
