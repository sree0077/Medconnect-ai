const SecurityLog = require('../models/SecurityLog');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getLocationFromIP, getRealIP } = require('../utils/geolocation');

/**
 * Middleware to log security-related events
 */
const securityLogger = {
  /**
   * Log a login attempt
   */
  logLogin: async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const response = JSON.parse(data);
      const successful = response.token ? true : false;
      
      // Get the request IP
      const ip = 
        req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket?.remoteAddress || 
        '127.0.0.1';
      
      // Create the security log with realistic data only
      const securityLog = new SecurityLog({
        timestamp: new Date(),
        event: successful ? 'Successful Login' : 'Failed Login Attempt',
        user: req.body.email || 'unidentified user',
        ip: ip,
        location: req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'Unresolved',
        severity: successful ? 'info' : 'warning',
        details: successful ? `User login successful from ${ip}` : `Failed login attempt from ${ip}`
      });
      
      // Save the log asynchronously (don't await)
      securityLog.save().catch(err => {
        console.error('Error saving security log:', err);
      });
      
      // Continue with the original response
      originalSend.call(this, data);
    };
    
    next();
  },
  
  /**
   * Log password changes
   */
  logPasswordChange: async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only log password changes if successful
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (response.success || response.message?.includes('password')) {
        // Get the request IP
        const ip = 
          req.headers['x-forwarded-for'] || 
          req.connection.remoteAddress || 
          req.socket.remoteAddress || 
          req.connection.socket?.remoteAddress || 
          '127.0.0.1';
        
        // Create the security log with realistic data only
        const securityLog = new SecurityLog({
          timestamp: new Date(),
          event: 'Password Changed',
          user: req.user?.email || 'unidentified user',
          ip: ip,
          location: req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'Unresolved',
          severity: 'info',
          details: `Password changed from ${ip}`
        });
        
        // Save the log asynchronously
        securityLog.save().catch(err => {
          console.error('Error saving security log:', err);
        });
      }
      
      // Continue with the original response
      originalSend.call(this, data);
    };
    
    next();
  },
  
  /**
   * Log user logout events
   */
  logLogout: async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = async function(data) {
      // Get real IP
      const realIP = getRealIP(req);

      // Extract user info from token in auth header
      let user = 'unknown user';
      let userName = 'Unknown User';
      let userRole = null;
      try {
        if (req.user && req.user.name) {
          user = req.user.name;
          userName = req.user.name;
          userRole = req.user.role;
        } else if (req.user && req.user.email) {
          user = req.user.email;
          userName = req.user.email;
          userRole = req.user.role;
        } else if (req.body && req.body.email) {
          user = req.body.email;
          userName = req.body.email;
        } else if (req.headers.authorization) {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded && decoded.userId) {
            // Try to get user info if token is valid
            const userRecord = await User.findById(decoded.userId);
            if (userRecord) {
              user = userRecord.name || userRecord.email;
              userName = userRecord.name || userRecord.email;
              userRole = userRecord.role;
            }
          }
        }
      } catch (err) {
        console.log('Could not determine user from token during logout');
      }

      // Get location based on user role
      const location = getLocationFromIP(realIP, userRole);

      // Create the security log
      const securityLog = new SecurityLog({
        timestamp: new Date(),
        event: 'User Logout',
        user: userName,
        ip: realIP,
        location: location,
        severity: 'info',
        details: `User ${userName} logged out from ${location}`
      });
      
      // Save the log asynchronously
      securityLog.save().catch(err => {
        console.error('Error saving logout security log:', err);
      });
      
      // Continue with the original response
      originalSend.call(this, data);
    };
    
    next();
  },
  
  /**
   * Log sensitive data access
   */
  logSensitiveAccess: (dataType) => async (req, res, next) => {
    // Get the request IP
    const ip = 
      req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress || 
      req.connection.socket?.remoteAddress || 
      '127.0.0.1';
    
    // Create the security log with realistic data only
    const securityLog = new SecurityLog({
      timestamp: new Date(),
      event: `Data Access`,
      user: req.user?.email || 'unidentified user',
      ip: ip,
      location: req.headers['cf-ipcountry'] || req.headers['x-country-code'] || 'Unresolved',
      severity: 'info',
      details: `Accessed ${dataType} data from ${ip}`
    });
    
    // Save the log asynchronously
    securityLog.save().catch(err => {
      console.error('Error saving security log:', err);
    });
    
    next();
  }
};

module.exports = securityLogger;
