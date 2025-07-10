const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { createAppointmentNotification, createNotification } = require('./notificationController');

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

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAllAppointments
};