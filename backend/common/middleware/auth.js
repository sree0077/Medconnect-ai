const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log(`Auth check for ${req.method} ${req.originalUrl}`);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided in request");
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];
  console.log(`Token provided: ${token.substring(0, 15)}...`);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token decoded for user: ${decoded.userId}, role: ${decoded.role}`);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log(`User not found: ${decoded.userId}`);
      return res.status(401).json({ message: "User not found" });
    }

    // Enhanced debug logging for doctor status checks
    if (user.role === 'doctor') {
      console.log(`Doctor ${user.name} (${user._id}) attempted access with status: ${user.status}`);
      // Additional check for doctor status - they must be active
      if (user.status !== 'active') {
        console.log(`BLOCKING doctor ${user.name} due to non-active status: ${user.status}`);
        return res.status(403).json({ 
          message: "Access denied. Your account is not active. Please contact admin for assistance.",
          status: user.status
        });
      }
    }

    console.log(`User authenticated: ${user.name}, role: ${user.role}`);
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Not authorized for this role" });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole }; 