const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const {
  getPatientPrescriptions
} = require("../../common/controllers/prescriptionController");

router.get("/patient", authenticateToken, allowRoles("patient"), getPatientPrescriptions);

module.exports = router;
