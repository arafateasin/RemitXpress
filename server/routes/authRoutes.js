const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const Joi = require("joi");

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per window (increased for development)
  message: {
    error: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  deviceFingerprint: Joi.string().optional(),
});

const twoFactorSchema = Joi.object({
  userId: Joi.string().required(),
  token: Joi.string().length(6).pattern(/^\d+$/).required(),
});

// Middleware for validation
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Routes
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register
);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post(
  "/verify-2fa",
  authLimiter,
  validate(twoFactorSchema),
  authController.verifyTwoFactor
);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);

// Protected routes
router.get("/setup-2fa", authMiddleware, authController.setupTwoFactor);
router.post("/enable-2fa", authMiddleware, authController.enableTwoFactor);

module.exports = router;
