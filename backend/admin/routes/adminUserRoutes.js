const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const { getDoctors, updateUserStatus, getAllUsers } = require('../controllers/userController');
const User = require('../../common/models/User');

// Route to get all doctors for admin approval (requires authentication)
router.get('/users/doctors', authenticateToken, allowRoles('admin'), getDoctors);

// Admin: Get all users for user management
router.get('/users', authenticateToken, allowRoles('admin'), getAllUsers);

// Update user by ID (for admin approval/rejection)
router.put('/users/:id', authenticateToken, allowRoles('admin'), updateUserStatus);

// Search users by name and role (admin access)
router.get('/users/search', authenticateToken, allowRoles('admin'), async (req, res) => {
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

// Admin: Delete user by ID
router.delete('/users/:id', authenticateToken, allowRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Import models here to avoid circular dependencies
    const Appointment = require('../../common/models/Appointment');
    const Prescription = require('../../common/models/Prescription');
    const Notification = require('../../common/models/Notification');
    const SecurityLog = require('../../common/models/SecurityLog');
    const { createNotification } = require('../../common/controllers/notificationController');
    const { getLocationFromIP, getRealIP } = require('../../common/utils/geolocation');

    // Get user info before deletion for notification
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all related data
    await Promise.all([
      Appointment.deleteMany({
        $or: [{ patientId: id }, { doctorId: id }]
      }),
      Prescription.deleteMany({
        $or: [{ patientId: id }, { doctorId: id }]
      }),
      Notification.deleteMany({ userId: id })
    ]);

    // Delete the user account
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log user deletion with admin location
    try {
      const realIP = getRealIP(req);
      const location = getLocationFromIP(realIP, 'admin'); // Admin always shows "Local Machine"
      const adminName = req.user.name || 'Admin';

      await new SecurityLog({
        event: 'User Account Deleted',
        user: adminName,
        ip: realIP,
        location: location,
        severity: 'warning',
        details: `Admin ${adminName} deleted ${userToDelete.role} account: ${userToDelete.name} (${userToDelete.email})`
      }).save();
    } catch (logError) {
      console.error('Error logging user deletion:', logError);
    }

    // Notify all admins about user deletion
    try {
      const adminUsers = await User.find({ role: 'admin' });
      const adminName = req.user.name || 'Admin';

      const notificationPromises = adminUsers.map(admin => {
        const title = userToDelete.role === 'doctor' ? '🗑️ Doctor Account Deleted' : '🗑️ User Account Deleted';
        const message = `${adminName} deleted ${userToDelete.role} account: ${userToDelete.name} (${userToDelete.email})`;

        return createNotification(admin._id, title, message, 'warning', {
          deletedUserId: userToDelete._id,
          deletedUserName: userToDelete.name,
          deletedUserEmail: userToDelete.email,
          deletedUserRole: userToDelete.role,
          deletedBy: adminName,
          deletedAt: new Date()
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Notified ${adminUsers.length} admin(s) of user deletion: ${userToDelete.name}`);
    } catch (notificationError) {
      console.error('Error sending admin notification for user deletion:', notificationError);
      // Don't fail the deletion if notification fails
    }

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
  } catch (err) {
    console.error('Error deleting user account:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
