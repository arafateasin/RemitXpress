const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ error: "Invalid token or user not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid token." });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Access denied. Admin privileges required." });
  }
  next();
};

const kycMiddleware = (req, res, next) => {
  if (req.user.kycStatus !== "approved") {
    return res.status(403).json({
      error: "KYC verification required.",
      kycStatus: req.user.kycStatus,
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, kycMiddleware };
