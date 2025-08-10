const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const { checkAppointmentLimit, trackAppointmentUsage } = require("../../common/middleware/usageTrackingMiddleware");
const {
  bookAppointment,
  getPatientAppointments,
  cancelPatientAppointment
} = require("../../common/controllers/appointmentController");

router.post("/book", authenticateToken, allowRoles("patient"), checkAppointmentLimit, trackAppointmentUsage, bookAppointment);
router.get("/patient", authenticateToken, allowRoles("patient"), getPatientAppointments);
router.put("/cancel/:id", authenticateToken, allowRoles("patient"), cancelPatientAppointment);

module.exports = router;
