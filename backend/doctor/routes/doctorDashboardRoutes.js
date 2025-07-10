const express = require('express');
const { authenticateToken } = require('../../common/middleware/auth');
const allowRoles = require('../../common/middleware/role');
const User = require('../../common/models/User');
const Appointment = require('../../common/models/Appointment');

const router = express.Router();

// Doctor Dashboard
router.get('/dashboard', authenticateToken, allowRoles('doctor'), async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const appointments = await Appointment.find({ doctorId: userId })
      .populate('patientId', 'name')
      .sort({ date: 1, time: 1 });

    console.log(`Found ${appointments.length} appointments for doctor ${userId}`);

    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    
    // More robust way to filter today's appointments comparing just the date part
    const todayAppointments = appointments.filter(apt => {
      if (!apt.date) return false;
      const appointmentDate = new Date(apt.date).toDateString();
      const todayDate = currentDate.toDateString();
      return appointmentDate === todayDate && 
             (apt.status === 'approved' || apt.status === 'pending');
    });
    
    const upcomingAppointments = appointments.filter(apt =>
      apt.date > today && (apt.status === 'approved' || apt.status === 'pending')
    );

    // Calculate unique patients using a Set
    const patientSet = new Set();
    appointments.forEach(apt => {
      if (apt.patientId) {
        // Handle both populated objects and simple IDs
        const patientId = typeof apt.patientId === 'object' && apt.patientId !== null 
          ? (apt.patientId._id ? apt.patientId._id.toString() : null)
          : apt.patientId.toString();
        
        if (patientId) {
          patientSet.add(patientId);
        }
      }
    });
    
    console.log('Unique patient IDs count:', patientSet.size);
    console.log('Unique patients from Set:', Array.from(patientSet));
    
    const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Calculate date 7 days from now for this week's appointments
    const oneWeekFromNow = new Date(currentDate);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const statistics = {
      totalPatients: patientSet.size,
      appointmentsToday: appointments.filter(apt => 
        new Date(apt.date).toDateString() === currentDate.toDateString() && 
        apt.status !== 'cancelled'
      ).length,
      appointmentsThisWeek: appointments.filter(apt =>
        new Date(apt.date) >= startOfToday && 
        new Date(apt.date) <= oneWeekFromNow && 
        apt.status !== 'cancelled'
      ).length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed' || apt.status === 'approved').length
    };

    // Log the final statistics before sending
    console.log('Doctor dashboard statistics:', statistics);
    
    res.json({
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: user.specialization || 'Not specified',
        experience: user.experience || 0,
        qualifications: user.qualifications || []
      },
      statistics,
      todayAppointments,
      upcomingAppointments
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({ message: 'Error fetching doctor dashboard' });
  }
});

module.exports = router;
