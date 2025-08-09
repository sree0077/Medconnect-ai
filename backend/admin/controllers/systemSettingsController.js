const SystemSettings = require('../../common/models/SystemSettings');

/**
 * Get system settings
 * GET /api/admin/settings
 */
const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    
    // Remove sensitive metadata from response
    const settingsResponse = {
      platformName: settings.platformName,
      supportEmail: settings.supportEmail,
      timezone: settings.timezone,
      maintenanceMode: settings.maintenanceMode,
      twoFactorAuth: settings.twoFactorAuth,
      sessionTimeout: settings.sessionTimeout,
      passwordPolicy: settings.passwordPolicy,
      loginAttempts: settings.loginAttempts,
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      systemAlerts: settings.systemAlerts,
      doctorApprovalNotifs: settings.doctorApprovalNotifs,
      aiResponseTime: settings.aiResponseTime,
      confidenceThreshold: settings.confidenceThreshold,
      autoLearnEnabled: settings.autoLearnEnabled,
      debugMode: settings.debugMode,
      version: settings.version,
      lastUpdated: settings.updatedAt
    };
    
    res.json(settingsResponse);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message 
    });
  }
};

/**
 * Update system settings
 * PUT /api/admin/settings
 */
const updateSystemSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const updateData = req.body;
    
    // Validate required fields
    const allowedFields = [
      'platformName', 'supportEmail', 'timezone', 'maintenanceMode',
      'twoFactorAuth', 'sessionTimeout', 'passwordPolicy', 'loginAttempts',
      'emailNotifications', 'smsNotifications', 'systemAlerts', 'doctorApprovalNotifs',
      'aiResponseTime', 'confidenceThreshold', 'autoLearnEnabled', 'debugMode'
    ];
    
    // Filter out any fields that aren't allowed
    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        filteredData[field] = updateData[field];
      }
    }
    
    // Validate email format if provided
    if (filteredData.supportEmail) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(filteredData.supportEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format for support email'
        });
      }
    }
    
    // Validate numeric ranges
    if (filteredData.sessionTimeout !== undefined) {
      if (filteredData.sessionTimeout < 5 || filteredData.sessionTimeout > 480) {
        return res.status(400).json({
          success: false,
          message: 'Session timeout must be between 5 and 480 minutes'
        });
      }
    }
    
    if (filteredData.loginAttempts !== undefined) {
      if (filteredData.loginAttempts < 3 || filteredData.loginAttempts > 10) {
        return res.status(400).json({
          success: false,
          message: 'Login attempts must be between 3 and 10'
        });
      }
    }
    
    if (filteredData.aiResponseTime !== undefined) {
      if (filteredData.aiResponseTime < 1 || filteredData.aiResponseTime > 30) {
        return res.status(400).json({
          success: false,
          message: 'AI response time must be between 1 and 30 seconds'
        });
      }
    }
    
    if (filteredData.confidenceThreshold !== undefined) {
      if (filteredData.confidenceThreshold < 50 || filteredData.confidenceThreshold > 100) {
        return res.status(400).json({
          success: false,
          message: 'Confidence threshold must be between 50 and 100'
        });
      }
    }
    
    // Validate password policy
    if (filteredData.passwordPolicy !== undefined) {
      if (!['basic', 'strong', 'strict'].includes(filteredData.passwordPolicy)) {
        return res.status(400).json({
          success: false,
          message: 'Password policy must be basic, strong, or strict'
        });
      }
    }
    
    const updatedSettings = await SystemSettings.updateSettings(filteredData, userId);
    
    // Return success response
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        platformName: updatedSettings.platformName,
        supportEmail: updatedSettings.supportEmail,
        timezone: updatedSettings.timezone,
        maintenanceMode: updatedSettings.maintenanceMode,
        twoFactorAuth: updatedSettings.twoFactorAuth,
        sessionTimeout: updatedSettings.sessionTimeout,
        passwordPolicy: updatedSettings.passwordPolicy,
        loginAttempts: updatedSettings.loginAttempts,
        emailNotifications: updatedSettings.emailNotifications,
        smsNotifications: updatedSettings.smsNotifications,
        systemAlerts: updatedSettings.systemAlerts,
        doctorApprovalNotifs: updatedSettings.doctorApprovalNotifs,
        aiResponseTime: updatedSettings.aiResponseTime,
        confidenceThreshold: updatedSettings.confidenceThreshold,
        autoLearnEnabled: updatedSettings.autoLearnEnabled,
        debugMode: updatedSettings.debugMode,
        version: updatedSettings.version,
        lastUpdated: updatedSettings.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update system settings',
      error: error.message 
    });
  }
};

/**
 * Reset system settings to defaults
 * DELETE /api/admin/settings
 */
const resetSystemSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const defaultSettings = await SystemSettings.resetToDefaults(userId);
    
    res.json({
      success: true,
      message: 'Settings reset to default values successfully',
      data: {
        platformName: defaultSettings.platformName,
        supportEmail: defaultSettings.supportEmail,
        timezone: defaultSettings.timezone,
        maintenanceMode: defaultSettings.maintenanceMode,
        twoFactorAuth: defaultSettings.twoFactorAuth,
        sessionTimeout: defaultSettings.sessionTimeout,
        passwordPolicy: defaultSettings.passwordPolicy,
        loginAttempts: defaultSettings.loginAttempts,
        emailNotifications: defaultSettings.emailNotifications,
        smsNotifications: defaultSettings.smsNotifications,
        systemAlerts: defaultSettings.systemAlerts,
        doctorApprovalNotifs: defaultSettings.doctorApprovalNotifs,
        aiResponseTime: defaultSettings.aiResponseTime,
        confidenceThreshold: defaultSettings.confidenceThreshold,
        autoLearnEnabled: defaultSettings.autoLearnEnabled,
        debugMode: defaultSettings.debugMode,
        version: defaultSettings.version,
        lastUpdated: defaultSettings.updatedAt
      }
    });
  } catch (error) {
    console.error('Error resetting system settings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reset system settings',
      error: error.message 
    });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings
};
