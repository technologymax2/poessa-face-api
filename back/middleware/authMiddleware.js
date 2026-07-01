const jwt = require("jsonwebtoken");
const FaceUser = require("../models/FaceUser");

const allowTempLogin = process.env.ALLOW_TEMP_LOGIN === "true";

const devUser = {
  _id: "000000000000000000000001",
  firstName: "Temporary",
  lastName: "Admin",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  isActive: true,
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    // Temporary development bypass
    if (allowTempLogin && (!token || token === "temporary-token")) {
      req.user = devUser;
      return next();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await FaceUser.findById(decoded.id).select("-password");

    if (!user) {
      if (allowTempLogin) {
        req.user = devUser;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is disabled.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (allowTempLogin) {
      req.user = devUser;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
