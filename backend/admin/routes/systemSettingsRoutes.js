const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../common/middleware/auth');
const {
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings
} = require('../controllers/systemSettingsController');

// Middleware to ensure only admins can access system settings
const ensureAdminAccess = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admins only.' 
    });
  }
  next();
};

// Get system settings
// GET /api/admin/settings
router.get('/', authenticateToken, ensureAdminAccess, getSystemSettings);

// Update system settings
// PUT /api/admin/settings
router.put('/', authenticateToken, ensureAdminAccess, updateSystemSettings);

// Reset system settings to defaults
// DELETE /api/admin/settings
router.delete('/', authenticateToken, ensureAdminAccess, resetSystemSettings);

module.exports = router;
