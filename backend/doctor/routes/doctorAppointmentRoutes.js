const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const {
  getDoctorAppointments,
  updateAppointmentStatus
} = require("../../common/controllers/appointmentController");

router.get("/doctor", authenticateToken, allowRoles("doctor"), getDoctorAppointments);
router.put("/update-status/:id", authenticateToken, allowRoles("doctor"), updateAppointmentStatus);

module.exports = router;
