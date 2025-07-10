const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const {
  getAllAppointments
} = require("../../common/controllers/appointmentController");

router.get("/all", authenticateToken, allowRoles("admin"), getAllAppointments);

module.exports = router;
