const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { createAppointmentNotification, createNotification } = require('./notificationController');

// Utility function to auto-expire pending appointments
const autoExpirePendingAppointments = async () => {
  try {
    const now = new Date();

    // Find all pending appointments
    const pendingAppointments = await Appointment.find({ status: 'pending' });

    const expiredAppointments = [];

    for (const appointment of pendingAppointments) {
      // Parse appointment date and time
      const appointmentDate = new Date(appointment.date);
      const [hours, minutes] = appointment.time.split(':').map(Number);

      // Set the appointment datetime
      appointmentDate.setHours(hours, minutes, 0, 0);

      // Add 2-hour grace period
      const gracePeriodEnd = new Date(appointmentDate.getTime() + (2 * 60 * 60 * 1000));

      // Check if grace period has passed
      if (now > gracePeriodEnd) {
        expiredAppointments.push(appointment._id);
      }
    }

    // Update expired appointments to 'rejected' status
    if (expiredAppointments.length > 0) {
      await Appointment.updateMany(
        { _id: { $in: expiredAppointments } },
        { status: 'rejected' }
      );

      console.log(`Auto-expired ${expiredAppointments.length} pending appointments`);

      // Create notifications for expired appointments
      for (const appointmentId of expiredAppointments) {
        try {
          const appointment = await Appointment.findById(appointmentId)
            .populate('patientId', 'name')
            .populate('doctorId', 'name');

          if (appointment) {
            // Notify patient
            await createNotification(
              appointment.patientId._id,
              'Appointment Auto-Expired',
              `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.time} has been automatically cancelled due to no response from the doctor.`,
              'appointment',
              {
                doctorName: appointment.doctorId.name,
                appointmentDate: appointment.date,
                appointmentTime: appointment.time,
                status: 'auto-expired'
              }
            );
          }
        } catch (notificationError) {
          console.error('Error creating auto-expiry notification:', notificationError);
        }
      }
    }

    return expiredAppointments.length;
  } catch (error) {
    console.error('Error in autoExpirePendingAppointments:', error);
    return 0;
  }
};

const bookAppointment = async (req, res) => {
  const { doctorId, date, time, type = 'consultation' } = req.body;
  const patientId = req.user._id; // Using _id from authenticated user

  try {
    // Validate doctor exists and is a doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(400).json({ error: "Invalid doctor ID" });
    }

    // Check for existing appointment at same time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'rejected' } // Exclude rejected appointments
    });

    if (existingAppointment) {
      return res.status(400).json({ error: "Time slot not available" });
    }

    const appt = await Appointment.create({ doctorId, patientId, date, time, type });

    // Populate doctor details
    const populatedAppt = await Appointment.findById(appt._id)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');    // Create notification for both doctor and patient
    try {
      const patient = await User.findById(patientId);
      const doctor = await User.findById(doctorId);
      
      // Notification for doctor
      await createAppointmentNotification(
        doctorId,
        patient.name,
        date,
        time,
        'new'
      );
      
      // Notification for patient
      await createNotification(
        patientId,
        'Appointment Requested',
        `You have requested an appointment with Dr. ${doctor.name} for ${date} at ${time}`,
        'appointment',
        {
          doctorName: doctor.name,
          appointmentDate: date,
          appointmentTime: time,
          status: 'requested'
        }
      );
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the appointment booking if notification fails
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppt
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Appointment booking failed" });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    // Auto-expire pending appointments before fetching
    await autoExpirePendingAppointments();

    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Error fetching appointments" });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    // Auto-expire pending appointments before fetching
    await autoExpirePendingAppointments();

    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Error fetching doctor appointments" });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Verify the appointment belongs to this doctor
    const appointment = await Appointment.findOne({ 
      _id: id, 
      doctorId: req.user._id 
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }    const updated = await Appointment.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).populate('doctorId', 'name email')
     .populate('patientId', 'name email');
      // Send notifications to both patient and doctor about appointment status update
    try {
      const patientId = updated.patientId._id;
      const doctorId = updated.doctorId._id;
      const doctorName = updated.doctorId.name;
      const patientName = updated.patientId.name;
      const appointmentDate = updated.date;
      const appointmentTime = updated.time;
      
      // Create different notifications based on status
      if (status === 'accepted') {
        // Notification for patient
        await createNotification(
          patientId,
          'Appointment Confirmed',
          `Your appointment with Dr. ${doctorName} for ${appointmentDate} at ${appointmentTime} has been confirmed`,
          'appointment',
          {
            doctorName,
            appointmentDate,
            appointmentTime,
            status
          }
        );
        
        // Notification for doctor
        await createNotification(
          doctorId,
          'Appointment Confirmed',
          `You have confirmed the appointment with ${patientName} for ${appointmentDate} at ${appointmentTime}`,
          'appointment',
          {
            patientName,
            appointmentDate,
            appointmentTime,
            status
          }
        );
      } else if (status === 'rejected') {
        // Notification for patient
        await createNotification(
          patientId,
          'Appointment Rejected',
          `Your appointment request with Dr. ${doctorName} for ${appointmentDate} at ${appointmentTime} has been declined`,
          'appointment',
          {
            doctorName,
            appointmentDate,
            appointmentTime,
            status
          }
        );
        
        // Notification for doctor
        await createNotification(
          doctorId,
          'Appointment Rejected',
          `You have declined the appointment with ${patientName} for ${appointmentDate} at ${appointmentTime}`,
          'appointment',
          {
            patientName,
            appointmentDate,
            appointmentTime,
            status
          }
        );
      }
    } catch (notificationError) {
      console.error('Error creating appointment status notification:', notificationError);
      // Don't fail the appointment update if notification fails
    }

    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Status update failed" });
  }
};

// Get all appointments for admin dashboard
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email phone')
      .sort({ date: -1, time: 1 });
    
    res.json(appointments);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Error fetching all appointments" });
  }
};

// Patient cancellation function
const cancelPatientAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    // Verify the appointment belongs to this patient and is in pending status
    const appointment = await Appointment.findOne({
      _id: id,
      patientId: req.user._id,
      status: 'pending' // Only allow cancellation of pending appointments
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or cannot be cancelled" });
    }

    // Update appointment status to cancelled
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    ).populate('doctorId', 'name email')
     .populate('patientId', 'name email');

    // Send notification to doctor about patient cancellation
    try {
      const doctorId = updated.doctorId._id;
      const patientName = updated.patientId.name;
      const appointmentDate = updated.date;
      const appointmentTime = updated.time;

      await createNotification(
        doctorId,
        'Appointment Cancelled by Patient',
        `${patientName} has cancelled their appointment scheduled for ${appointmentDate} at ${appointmentTime}`,
        'appointment',
        {
          patientName,
          appointmentDate,
          appointmentTime,
          status: 'cancelled'
        }
      );
    } catch (notificationError) {
      console.error('Error creating cancellation notification:', notificationError);
      // Don't fail the cancellation if notification fails
    }

    res.json({
      message: "Appointment cancelled successfully",
      appointment: updated
    });
  } catch (err) {
    console.error("Cancellation error:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllAppointments,
  autoExpirePendingAppointments,
  cancelPatientAppointment
};