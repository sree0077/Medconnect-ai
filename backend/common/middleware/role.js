const allowRoles = (...roles) => {
  return (req, res, next) => {
    console.log(`Role check: User role ${req.user?.role}, allowed roles: ${roles.join(', ')}`);
    
    if (!req.user) {
      console.log('Role check failed: No authenticated user');
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`Role check failed: User role ${req.user.role} not in allowed roles`);
      return res.status(403).json({ message: "Access denied: Unauthorized role" });
    }
    
    console.log(`Role check passed for ${req.user.name}`);
    next();
  };
};

module.exports = allowRoles; 