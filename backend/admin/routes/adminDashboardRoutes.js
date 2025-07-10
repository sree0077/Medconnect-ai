const express = require('express');
const { authenticateToken } = require('../../common/middleware/auth');
const allowRoles = require('../../common/middleware/role');
const User = require('../../common/models/User');
const Appointment = require('../../common/models/Appointment');
const { getDashboardOverview } = require('../controllers/dashboardController');

const router = express.Router();

// Admin Dashboard Overview (new modern dashboard)
router.get('/overview', authenticateToken, allowRoles('admin'), getDashboardOverview);

// Admin Dashboard (legacy endpoint)
router.get('/dashboard', authenticateToken, allowRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const appointments = await Appointment.find();

    const statistics = {
      totalUsers: users.length,
      totalPatients: users.filter(user => user.role === 'patient').length,
      totalDoctors: users.filter(user => user.role === 'doctor').length,
      activeUsers: users.filter(user => user.status === 'active').length,
      pendingUsers: users.filter(user => user.status === 'pending').length,
      newUsersThisWeek: users.filter(user =>
        new Date(user.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };

    const systemStats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      averageAppointmentsPerDay: appointments.length / 30 // Assuming last 30 days
    };

    res.json({
      users,
      statistics,
      systemStats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Error fetching admin dashboard' });
  }
});

// Update user status (Admin only)
router.patch('/users/:userId/status', authenticateToken, allowRoles('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

module.exports = router;
