const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const {
  bookAppointment,
  getPatientAppointments
} = require("../../common/controllers/appointmentController");

router.post("/book", authenticateToken, allowRoles("patient"), bookAppointment);
router.get("/patient", authenticateToken, allowRoles("patient"), getPatientAppointments);

module.exports = router;
