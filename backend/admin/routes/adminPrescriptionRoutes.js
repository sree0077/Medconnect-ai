const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../common/middleware/auth");
const allowRoles = require("../../common/middleware/role");
const {
  getAllPrescriptions
} = require("../../common/controllers/prescriptionController");

router.get("/all", authenticateToken, allowRoles("admin"), getAllPrescriptions);

module.exports = router;
