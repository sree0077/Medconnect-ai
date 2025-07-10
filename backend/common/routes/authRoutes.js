const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { logLogout } = require("../middleware/securityLogger");
const { authenticateToken } = require("../middleware/auth");

router.post("/signup", registerUser); // POST /api/auth/signup
router.post("/login", loginUser);     // POST /api/auth/login (security logging handled in controller)
router.post("/logout", authenticateToken, logLogout, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// Token validation endpoint for frontend session checks
router.get("/validate", authenticateToken, (req, res) => {
  // If we reach here, the token is valid (authenticateToken middleware passed)
  res.json({
    valid: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status
    }
  });
});

module.exports = router; 