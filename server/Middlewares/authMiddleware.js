const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const auth = (allowedRoles = []) => async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed", success: false });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Fetch user and attach to req
    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user && user.status !== 'active' ) {
      return res.status(401).json({ message: "User is not active" });
    }

    // If roles are specified, check if the user has one of the required roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Permission Denied" });
    }

    const lastActiveTime = moment().tz(timeZone).toDate();
    await User.findByIdAndUpdate(user._id, { lastActive: lastActiveTime });

    // ✅ Inject latest lastActive into response headers (optional)
    res.setHeader("X-Last-Active", lastActiveTime.toISOString());

    req.user = user;

    next();
  } catch (err) {
    console.error("Error in auth middleware:", err.message);
    return res.status(401).json({ message: "Token validation failed" });
  }
};

module.exports = auth;
