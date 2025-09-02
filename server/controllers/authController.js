const User = require("../models/User");
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const logger = require("../utils/logger");
const crypto = require("crypto");

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      });

      if (existingUser) {
        return res.status(400).json({
          error: "User already exists with this email or phone number",
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      await user.save();

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      logger.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password, deviceFingerprint } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if 2FA is enabled
      if (user.twoFactorAuth.enabled) {
        return res.json({
          requiresTwoFactor: true,
          userId: user._id,
        });
      }

      // Update device fingerprint
      if (deviceFingerprint) {
        const existingFingerprint =
          user.securitySettings.deviceFingerprints.find(
            (fp) => fp.fingerprint === deviceFingerprint
          );

        if (!existingFingerprint) {
          user.securitySettings.deviceFingerprints.push({
            fingerprint: deviceFingerprint,
            userAgent: req.headers["user-agent"],
            ip: req.ip,
          });
          await user.save();
        }
      }

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info(`User logged in: ${email}`);

      res.json({
        message: "Login successful",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  // Verify 2FA token
  async verifyTwoFactor(req, res) {
    try {
      const { userId, token } = req.body;

      const user = await User.findById(userId);
      if (!user || !user.twoFactorAuth.enabled) {
        return res.status(400).json({ error: "Invalid request" });
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: "base32",
        token,
        window: 2,
      });

      if (!verified) {
        return res.status(401).json({ error: "Invalid 2FA token" });
      }

      // Generate tokens
      const authToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      user.lastLogin = new Date();
      await user.save();

      res.json({
        message: "2FA verification successful",
        token: authToken,
        user: user.toJSON(),
      });
    } catch (error) {
      logger.error("2FA verification error:", error);
      res.status(500).json({ error: "2FA verification failed" });
    }
  }

  // Setup 2FA
  async setupTwoFactor(req, res) {
    try {
      const user = await User.findById(req.user._id);

      if (user.twoFactorAuth.enabled) {
        return res.status(400).json({ error: "2FA is already enabled" });
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `RemitXpress (${user.email})`,
        issuer: "RemitXpress",
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString("hex").toUpperCase()
      );

      // Save secret (but don't enable yet)
      user.twoFactorAuth.secret = secret.base32;
      user.twoFactorAuth.backupCodes = backupCodes;
      await user.save();

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        backupCodes,
      });
    } catch (error) {
      logger.error("2FA setup error:", error);
      res.status(500).json({ error: "2FA setup failed" });
    }
  }

  // Enable 2FA
  async enableTwoFactor(req, res) {
    try {
      const { token } = req.body;
      const user = await User.findById(req.user._id);

      if (!user.twoFactorAuth.secret) {
        return res.status(400).json({ error: "2FA setup not initiated" });
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: "base32",
        token,
        window: 2,
      });

      if (!verified) {
        return res.status(401).json({ error: "Invalid 2FA token" });
      }

      user.twoFactorAuth.enabled = true;
      await user.save();

      logger.info(`2FA enabled for user: ${user.email}`);

      res.json({ message: "2FA enabled successfully" });
    } catch (error) {
      logger.error("2FA enable error:", error);
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      logger.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token not provided" });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      const newToken = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ token: newToken });
    } catch (error) {
      logger.error("Refresh token error:", error);
      res.status(401).json({ error: "Invalid refresh token" });
    }
  }
}

module.exports = new AuthController();
