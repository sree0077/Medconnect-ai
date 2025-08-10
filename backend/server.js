require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./common/config/db");

// Common routes
const authRoutes = require("./common/routes/authRoutes");
const aiRoutes = require("./common/routes/aiRoutes");
const notificationRoutes = require("./common/routes/notificationRoutes");
const subscriptionRoutes = require("./common/routes/subscriptionRoutes");
const usageRoutes = require("./common/routes/usageRoutes");
const webhookRoutes = require("./common/routes/webhookRoutes");
const adminPlanRoutes = require("./common/routes/adminPlanRoutes");

// Admin routes
const adminDashboardRoutes = require("./admin/routes/adminDashboardRoutes");
const adminUserRoutes = require("./admin/routes/adminUserRoutes");
const adminAppointmentRoutes = require("./admin/routes/adminAppointmentRoutes");
const adminPrescriptionRoutes = require("./admin/routes/adminPrescriptionRoutes");
const securityLogRoutes = require("./admin/routes/securityLogRoutes");
const aiAnalyticsRoutes = require("./admin/routes/aiAnalyticsRoutes");
const systemSettingsRoutes = require("./admin/routes/systemSettingsRoutes");

// Doctor routes
const doctorDashboardRoutes = require("./doctor/routes/doctorDashboardRoutes");
const doctorUserRoutes = require("./doctor/routes/doctorUserRoutes");
const doctorAppointmentRoutes = require("./doctor/routes/doctorAppointmentRoutes");
const doctorPrescriptionRoutes = require("./doctor/routes/doctorPrescriptionRoutes");

// Patient routes
const patientDashboardRoutes = require("./patient/routes/patientDashboardRoutes");
const patientUserRoutes = require("./patient/routes/patientUserRoutes");
const patientAppointmentRoutes = require("./patient/routes/patientAppointmentRoutes");
const patientPrescriptionRoutes = require("./patient/routes/patientPrescriptionRoutes");
const aiHistoryRoutes = require("./patient/routes/aiHistoryRoutes");

// Set default JWT secret if not in environment
process.env.JWT_SECRET = process.env.JWT_SECRET || "858085";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Mount common routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/webhooks", webhookRoutes);

// Mount admin routes
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/admin", adminPlanRoutes);
app.use("/api", adminUserRoutes);  // This handles /api/users/* routes for admin
app.use("/api/appointments", adminAppointmentRoutes);
app.use("/api/prescriptions", adminPrescriptionRoutes);
app.use("/api/security-logs", securityLogRoutes);
app.use("/api/admin/ai-analytics", aiAnalyticsRoutes);
app.use("/api/admin/settings", systemSettingsRoutes);

// Mount doctor routes
app.use("/api/doctor", doctorDashboardRoutes);
app.use("/api", doctorUserRoutes);  // This handles doctor user operations
app.use("/api/appointments", doctorAppointmentRoutes);
app.use("/api/prescriptions", doctorPrescriptionRoutes);

// Mount patient routes
app.use("/api/patient", patientDashboardRoutes);
app.use("/api", patientUserRoutes);  // This handles patient user operations
app.use("/api/appointments", patientAppointmentRoutes);
app.use("/api/prescriptions", patientPrescriptionRoutes);
app.use("/api/patient/ai-history", aiHistoryRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Load seed data
const seedSecurityLogs = require('./common/config/seedSecurityLogs');

// Connect to MongoDB Atlas
connectDB().then(() => {
  // Seed security logs after successful connection
  seedSecurityLogs();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log("- POST /api/auth/login");
  console.log("- POST /api/auth/signup");
  console.log("- GET /api/test");
  console.log("- GET /api/patient/dashboard");
  console.log("- GET /api/doctor/dashboard");
  console.log("- GET /api/admin/dashboard");
  console.log("- POST /api/appointments/book");
  console.log("- GET /api/appointments/patient");
  console.log("- GET /api/appointments/doctor");
  console.log("- PUT /api/appointments/update-status/:id");
  console.log("- PUT /api/appointments/cancel/:id");
  console.log("- POST /api/prescriptions/add");
  console.log("- GET /api/prescriptions/patient");
  console.log("- GET /api/prescriptions/doctor");
  console.log("- POST /api/ai/symptom");
});
