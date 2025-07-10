const express = require('express');
const { authenticateToken } = require('../../common/middleware/auth');
const allowRoles = require('../../common/middleware/role');
const User = require('../../common/models/User');
const Appointment = require('../../common/models/Appointment');

const router = express.Router();

// Patient Dashboard
router.get('/dashboard', authenticateToken, allowRoles('patient'), async (req, res) => {
  try {
    console.log('Patient dashboard request from user:', req.user);
    const userId = req.user._id || req.user.id;
    console.log('Looking for user with ID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Found user:', user.name);

    const appointments = await Appointment.find({ patientId: userId })
      .populate('doctorId', 'name')
      .sort({ date: 1, time: 1 });
    console.log('Found appointments:', appointments.length);

    const today = new Date();
    const upcomingAppointments = appointments.filter(apt =>
      new Date(apt.date) >= today && apt.status !== 'cancelled'
    );
    const pastAppointments = appointments.filter(apt =>
      new Date(apt.date) < today || apt.status === 'completed'
    );

    const response = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        medicalHistory: user.medicalHistory || []
      },
      appointments,
      upcomingAppointments,
      pastAppointments
    };

    console.log('Sending patient dashboard response');
    res.json(response);
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({ message: 'Error fetching patient dashboard', error: error.message });
  }
});

module.exports = router;
