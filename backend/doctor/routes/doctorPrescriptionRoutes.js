const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const {
  addPrescription,
  getDoctorPrescriptions
} = require("../../common/controllers/prescriptionController");

router.post("/add", authenticateToken, allowRoles("doctor"), addPrescription);
router.get("/doctor", authenticateToken, allowRoles("doctor"), getDoctorPrescriptions);

module.exports = router;
