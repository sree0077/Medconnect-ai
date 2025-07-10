const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createNotification } = require("./notificationController");
const SecurityLog = require("../models/SecurityLog");
const { getLocationFromIP, getRealIP } = require("../utils/geolocation");

// Register
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    // Set appropriate default status based on role
    // Doctors should be 'pending' until approved by admin
    const status = role === 'doctor' ? 'pending' : 'active';
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status
    });

    // Log user registration with role-based location
    try {
      const realIP = getRealIP(req);
      const location = getLocationFromIP(realIP, role);
      console.log(`[REGISTRATION] New ${role} registration location: ${location}`);

      await new SecurityLog({
        event: 'User Registration',
        user: name,
        ip: realIP,
        location: location,
        severity: 'info',
        details: `New ${role} account created: ${name} (${email})`
      }).save();
    } catch (logError) {
      console.error('Error logging user registration:', logError);
    }

    // Notify admin of new user registration
    try {
      // Find all admin users
      const adminUsers = await User.find({ role: 'admin' });

      // Create notifications for all admins
      const notificationPromises = adminUsers.map(admin => {
        const title = role === 'doctor' ? '👨‍⚕️ New Doctor Registration' : '👤 New User Registration';
        const message = role === 'doctor'
          ? `Dr. ${name} has registered and is pending approval. Please review their credentials.`
          : `${name} has registered as a ${role}. Account is now active.`;

        return createNotification(admin._id, title, message, 'info', {
          userId: user._id,
          userRole: role,
          userName: name,
          userEmail: email,
          requiresAction: role === 'doctor'
        });
      });

      await Promise.all(notificationPromises);
      console.log(`Notified ${adminUsers.length} admin(s) of new ${role} registration: ${name}`);
    } catch (notificationError) {
      console.error('Error sending admin notification for new user:', notificationError);
      // Don't fail the registration if notification fails
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`[LOGIN] Login attempt for email: ${email}`);

    // Get real IP for security logging
    const realIP = getRealIP(req);
    console.log(`[LOGIN] IP: ${realIP}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN] Login failed: User with email ${email} not found`);

      // Log failed login attempt (no user role available, so show real location)
      const location = getLocationFromIP(realIP);
      try {
        await new SecurityLog({
          event: 'Failed Login Attempt',
          user: email,
          ip: realIP,
          location: location,
          severity: 'warning',
          details: `Login attempt with non-existent email: ${email}`
        }).save();
      } catch (logError) {
        console.error('Error logging failed login attempt:', logError);
      }

      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log(`[LOGIN] User found: ${user.name}, role: ${user.role}, status: ${user.status}`);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN] Login failed: Incorrect password for ${email}`);

      // Log failed login attempt with role-based location
      const location = getLocationFromIP(realIP, user.role);
      console.log(`[LOGIN] Failed login location for ${user.role}: ${location}`);
      try {
        await new SecurityLog({
          event: 'Failed Login Attempt',
          user: user.name || email,
          ip: realIP,
          location: location,
          severity: 'warning',
          details: `Incorrect password attempt for user: ${user.name} (${email})`
        }).save();
      } catch (logError) {
        console.error('Error logging failed login attempt:', logError);
      }

      return res.status(401).json({ error: "Incorrect password" });
    }
    
    // Check user's status - this is critical for access control (for all user types)
    console.log(`[LOGIN] User login attempt - status is: ${user.status}`);
    
    if (user.status !== 'active') {
      // Block non-active users from logging in
      console.log(`[LOGIN] BLOCKING user ${user._id} (${user.role}) - status is: ${user.status}`);

      if (user.status === 'pending') {
        // Log pending login attempt with role-based location
        const location = getLocationFromIP(realIP, user.role);
        console.log(`[LOGIN] Pending login location for ${user.role}: ${location}`);
        try {
          await new SecurityLog({
            event: 'Pending Account Login Attempt',
            user: user.name,
            ip: realIP,
            location: location,
            severity: user.role === 'doctor' ? 'warning' : 'info',
            details: `${user.role === 'doctor' ? 'Doctor' : 'User'} ${user.name} attempted to login with pending account status`
          }).save();
        } catch (logError) {
          console.error('Error logging pending login attempt:', logError);
        }

        // Notify admin when a pending doctor tries to login
        if (user.role === 'doctor') {
          try {
            // Find all admin users
            const adminUsers = await User.find({ role: 'admin' });

            // Create notifications for all admins
            const notificationPromises = adminUsers.map(admin => {
              return createNotification(
                admin._id,
                '⏰ Doctor Approval Needed',
                `Dr. ${user.name} attempted to login but their account is still pending approval. Please review their application.`,
                'warning',
                {
                  userId: user._id,
                  userRole: user.role,
                  userName: user.name,
                  userEmail: user.email,
                  requiresAction: true,
                  actionType: 'doctor_approval'
                }
              );
            });

            await Promise.all(notificationPromises);
            console.log(`Notified ${adminUsers.length} admin(s) of pending doctor login attempt: ${user.name}`);
          } catch (notificationError) {
            console.error('Error sending admin notification for pending doctor login:', notificationError);
            // Don't fail the login response if notification fails
          }
        }

        return res.status(403).json({
          error: "Account pending approval",
          message: "Your account is waiting for admin approval. Please check back later."
        });
      } else {
        return res.status(403).json({
          error: "Account not approved",
          message: "Your account has not been approved or has been deactivated. Please contact support."
        });
      }
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Log successful login with role-based location
    const location = getLocationFromIP(realIP, user.role);
    console.log(`[LOGIN] Successful login location for ${user.role}: ${location}`);
    try {
      await new SecurityLog({
        event: 'Successful Login',
        user: user.name,
        ip: realIP,
        location: location,
        severity: 'info',
        details: `User ${user.name} (${user.role}) logged in successfully`
      }).save();
    } catch (logError) {
      console.error('Error logging successful login:', logError);
    }

    // Include the status in the response so the frontend is aware of it
    console.log(`Login successful for ${user.name}, role: ${user.role}, status: ${user.status}`);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { registerUser, loginUser }; 