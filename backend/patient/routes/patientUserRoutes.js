const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const { getActiveDoctors, updateUserProfile, getUserProfile, deleteUserAccount } = require('../../admin/controllers/userController');

// Route to get only active doctors for patients booking appointments
router.get('/doctors', authenticateToken, getActiveDoctors);

// Get user profile
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, updateUserProfile);

// Delete user account
router.delete('/profile', authenticateToken, deleteUserAccount);

module.exports = router;
