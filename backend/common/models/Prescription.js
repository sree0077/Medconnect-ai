const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  diagnosis: { type: String, required: true },
  medicines: [{ type: String, required: true }],
  advice: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema); 