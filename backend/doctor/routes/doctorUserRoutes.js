const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const { updateUserProfile, getUserProfile, deleteUserAccount } = require('../../admin/controllers/userController');
const User = require('../../common/models/User');

// Search users by name and role (doctor access for finding patients)
router.get('/users/search', authenticateToken, allowRoles('doctor'), async (req, res) => {
  try {
    const { query, role } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      name: { $regex: query, $options: 'i' },
      role: role || 'patient'
    })
    .select('name email')
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Get user by ID (for doctor to view patient details)
router.get('/users/:id', authenticateToken, allowRoles('doctor'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email phone specialization');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, updateUserProfile);

// Delete user account
router.delete('/profile', authenticateToken, deleteUserAccount);

module.exports = router;
