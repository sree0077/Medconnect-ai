const Prescription = require("../models/Prescription");
const User = require("../models/User");
const { createPrescriptionNotification, createNotification } = require('./notificationController');

const addPrescription = async (req, res) => {
  const { patientId, diagnosis, medicines, advice } = req.body;

  console.log('Prescription request data:', { patientId, diagnosis, medicines, advice });
  console.log('Doctor ID from req.user:', req.user._id);

  try {    const newPresc = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      diagnosis,
      medicines,
      advice
    });
    console.log('Prescription created successfully:', newPresc);
      // Create notification for both patient and doctor about new prescription
    try {
      const doctor = await User.findById(req.user._id);
      const patient = await User.findById(patientId);
      const doctorName = doctor.name;
      const patientName = patient.name;
      const doctorId = doctor._id;
      
      const prescriptionDetails = {
        diagnosis,
        medicines: medicines.map(med => med.name).join(', '),
        date: new Date().toISOString().split('T')[0]
      };
      
      // Notification for patient
      await createPrescriptionNotification(
        patientId, 
        doctorName, 
        prescriptionDetails
      );
      
      // Notification for doctor
      await createNotification(
        doctorId,
        'Prescription Created',
        `You have created a new prescription for ${patientName}`,
        'prescription',
        {
          patientName,
          prescriptionDetails
        }
      );
      
      console.log('Prescription notifications created for both patient and doctor');
    } catch (notificationError) {
      console.error('Error creating prescription notification:', notificationError);
      // Don't fail the prescription creation if notification fails
    }
    
    res.status(201).json(newPresc);
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ error: "Failed to create prescription", details: err.message });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load prescriptions" });
  }
};

const getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user._id })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching doctor's prescriptions" });
  }
};

const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching all prescriptions:', err);
    res.status(500).json({ error: "Failed to load all prescriptions", details: err.message });
  }
};

module.exports = {
  addPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getAllPrescriptions
};